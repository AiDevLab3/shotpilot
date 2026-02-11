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

ANALYZE THIS SHOT:
${projectBlock}

${sceneBlock}

${shotBlock}

${characterBlock}

${objectBlock}

TASK:
1. Calculate completeness (0-100%) using Quality Control Pack criteria
2. Determine tier: "production" (>=70%) or "draft" (<70%)
3. For each missing or weak field, provide an expert recommendation

CRITICAL — VALID FIELDS ONLY:
You may ONLY flag fields from this exact list. Do NOT invent new fields.
Each "field" value in your response MUST be one of these exact strings:

  Shot fields:
    - "shot_description" (label: "Shot Description")
    - "shot_type" (label: "Shot Type")
    - "camera_angle" (label: "Camera Angle")
    - "camera_movement" (label: "Camera Movement")
    - "focal_length" (label: "Focal Length")
    - "camera_lens" (label: "Camera/Lens")
    - "blocking" (label: "Blocking/Staging")

  Scene fields (read-only context, flag if missing):
    - "scene_lighting_notes" (label: "Scene Lighting")
    - "scene_mood_tone" (label: "Scene Mood/Tone")
    - "scene_location_setting" (label: "Scene Location")
    - "scene_time_of_day" (label: "Time of Day")

  Project fields (read-only context, flag if missing):
    - "style_aesthetic" (label: "Project Style")

DO NOT include fields like "AI Model", "AI Video Model", "Atmospheric Details",
"Lighting Prompt Specifics", or any field not in the list above.
Model selection is handled separately — never recommend a model here.

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
            systemInstruction: 'You are an expert cinematographer. Analyze shot quality using the provided KB. Only flag fields from the provided valid field list. Output valid JSON only.',
            thinkingLevel,
            responseMimeType: 'application/json',
            maxOutputTokens: 4096,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse quality analysis JSON');
            }
        }

        // Post-process: strip any fields not in the valid set
        const VALID_FIELDS = new Set([
            'shot_description', 'shot_type', 'camera_angle', 'camera_movement',
            'focal_length', 'camera_lens', 'blocking',
            'scene_lighting_notes', 'scene_mood_tone', 'scene_location_setting', 'scene_time_of_day',
            'style_aesthetic',
        ]);

        if (parsed.missingFields && Array.isArray(parsed.missingFields)) {
            parsed.missingFields = parsed.missingFields.filter(f => VALID_FIELDS.has(f.field));
        }

        return parsed;
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

IMPORTANT: Only provide recommendations for the specific fields listed in MISSING FIELDS below.
Do NOT add extra fields. Do NOT recommend AI models — model selection is handled separately.
The "field" value in each response object must exactly match a field name from the MISSING FIELDS list.`;

    const userPrompt = `Based on this project, recommend values for missing fields:
${kbSection}
${projectBlock}

${sceneBlock}

${shotBlock}

MISSING FIELDS: ${missingFields.map(f => `"${f.field}" (${f.label || f.field})`).join(', ')}

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
- Reference characters by the EXACT NAME provided in the context (e.g. if name is "Property Manager", use "Property Manager").
- DO NOT invent new names or rename characters.
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

/**
 * Generate aesthetic suggestions for a project based on its context.
 * Returns AI-driven suggestions for style_aesthetic, atmosphere_mood,
 * lighting_directions, and cinematic_references.
 */
async function generateAestheticSuggestions(context) {
    const { project, scenes, kbContent } = context;

    const projectBlock = buildContextBlock('PROJECT', project);

    let scenesBlock = '';
    if (scenes && scenes.length > 0) {
        scenesBlock = 'SCENES:\n' + scenes.map(s => {
            const parts = [`  - ${s.name || 'Untitled'}`];
            if (s.location_setting) parts.push(`location: ${s.location_setting}`);
            if (s.mood_tone) parts.push(`mood: ${s.mood_tone}`);
            if (s.time_of_day) parts.push(`time: ${s.time_of_day}`);
            if (s.weather_atmosphere) parts.push(`weather: ${s.weather_atmosphere}`);
            return parts.join(', ');
        }).join('\n');
    }

    const systemInstruction = `You are an expert cinematographer and visual storyteller. Based on the project context, suggest aesthetic values for empty or weak fields. Ground suggestions in real cinematography principles. Be specific — name actual film references, lighting techniques, and visual styles. Each suggestion should feel like advice from a seasoned director of photography.`;

    // Define ALL Project Info fields to check
    const allProjectFields = [
        { field: 'frame_size', label: 'Frame Size (Aspect Ratio)', hint: 'Aspect ratio like 16:9, 2.39:1, 4:3' },
        { field: 'style_aesthetic', label: 'Style & Aesthetic', hint: 'Visual style, color palette, texture, film stock look' },
        { field: 'atmosphere_mood', label: 'Atmosphere & Mood', hint: 'Emotional tone, tension level, viewer feeling' },
        { field: 'lighting_directions', label: 'Lighting Directions', hint: 'Key light style, practical vs motivated, color temperature' },
        { field: 'purpose', label: 'Purpose', hint: 'Project intent: commercial, narrative film, music video, documentary' },
        { field: 'storyline_narrative', label: 'Storyline / Narrative', hint: 'Core story arc, theme, narrative structure' },
        { field: 'cinematography', label: 'Cinematography', hint: 'Camera philosophy, lens choices, movement style' },
        { field: 'cinematic_references', label: 'Cinematic References', hint: 'Reference films, directors, specific scenes to emulate' },
    ];

    // Find empty fields — treat null, undefined, empty string, and placeholder defaults as empty
    const isFieldEmpty = (value) => {
        if (!value || String(value).trim() === '') return true;
        const v = String(value).trim().toLowerCase();
        if (v === 'select aspect ratio' || v.startsWith('describe ') || v.startsWith('outline ') || v.startsWith('camera angles')) return true;
        return false;
    };

    const fieldsToSuggest = allProjectFields.filter(f => isFieldEmpty(project[f.field]));

    if (fieldsToSuggest.length === 0) {
        return [];
    }

    let kbSection = '';
    if (kbContent) {
        kbSection = `\nUse these cinematography principles:\n${kbContent}\n`;
    }

    const userPrompt = `Based on this project, generate aesthetic suggestions for missing fields.
${kbSection}
${projectBlock}

${scenesBlock}

FIELDS NEEDING SUGGESTIONS:
${fieldsToSuggest.map(f => `- "${f.field}" (${f.label}): ${f.hint}`).join('\n')}

For each field, provide a specific, actionable suggestion grounded in real cinematography.

OUTPUT VALID JSON ARRAY ONLY:
[
  {
    "field": "style_aesthetic",
    "value": "neo-noir realism",
    "reasoning": "Brief explanation of why this aesthetic fits the project (2-3 sentences)",
    "alternatives": ["alternative 1", "alternative 2"]
  }
]`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'medium',
            responseMimeType: 'application/json',
            maxOutputTokens: 2048,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse aesthetic suggestions JSON');
            }
        }

        // Validate: only return suggestions for fields we asked about
        const validFields = new Set(fieldsToSuggest.map(f => f.field));
        if (Array.isArray(parsed)) {
            parsed = parsed.filter(s => validFields.has(s.field));
        }

        return parsed;
    } catch (error) {
        console.error('[gemini] Aesthetic suggestions error:', error);
        throw error;
    }
}

/**
 * Phase 3.2: Generate detailed character bible suggestions.
 * Uses Character Consistency Pack to produce prompt-ready descriptions.
 */
async function generateCharacterSuggestions(context) {
    const { character, project, kbContent } = context;

    const projectBlock = buildContextBlock('PROJECT', project);

    const systemInstruction = `You are an expert character designer for AI-generated cinematography. Using the Character Consistency Pack, generate detailed character bible entries that will produce consistent results across AI image/video models. Every detail should be specific enough to reproduce exactly — no vague descriptions.`;

    const userPrompt = `Generate a detailed character bible for an AI filmmaking project.

${kbContent ? `Use these KB principles:\n${kbContent}\n` : ''}
${projectBlock}

CHARACTER NAME: ${character.name || 'Unnamed Character'}
${character.description ? `EXISTING DESCRIPTION: ${character.description}` : ''}
${character.personality ? `EXISTING PERSONALITY: ${character.personality}` : ''}

Generate comprehensive, prompt-ready character details following the Character Bible Checklist.

OUTPUT VALID JSON ONLY:
{
  "description": "Detailed physical description covering: face (eye color, nose shape, jawline, distinguishing marks), age & skin (specific age range, skin tone with undertones), hair (style, color, length, texture), build & posture (body type, posture habits), wardrobe (default clothing, accessories). Written as a dense paragraph optimized for AI image generation prompts.",
  "personality": "2-3 core personality traits with behavioral mannerisms. Written to guide expression and body language in generated images.",
  "referencePrompt": "A suggested prompt to generate a master reference image for this character using Midjourney or Nano Banana Pro. Include specific physical details, lighting, and framing.",
  "consistencyTips": ["Tip 1 for maintaining this character across shots", "Tip 2", "Tip 3"]
}`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'medium',
            responseMimeType: 'application/json',
            maxOutputTokens: 2048,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse character suggestions JSON');
            }
        }
        return parsed;
    } catch (error) {
        console.error('[gemini] Character suggestions error:', error);
        throw error;
    }
}

/**
 * Phase 3.3: Generate shot plan for a scene.
 * Returns a sequence of recommended shots with cinematography guidance.
 */
async function generateShotPlan(context) {
    const { scene, project, existingShots, kbContent } = context;

    const projectBlock = buildContextBlock('PROJECT', project);
    const sceneBlock = buildContextBlock('SCENE', scene);

    let existingShotsBlock = '';
    if (existingShots && existingShots.length > 0) {
        existingShotsBlock = '\nEXISTING SHOTS:\n' + existingShots.map((s, i) =>
            `  ${i + 1}. ${s.shot_type || 'unset'} — ${s.description || 'no description'}`
        ).join('\n');
    }

    const systemInstruction = `You are an expert cinematographer planning shot sequences. Use the Storyboard Shot Sequence framework (Opening Hook → Establishing → Detail → Action → Resolution) and Spatial Composition principles. Suggest shots that flow cinematically and cover the scene effectively. Each shot should be specific and actionable.`;

    const userPrompt = `Plan a shot sequence for this scene.

${kbContent ? `Use these KB principles:\n${kbContent}\n` : ''}
${projectBlock}

${sceneBlock}
${existingShotsBlock}

${existingShots && existingShots.length > 0
    ? 'Suggest additional shots to complement the existing ones. Do NOT duplicate what already exists.'
    : 'Suggest a complete shot sequence (3-7 shots) for this scene.'}

OUTPUT VALID JSON ONLY:
{
  "shots": [
    {
      "shot_number": "1",
      "shot_type": "Wide Shot",
      "camera_angle": "Eye Level",
      "camera_movement": "Static",
      "focal_length": "24mm",
      "description": "Specific description of what the shot captures",
      "blocking": "Character/object positions and actions",
      "purpose": "Why this shot exists in the sequence (e.g., establishing, detail, action)"
    }
  ],
  "sequenceReasoning": "Brief explanation of why this sequence works cinematically"
}`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'medium',
            responseMimeType: 'application/json',
            maxOutputTokens: 3072,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse shot plan JSON');
            }
        }
        return parsed;
    } catch (error) {
        console.error('[gemini] Shot plan error:', error);
        throw error;
    }
}

/**
 * Phase 3.4: Quality check dialogue — answer user questions about quality.
 * Supports multi-turn conversation about shot quality with KB context.
 */
async function qualityDialogue(context) {
    const { project, scene, shot, characters, objects, userMessage, history, qualityData, kbContent } = context;

    const projectBlock = buildContextBlock('PROJECT', project);
    const sceneBlock = buildContextBlock('SCENE', scene);
    const shotBlock = buildContextBlock('SHOT', shot);

    let historyBlock = '';
    if (history && history.length > 0) {
        historyBlock = '\nCONVERSATION HISTORY:\n' + history.map(h =>
            `${h.role === 'user' ? 'USER' : 'AI'}: ${h.content}`
        ).join('\n');
    }

    let qualityBlock = '';
    if (qualityData) {
        qualityBlock = `\nCURRENT QUALITY: ${qualityData.percentage}% (${qualityData.tier})`;
        if (qualityData.missingFields && qualityData.missingFields.length > 0) {
            qualityBlock += '\nMISSING FIELDS: ' + qualityData.missingFields.map(f => f.label || f.field).join(', ');
        }
    }

    const systemInstruction = `You are an expert cinematographer discussing shot quality with a filmmaker. Use KB knowledge to explain WHY things matter, discuss trade-offs, and suggest alternatives. Be conversational but authoritative. Reference specific KB principles when relevant. Keep responses concise (2-4 sentences for simple questions, up to a paragraph for complex ones).`;

    const userPrompt = `${kbContent ? `KB CONTEXT:\n${kbContent}\n` : ''}
${projectBlock}
${sceneBlock}
${shotBlock}
${qualityBlock}
${historyBlock}

USER QUESTION: ${userMessage}

Respond as an expert cinematographer. Reference KB principles where relevant. Be helpful and specific.`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'low',
            maxOutputTokens: 1024,
        });

        return { response: text.trim() };
    } catch (error) {
        console.error('[gemini] Quality dialogue error:', error);
        throw error;
    }
}

/**
 * Phase 3.5: Analyze a script and extract scenes/shots.
 */
async function analyzeScript(context) {
    const { scriptText, project, kbContent } = context;

    const projectBlock = buildContextBlock('PROJECT', project);

    const systemInstruction = `You are an expert script supervisor and cinematographer. Analyze the script text and identify scenes, key moments, and recommended shot coverage. Extract structured data that can be used to create scenes and shots in a storyboard application.`;

    const userPrompt = `Analyze this script and extract a structured scene/shot breakdown.

${kbContent ? `Use these cinematography principles:\n${kbContent}\n` : ''}
${projectBlock}

SCRIPT:
${scriptText.substring(0, 8000)}

Extract scenes and suggest shot coverage for each. Follow the Storyboard Shot Sequence framework.

OUTPUT VALID JSON ONLY:
{
  "scenes": [
    {
      "name": "Scene name/slug",
      "description": "Brief scene description",
      "location_setting": "Where the scene takes place",
      "time_of_day": "Day/Night/Dawn/Dusk",
      "mood_tone": "Emotional tone",
      "suggestedShots": [
        {
          "shot_type": "Wide Shot",
          "camera_angle": "Eye Level",
          "description": "What this shot captures",
          "purpose": "Why this shot is needed"
        }
      ]
    }
  ],
  "characters": [
    {
      "name": "Character name from script",
      "description": "Brief physical/role description inferred from script"
    }
  ],
  "summary": "Brief overall analysis of the script's visual needs"
}`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'high',
            responseMimeType: 'application/json',
            maxOutputTokens: 4096,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse script analysis JSON');
            }
        }
        return parsed;
    } catch (error) {
        console.error('[gemini] Script analysis error:', error);
        throw error;
    }
}

/**
 * Phase 3.6: Generate detailed object/prop suggestions.
 */
async function generateObjectSuggestions(context) {
    const { object, project, kbContent } = context;

    const projectBlock = buildContextBlock('PROJECT', project);

    const systemInstruction = `You are an expert prop master and production designer for AI-generated cinematography. Generate detailed object/prop descriptions that will produce consistent results across AI image/video models. Focus on material, color, condition, scale, and contextual placement.`;

    const userPrompt = `Generate a detailed object/prop description for an AI filmmaking project.

${kbContent ? `Use these KB principles:\n${kbContent}\n` : ''}
${projectBlock}

OBJECT NAME: ${object.name || 'Unnamed Object'}
${object.description ? `EXISTING DESCRIPTION: ${object.description}` : ''}

Generate comprehensive, prompt-ready object details.

OUTPUT VALID JSON ONLY:
{
  "description": "Detailed physical description covering: material, color, texture, condition (new/worn/damaged), dimensions/scale relative to human, distinctive features, contextual placement. Written as a dense paragraph optimized for AI image generation prompts.",
  "referencePrompt": "A suggested prompt to generate a master reference image for this object. Include specific material details, lighting, and framing.",
  "consistencyTips": ["Tip 1 for maintaining this object across shots", "Tip 2"]
}`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'medium',
            responseMimeType: 'application/json',
            maxOutputTokens: 1536,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse object suggestions JSON');
            }
        }
        return parsed;
    } catch (error) {
        console.error('[gemini] Object suggestions error:', error);
        throw error;
    }
}

/**
 * Refine character or object suggestions through conversation.
 * Returns { response, contentUpdate, kbFilesUsed }.
 */
async function refineContent(context) {
    const { type, currentContent, message, history, project, kbContent } = context;
    const projectBlock = buildContextBlock('PROJECT', project);

    const systemInstruction = `You are refining a ${type} for an AI filmmaking project through conversation with the user. Listen carefully and update ONLY what they ask for. Keep everything else unchanged.`;

    const historyParts = (history || []).map(m =>
        `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.content}`
    ).join('\n');

    const userPrompt = `${kbContent ? `KNOWLEDGE BASE:\n${kbContent}\n\n` : ''}${projectBlock}

CURRENT ${type.toUpperCase()}:
${JSON.stringify(currentContent, null, 2)}

${historyParts ? `CONVERSATION SO FAR:\n${historyParts}\n` : ''}
USER REQUEST: ${message}

Respond conversationally (1-3 sentences acknowledging the change), then provide the COMPLETE updated ${type} as JSON.

OUTPUT VALID JSON ONLY:
{
  "response": "Your conversational reply about the changes made",
  "contentUpdate": { <the full updated ${type} object with all fields, reflecting the requested changes> }
}`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'medium',
            responseMimeType: 'application/json',
            maxOutputTokens: 2048,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                return { response: text, contentUpdate: null };
            }
        }
        return parsed;
    } catch (error) {
        console.error(`[gemini] ${type} refinement error:`, error);
        throw error;
    }
}

/**
 * Phase 3 Creative Director: conversational project development.
 * Returns { response, projectUpdates, scriptUpdates, kbFilesUsed }.
 */
async function creativeDirectorCollaborate(context) {
    const { project, message, history, scriptContent, mode, kbContent, characters, objects, scenes, imageUrl, targetModel, modelKBContent } = context;
    const projectBlock = buildContextBlock('PROJECT', project);

    // Build context blocks for characters, objects, scenes
    let fullContext = projectBlock;
    if (characters && characters.length > 0) {
        fullContext += '\n\nCHARACTERS IN PROJECT:\n' + characters.map(c =>
            `- ${c.name}${c.description ? ': ' + c.description : ''}${c.personality ? ' | Personality: ' + c.personality : ''}`
        ).join('\n');
    }
    if (objects && objects.length > 0) {
        fullContext += '\n\nOBJECTS/PROPS IN PROJECT:\n' + objects.map(o =>
            `- ${o.name}${o.description ? ': ' + o.description : ''}`
        ).join('\n');
    }
    if (scenes && scenes.length > 0) {
        fullContext += '\n\nSCENES IN PROJECT:\n' + scenes.map(s =>
            `- ${s.name}${s.description ? ': ' + s.description : ''}${s.location_setting ? ' | Location: ' + s.location_setting : ''}`
        ).join('\n');
    }

    // Build model-specific instruction block
    const modelInstruction = targetModel
        ? `\nTARGET MODEL: ${targetModel}
You have the full ${targetModel} Prompting Mastery guide loaded below. When generating ANY prompts, image descriptions, or visual specifications:
- Use EXACT syntax, parameters, and formatting that ${targetModel} requires
- Follow the model's specific language profile from the Translation Matrix
- Include model-specific parameters (e.g. Midjourney uses --s, --ar, --cref; Nano Banana uses physics-based specs; Higgsfield uses camera rig language)
- NEVER generate generic prompts — every prompt MUST be optimized for ${targetModel}
- Reference the loaded KB guide for correct syntax and best practices`
        : `\nNO TARGET MODEL SELECTED. If the user asks for prompts, ask them to select a target model first using the model selector. Available models: Midjourney, Nano Banana Pro, Higgsfield Cinema Studio, GPT Image 1.5, VEO 3.1, Kling 2.6, Kling 3.0.`;

    const systemInstruction = `You are an expert AI Creative Director — a seasoned collaborator who helps filmmakers develop their projects from concept to camera-ready. You have deep knowledge of cinematography, visual storytelling, script analysis, production planning, AND model-specific prompt engineering.

YOUR ROLE:
You are the filmmaker's creative partner. You see the entire project — script, characters, objects, scenes, and all visual direction. Guide them through every creative decision with real expertise.
${modelInstruction}

INTERNAL WORKFLOW (follow these but NEVER reference them to the user):
1. SCRIPT FIRST: The script must be locked before committing to visual direction or image generation. If the user tries to jump to shots/visuals before the script is complete and cohesive, gently steer them back to finishing the script first — unless they explicitly say they want to skip ahead.
2. PROGRESSIVE DEVELOPMENT: Script → Characters & Objects → Visual Direction → Scene Planning → Shot Design.
3. When the user provides a script, analyze it thoroughly: extract scenes, identify characters, suggest locations, moods, and visual approaches.
4. When generating prompts, ALWAYS use the target model's specific syntax from the loaded KB.

TONE & STYLE (CRITICAL):
- Talk like a creative collaborator, NOT a rule-enforcing system. Never say things like "Following our Script First rule..." or "As per our workflow...". Just naturally guide the conversation.
- Be concise. Keep responses to 2-3 focused paragraphs max.
- Mention technical details (camera, lens, lighting) sparingly — only when directly relevant to a creative decision. Do NOT repeat camera specs in every response. One well-placed technical mention shows expertise; repeating it in every response becomes noise.
- Focus on the STORY and VISION. What does this scene FEEL like? What's the emotional intent? Technical specs support the vision, they don't lead it.
- NEVER write out full model-specific prompts in conversation. Prompt generation happens separately through the shot system. Your job here is creative direction — vision, story, character, mood — not prompt engineering. If the user asks for a prompt, tell them to use the Generate Prompt button on their shots in Scene Manager.

CHARACTER CREATION (CRITICAL):
- When characters are discussed, described, or extracted from a script, you MUST include them in the "characterCreations" output field.
- Each character needs at minimum a name and description. Include personality if discussed.
- This happens silently in the background — don't tell the user "I'm creating a character entry" unless they ask.

SCENE CREATION (CRITICAL):
- ONLY create scenes when the user EXPLICITLY asks for a scene breakdown, shot list, or says something like "create the scenes", "break it down into scenes", "generate the scene list", or "I'm ready for scenes".
- Do NOT create scenes automatically during script discussion, character development, or visual direction conversations. Finalize the script and direction FIRST.
- When triggered, create ALL scenes at once as a complete breakdown — not one at a time across multiple messages.
- Each scene needs: name, description, location_setting, time_of_day, mood_tone. Include suggestedShots if you have enough context.
- Each suggestedShot needs: shot_type (e.g. "Wide Shot", "Medium Shot", "Close-up"), camera_angle, description, and purpose.

PROJECT INFO FIELDS YOU CAN UPDATE:
- title, frame_size, purpose, lighting_directions, style_aesthetic, storyline_narrative, cinematography, atmosphere_mood, cinematic_references

IMAGE ANALYSIS (CRITICAL):
- When the user shares an image, your default behavior is to AUDIT it against the project's EXISTING visual direction. Use the Quality Control Visual Audit criteria:
  - Does the style match what's established? (lighting, color, mood, composition)
  - Is character identity consistent? (face, hair, wardrobe, build)
  - Does the lighting match the project's lighting direction?
  - Does the color/tonality match the established aesthetic?
- Report what aligns and what diverges. Do NOT update projectUpdates based on the image unless the user explicitly says they want to use this image to SET or LOCK the project style (e.g. "use this as our look", "match this style", "lock this aesthetic").
- If the image is a character reference, note how it fits the character's established description. Update the character description if the user asks you to.`;

    const historyParts = (history || []).slice(-14).map(m =>
        `${m.role === 'user' ? 'USER' : 'DIRECTOR'}: ${m.content}`
    ).join('\n');

    const userPrompt = `${modelKBContent ? `MODEL-SPECIFIC KNOWLEDGE BASE (${targetModel}):\n${modelKBContent}\n\n` : ''}${kbContent ? `CORE KNOWLEDGE BASE:\n${kbContent}\n\n` : ''}${fullContext}

${scriptContent ? `CURRENT SCRIPT:\n${scriptContent.substring(0, 5000)}\n` : 'NO SCRIPT YET.\n'}
MODE: ${mode || 'initial'}

${historyParts ? `RECENT CONVERSATION:\n${historyParts}\n` : ''}
USER: ${message}

Respond as the Creative Director. End with a question or clear next step.${targetModel ? ` Any prompts MUST use ${targetModel}-specific syntax from the loaded KB.` : ''}

OUTPUT VALID JSON ONLY:
{
  "response": "Your creative director response (markdown supported)",
  "projectUpdates": null or { "field_name": "suggested value", ... },
  "scriptUpdates": null or "updated script text if relevant",
  "characterCreations": null or [{ "name": "Character Name", "description": "Physical/visual description", "personality": "Personality traits" }],
  "sceneCreations": null or [{ "name": "Scene name", "description": "Scene description", "location_setting": "Where", "time_of_day": "Day/Night/Dawn/Dusk", "mood_tone": "Emotional tone", "suggestedShots": [{ "shot_type": "Wide Shot", "camera_angle": "Eye Level", "description": "What this shot captures", "purpose": "Why needed" }] }]
}`;

    // Build parts array — include image if provided
    const parts = [];
    if (imageUrl) {
        try {
            // imageUrl is a relative path like /uploads/images/filename
            // Use process.cwd() for path resolution (same pattern as buildImageParts)
            const imagePath = imageUrl.startsWith('/')
                ? path.join(process.cwd(), imageUrl)
                : imageUrl;

            if (fs.existsSync(imagePath)) {
                const imageData = fs.readFileSync(imagePath);
                // Multer dest mode may not add extensions — detect mime from file header bytes
                let mimeType = 'image/jpeg';
                const ext = path.extname(imagePath).toLowerCase();
                if (ext) {
                    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
                    mimeType = mimeMap[ext] || 'image/jpeg';
                } else {
                    // Detect from magic bytes
                    if (imageData[0] === 0x89 && imageData[1] === 0x50) mimeType = 'image/png';
                    else if (imageData[0] === 0x47 && imageData[1] === 0x49) mimeType = 'image/gif';
                    else if (imageData[0] === 0x52 && imageData[1] === 0x49) mimeType = 'image/webp';
                }
                parts.push({ inlineData: { mimeType, data: imageData.toString('base64') } });
                parts.push({ text: '↑ User shared this reference image.\n\n' + userPrompt });
            } else {
                console.warn('[gemini] Creative director: image file not found:', imagePath);
                parts.push({ text: userPrompt });
            }
        } catch (err) {
            console.warn('[gemini] Creative director: could not load image:', err.message);
            parts.push({ text: userPrompt });
        }
    } else {
        parts.push({ text: userPrompt });
    }

    try {
        const text = await callGemini({
            parts,
            systemInstruction,
            thinkingLevel: 'high',
            responseMimeType: 'application/json',
            maxOutputTokens: 3072,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                return { response: text, projectUpdates: null, scriptUpdates: null };
            }
        }
        return parsed;
    } catch (error) {
        console.error('[gemini] Creative director error:', error);
        throw error;
    }
}

export {
    generateRecommendations,
    generatePrompt,
    analyzeQuality,
    generateAestheticSuggestions,
    generateCharacterSuggestions,
    generateShotPlan,
    qualityDialogue,
    analyzeScript,
    generateObjectSuggestions,
    buildContextBlock,
    refineContent,
    creativeDirectorCollaborate,
};
