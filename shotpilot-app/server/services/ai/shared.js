import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Gemini API — use gemini-3-flash-preview (latest with thinking support)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Thinking budget levels mapped to token budgets
const THINKING_BUDGETS = {
    high: 24576,
    medium: 8192,
    low: 1024,
};

// ShotPilot Lite: only these 6 models are available (4 image + 2 video)
const AVAILABLE_MODELS_CONSTRAINT = `
CRITICAL CONSTRAINT — AVAILABLE MODELS:
ShotPilot Lite has exactly 6 models. You MUST match the correct type.

IMAGE models (for still image generation):
  1. Higgsfield Cinema Studio V1.5
  2. Midjourney
  3. Nano Banana Pro
  4. GPT Image 1.5

VIDEO models (for video/motion generation):
  5. VEO 3.1
  6. Kling 2.6

RULES:
- If the shot needs a STILL IMAGE, ONLY recommend from the 4 IMAGE models above.
- If the shot needs VIDEO/MOTION, ONLY recommend from the 2 VIDEO models above.
- DO NOT recommend Runway, Pika, Sora, DALL-E, Stable Diffusion, or any model not listed above.
- Default to IMAGE models unless the shot explicitly requires video or motion.`;

/**
 * Build a non-null context string from an object — only includes populated fields.
 */
function buildContextBlock(label, obj) {
    if (!obj) return '';
    const lines = Object.entries(obj)
        .filter(([key, val]) => {
            if (key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'user_id' || key === 'project_id' || key === 'scene_id') return false;
            return val !== null && val !== undefined && String(val).trim() !== '';
        })
        .map(([key, val]) => `  - ${key.replace(/_/g, ' ')}: ${val}`);
    if (lines.length === 0) return '';
    return `${label}:\n${lines.join('\n')}`;
}

/**
 * Build multimodal parts for reference images (characters + objects).
 * Returns array of parts to append to the Gemini request.
 */
function buildImageParts(characters, objects) {
    const parts = [];

    if (characters && characters.length > 0) {
        for (const char of characters) {
            if (char.reference_image_url) {
                try {
                    // reference_image_url is a relative path like /uploads/images/xxx
                    const imgPath = char.reference_image_url.startsWith('/')
                        ? path.join(process.cwd(), char.reference_image_url)
                        : char.reference_image_url;

                    if (fs.existsSync(imgPath)) {
                        const imageData = fs.readFileSync(imgPath);
                        const ext = path.extname(imgPath).toLowerCase();
                        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

                        parts.push({
                            inlineData: {
                                mimeType,
                                data: imageData.toString('base64'),
                            }
                        });
                        parts.push({
                            text: `↑ Character reference: ${char.name}${char.description ? ' - ' + char.description : ''}`
                        });
                    }
                } catch (err) {
                    console.warn(`[gemini] Could not load character image for ${char.name}:`, err.message);
                }
            }
        }
    }

    if (objects && objects.length > 0) {
        for (const obj of objects) {
            if (obj.reference_image_url) {
                try {
                    const imgPath = obj.reference_image_url.startsWith('/')
                        ? path.join(process.cwd(), obj.reference_image_url)
                        : obj.reference_image_url;

                    if (fs.existsSync(imgPath)) {
                        const imageData = fs.readFileSync(imgPath);
                        const ext = path.extname(imgPath).toLowerCase();
                        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

                        parts.push({
                            inlineData: {
                                mimeType,
                                data: imageData.toString('base64'),
                            }
                        });
                        parts.push({
                            text: `↑ Object reference: ${obj.name}${obj.description ? ' - ' + obj.description : ''}`
                        });
                    }
                } catch (err) {
                    console.warn(`[gemini] Could not load object image for ${obj.name}:`, err.message);
                }
            }
        }
    }

    return parts;
}

/**
 * Core Gemini API call with thinking support.
 */
async function callGemini({ parts, systemInstruction, thinkingLevel = 'high', responseMimeType, temperature, maxOutputTokens = 4096 }) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const generationConfig = {
        maxOutputTokens,
        thinkingConfig: {
            thinkingBudget: THINKING_BUDGETS[thinkingLevel] || THINKING_BUDGETS.high,
        },
    };

    // Only set temperature if explicitly provided (Gemini default is 1.0)
    if (temperature !== undefined) {
        generationConfig.temperature = temperature;
    }

    if (responseMimeType) {
        generationConfig.responseMimeType = responseMimeType;
    }

    const body = {
        contents: [{ parts }],
        generationConfig,
    };

    if (systemInstruction) {
        body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    // Extract text from candidates — skip thought parts, get the actual text
    const candidate = data.candidates?.[0];
    if (!candidate?.content?.parts) {
        throw new Error('No response from Gemini');
    }

    // Find the text part (not thought)
    const textParts = candidate.content.parts.filter(p => p.text !== undefined && !p.thought);
    const text = textParts.map(p => p.text).join('');

    return text;
}

export {
    GEMINI_MODEL,
    GEMINI_API_URL,
    THINKING_BUDGETS,
    AVAILABLE_MODELS_CONSTRAINT,
    buildContextBlock,
    buildImageParts,
    callGemini,
};
