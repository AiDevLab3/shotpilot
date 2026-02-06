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
const AVAILABLE_MODELS = [
    'Higgsfield Cinema Studio V1.5 (image)',
    'Midjourney (image)',
    'Nano Banana Pro (image)',
    'GPT Image 1.5 (image)',
    'VEO 3.1 (video)',
    'Kling 2.6 (video)',
];

const AVAILABLE_MODELS_CONSTRAINT = `
CRITICAL CONSTRAINT — AVAILABLE MODELS:
Only recommend from these 6 models available in ShotPilot Lite:
${AVAILABLE_MODELS.map((m, i) => `  ${i + 1}. ${m}`).join('\n')}

DO NOT recommend Runway, Pika, Sora, DALL-E, Stable Diffusion, or any other models not listed above.
When suggesting a model, choose from the 6 available models based on shot characteristics and KB guidance.`;

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

/**
 * FIX 2: KB-Guided Quality Analysis using Quality Control Pack + Core Principles.
 */
async function analyzeQuality({ context, kbContent, thinkingLevel = 'high' }) {
    const { project, scene, shot, characters, objects } = context;

    const projectBlock = buildContextBlock('PROJECT', project);
    const sceneBlock = buildContextBlock('SCENE', scene);
    const shotBlock = buildContextBlock('SHOT', shot);

    let characterBlock = '';
    if (characters && characters.length > 0) {
        characterBlock = 'CHARACTERS:\n' + characters.map(c =>
            `  - ${c.name}: ${c.description || 'No description'}${c.reference_image_url ? ' [has reference image]' : ''}`
        ).join('\n');
    }

    let objectBlock = '';
    if (objects && objects.length > 0) {
        objectBlock = 'OBJECTS:\n' + objects.map(o =>
            `  - ${o.name}: ${o.description || 'No description'}${o.reference_image_url ? ' [has reference image]' : ''}`
        ).join('\n');
    }

    const prompt = `You are an expert cinematographer analyzing shot completeness for AI image/video generation.

Use these KB principles for your analysis:
${kbContent}
${AVAILABLE_MODELS_CONSTRAINT}

ANALYZE THIS SHOT:
${projectBlock}

${sceneBlock}

${shotBlock}

${characterBlock}

${objectBlock}

TASK:
1. Calculate completeness (0-100%) using Quality Control Pack criteria
2. Determine tier: "production" (>=70%) or "draft" (<70%)
3. For each missing or weak field, provide:
   - Expert recommendation based on KB rules
   - Reasoning referencing the specific project context
   - 2-3 alternatives
4. If recommending an AI model, ONLY choose from the 6 available models listed above

OUTPUT VALID JSON ONLY:
{
  "completeness": 65,
  "tier": "draft",
  "missingFields": [
    {
      "field": "focal_length",
      "label": "Focal Length",
      "recommendation": "85mm",
      "reasoning": "Extreme close-up in noir aesthetic requires longer focal length for compression and dramatic intensity (per Core Realism Principles)",
      "alternatives": ["100mm", "70mm"]
    }
  ]
}`;

    try {
        const text = await callGemini({
            parts: [{ text: prompt }],
            systemInstruction: 'You are an expert cinematographer. Analyze shot quality using the provided KB. Output valid JSON only.',
            thinkingLevel,
            responseMimeType: 'application/json',
            maxOutputTokens: 4096,
        });

        try {
            return JSON.parse(text);
        } catch (e) {
            // Fallback: extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Could not parse quality analysis JSON');
        }
    } catch (error) {
        console.error('[gemini] Quality analysis error:', error);
        throw error;
    }
}

/**
 * Generate field recommendations for missing/weak fields.
 * Uses KB content for context-aware suggestions.
 */
async function generateRecommendations(context) {
    const { project, scene, shot, missingFields, kbContent } = context;

    const projectBlock = buildContextBlock('PROJECT', project);
    const sceneBlock = buildContextBlock('SCENE', scene);
    const shotBlock = buildContextBlock('SHOT', shot);

    let kbSection = '';
    if (kbContent) {
        kbSection = `\nUse these KB principles for your recommendations:\n${kbContent}\n`;
    }

    const systemInstruction = `You are an expert cinematographer and director. Recommend appropriate values for missing fields based on context. For each field provide:
1. Specific recommendation
2. Clear reasoning (reference their specific context)
3. 2-3 alternatives

Be educational but concise.
${AVAILABLE_MODELS_CONSTRAINT}`;

    const userPrompt = `Based on this project, recommend values for missing fields:
${kbSection}
${projectBlock}

${sceneBlock}

${shotBlock}

MISSING FIELDS: ${missingFields.map(f => f.label || f.field).join(', ')}

Output valid JSON array only:
[
  {
    "field": "field_name",
    "recommendation": "specific recommendation",
    "reasoning": "why this makes sense (2-3 sentences)",
    "alternatives": ["option 1", "option 2", "option 3"]
  }
]`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'high',
            responseMimeType: 'application/json',
            maxOutputTokens: 2048,
        });

        try {
            return JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Could not parse recommendations JSON');
        }
    } catch (error) {
        console.error('[gemini] Recommendations error:', error);
        throw error;
    }
}

/**
 * FIX 3+4: Generate a model-specific AI prompt with full context + multimodal references.
 * Queries ALL fields, includes characters/objects, sends reference images.
 */
async function generatePrompt(context) {
    const { project, scene, shot, characters, objects, modelName, kbContent, qualityTier } = context;

    const projectBlock = buildContextBlock('PROJECT', project);
    const sceneBlock = buildContextBlock('SCENE', scene);
    const shotBlock = buildContextBlock('SHOT', shot);

    // Build character context (by name, not generic descriptions)
    let characterBlock = '';
    if (characters && characters.length > 0) {
        characterBlock = '\nCHARACTERS IN PROJECT:\n' + characters.map(c => {
            let line = `  - ${c.name}`;
            if (c.description) line += `: ${c.description}`;
            if (c.personality) line += ` (personality: ${c.personality})`;
            if (c.reference_image_url) line += ' [reference image attached below]';
            return line;
        }).join('\n');
    }

    let objectBlock = '';
    if (objects && objects.length > 0) {
        objectBlock = '\nOBJECTS IN PROJECT:\n' + objects.map(o => {
            let line = `  - ${o.name}`;
            if (o.description) line += `: ${o.description}`;
            if (o.reference_image_url) line += ' [reference image attached below]';
            return line;
        }).join('\n');
    }

    const systemInstruction = `You are an expert AI filmmaker specializing in ${modelName}. Generate precise prompts using the model-specific KB provided. Follow EXACT syntax from KB. Shot details override scene/project (hierarchical priority).

CRITICAL RULES:
- Reference characters by NAME (e.g., "Sarah" not "a woman" or "a property manager")
- If reference images are attached, mention using them for visual consistency
- Follow the KB formatting rules exactly for the target model`;

    const userPrompt = `Generate ${modelName} prompt.

QUALITY: ${qualityTier.toUpperCase()}
${qualityTier === 'draft' ? '⚠️ Some context missing - make inferences' : '✅ Full context available'}

PRIORITY: Shot > Scene > Project

${projectBlock}

${sceneBlock}

${shotBlock}
${characterBlock}
${objectBlock}

KB - ${modelName.toUpperCase()}:
${kbContent}

OUTPUT FORMAT:
[CLEAN PROMPT - NO PREAMBLE]

// AI Assumptions:
// - [list inferences made]`;

    // Build multimodal parts: text + reference images
    const parts = [{ text: userPrompt }];

    // FIX 4: Attach reference images for characters and objects
    const imageParts = buildImageParts(characters, objects);
    parts.push(...imageParts);

    try {
        const text = await callGemini({
            parts,
            systemInstruction,
            thinkingLevel: 'high',
            maxOutputTokens: 4096,
        });

        // Split on assumptions marker
        const splitParts = text.split(/\/\/ AI Assumptions/i);
        const prompt = splitParts[0].trim().replace(/^```.*\n?/gm, '').replace(/```$/gm, '').trim();
        const assumptions = splitParts[1] ? splitParts[1].trim() : null;

        return { prompt, assumptions };
    } catch (error) {
        console.error('[gemini] Prompt generation error:', error);
        throw error;
    }
}

export {
    generateRecommendations,
    generatePrompt,
    analyzeQuality,
    buildContextBlock,
};
