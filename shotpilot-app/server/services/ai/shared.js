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
 * Returns { parts, imageMap } where imageMap is a numbered list of which
 * image corresponds to which entity (for use in the generated prompt).
 */
function buildImageParts(characters, objects) {
    const parts = [];
    const imageMap = []; // { imageNum, type, name, description }
    let imageNum = 1;

    if (characters && characters.length > 0) {
        for (const char of characters) {
            if (char.reference_image_url) {
                try {
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
                            text: `↑ Image ${imageNum} — Character reference: ${char.name}${char.description ? ' - ' + char.description : ''}`
                        });
                        imageMap.push({
                            imageNum,
                            type: 'character',
                            name: char.name,
                            description: char.description || '',
                        });
                        imageNum++;
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
                            text: `↑ Image ${imageNum} — Object reference: ${obj.name}${obj.description ? ' - ' + obj.description : ''}`
                        });
                        imageMap.push({
                            imageNum,
                            type: 'object',
                            name: obj.name,
                            description: obj.description || '',
                        });
                        imageNum++;
                    }
                } catch (err) {
                    console.warn(`[gemini] Could not load object image for ${obj.name}:`, err.message);
                }
            }
        }
    }

    return { parts, imageMap };
}

/**
 * Core Gemini API call with thinking support and retry logic.
 * Retries up to 3 times with exponential backoff on transient errors (429, 503, network).
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

    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 3000, 8000]; // exponential backoff: 1s, 3s, 8s
    const TIMEOUT_MS = 120000; // 2 minute timeout per attempt

    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Retry on rate limit or server errors
            if (response.status === 429 || response.status === 503) {
                const errText = await response.text();
                lastError = new Error(`Gemini API error: ${response.status} - ${errText}`);
                console.warn(`[callGemini] Attempt ${attempt + 1}/${MAX_RETRIES} got ${response.status}, retrying in ${RETRY_DELAYS[attempt]}ms...`);
                await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
                continue;
            }

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
            let text = textParts.map(p => p.text).join('');

            // Strip markdown code fences that Gemini sometimes wraps around JSON responses
            text = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

            return text;
        } catch (err) {
            lastError = err;

            // Retry on network errors and timeouts, but not on other errors
            const isRetryable = err.name === 'AbortError' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.type === 'system';
            if (isRetryable && attempt < MAX_RETRIES - 1) {
                console.warn(`[callGemini] Attempt ${attempt + 1}/${MAX_RETRIES} failed (${err.message}), retrying in ${RETRY_DELAYS[attempt]}ms...`);
                await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
                continue;
            }

            throw err;
        }
    }

    throw lastError;
}

export {
    GEMINI_MODEL,
    GEMINI_API_URL,
    THINKING_BUDGETS,
    buildContextBlock,
    buildImageParts,
    callGemini,
};
