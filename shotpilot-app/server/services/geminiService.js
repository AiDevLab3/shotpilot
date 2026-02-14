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
 * KB-Guided Prompt Readiness Analysis using Quality Control Pack + Core Principles.
 * Scores how completely a shot is defined for prompt generation (field completeness).
 * This is NOT image quality analysis — see holisticImageAudit() for actual image scoring.
 */
async function analyzeReadiness({ context, kbContent, thinkingLevel = 'high' }) {
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
            systemInstruction: 'You are an expert cinematographer. Analyze shot readiness for prompt generation using the provided KB. Only flag fields from the provided valid field list. Output valid JSON only.',
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
        console.error('[gemini] Readiness analysis error:', error);
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
 * Phase 3.4: Prompt readiness dialogue — answer user questions about shot readiness.
 * Supports multi-turn conversation about prompt readiness with KB context.
 */
async function readinessDialogue(context) {
    const { project, scene, shot, characters, objects, userMessage, history, readinessData, kbContent } = context;

    const projectBlock = buildContextBlock('PROJECT', project);
    const sceneBlock = buildContextBlock('SCENE', scene);
    const shotBlock = buildContextBlock('SHOT', shot);

    let historyBlock = '';
    if (history && history.length > 0) {
        historyBlock = '\nCONVERSATION HISTORY:\n' + history.map(h =>
            `${h.role === 'user' ? 'USER' : 'AI'}: ${h.content}`
        ).join('\n');
    }

    let readinessBlock = '';
    if (readinessData) {
        readinessBlock = `\nCURRENT READINESS: ${readinessData.percentage}% (${readinessData.tier})`;
        if (readinessData.missingFields && readinessData.missingFields.length > 0) {
            readinessBlock += '\nMISSING FIELDS: ' + readinessData.missingFields.map(f => f.label || f.field).join(', ');
        }
    }

    const systemInstruction = `You are an expert cinematographer discussing shot prompt readiness with a filmmaker. Use KB knowledge to explain WHY things matter, discuss trade-offs, and suggest alternatives. Be conversational but authoritative. Reference specific KB principles when relevant. Keep responses concise (2-4 sentences for simple questions, up to a paragraph for complex ones).`;

    const userPrompt = `${kbContent ? `KB CONTEXT:\n${kbContent}\n` : ''}
${projectBlock}
${sceneBlock}
${shotBlock}
${readinessBlock}
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
        console.error('[gemini] Readiness dialogue error:', error);
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
- Include model-specific parameters (e.g. Midjourney uses --s, --ar, --oref; Nano Banana uses physics-based specs; Higgsfield uses camera rig language)
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

    // Format history — handle compacted summary messages specially
    const recentHistory = (history || []).slice(-14);
    const historyParts = recentHistory.map(m => {
        if (m.role === 'summary') return `[CONTEXT DIGEST — earlier conversation compacted]:\n${m.content}`;
        return `${m.role === 'user' ? 'USER' : 'DIRECTOR'}: ${m.content}`;
    }).join('\n');

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
  "scriptUpdates": null or "THE COMPLETE FULL SCRIPT with changes integrated — NEVER a partial fragment. If you modify one scene, you MUST return the entire script including ALL unchanged scenes. If the script is too long to return in full, set scriptUpdates to null and describe the changes in your response instead so the user can make the edit manually.",
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
            // Fallback 1: Extract JSON object from surrounding text
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    parsed = JSON.parse(jsonMatch[0]);
                } catch (e2) {
                    // Fallback 2: Try to sanitize common JSON issues (trailing commas, unescaped newlines in strings)
                    let sanitized = jsonMatch[0]
                        .replace(/,\s*([}\]])/g, '$1')           // trailing commas
                        .replace(/[\x00-\x1f]/g, (ch) =>         // control chars in strings
                            ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : ch === '\t' ? '\\t' : ''
                        );
                    try {
                        parsed = JSON.parse(sanitized);
                    } catch (e3) {
                        // Fallback 3: Extract just the response text so user sees something useful
                        console.warn('[gemini] Could not parse Creative Director JSON, extracting response text');
                        const responseMatch = text.match(/"response"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                        const responseText = responseMatch
                            ? responseMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
                            : text.substring(0, 500);
                        parsed = { response: responseText, projectUpdates: null, scriptUpdates: null, characterCreations: null, sceneCreations: null };
                    }
                }
            } else {
                parsed = { response: text, projectUpdates: null, scriptUpdates: null, characterCreations: null, sceneCreations: null };
            }
        }
        return parsed;
    } catch (error) {
        console.error('[gemini] Creative director error:', error);
        throw error;
    }
}

/**
 * Summarize/compact a Creative Director conversation into a concise context digest.
 * Preserves key creative decisions, character/scene notes, style direction, and script state.
 */
async function summarizeConversation({ messages, scriptContent, projectTitle }) {
    const systemInstruction = `You are an expert conversation summarizer for a cinematography AI tool called ShotPilot.
Your job is to distill a Creative Director conversation into a concise CONTEXT DIGEST that preserves every important creative decision while discarding conversational filler.

OUTPUT FORMAT — return valid JSON:
{
  "summary": "A concise paragraph (3-6 sentences) capturing the creative vision, decisions made, and current direction.",
  "keyDecisions": ["decision 1", "decision 2", ...],
  "characterNotes": "Any character details discussed (or null if none)",
  "sceneNotes": "Any scene/shot details discussed (or null if none)",
  "styleDirection": "Visual style, lighting, mood, cinematography notes (or null if none)",
  "openQuestions": "Anything left unresolved or still being explored (or null if none)"
}

RULES:
- Be concise but preserve EVERY creative decision and specific detail (names, styles, references, technical choices)
- Discard greetings, pleasantries, workflow explanations, error messages, and repeated content
- If the user gave a script or story outline, summarize the plot briefly — don't reproduce the full text
- Preserve any model-specific notes (e.g. "targeting Higgsfield", "anamorphic 2.39:1")`;

    const conversationText = messages.map(m =>
        `${m.role === 'user' ? 'USER' : 'DIRECTOR'}: ${m.content}`
    ).join('\n\n');

    const userPrompt = `PROJECT: ${projectTitle || 'Untitled'}
${scriptContent ? `SCRIPT STATUS: Script exists (${scriptContent.length} chars)` : 'NO SCRIPT YET'}

CONVERSATION TO SUMMARIZE:
${conversationText}

Summarize this conversation into a context digest.`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'low',
            responseMimeType: 'application/json',
            maxOutputTokens: 1024,
        });

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                return { summary: text, keyDecisions: [], characterNotes: null, sceneNotes: null, styleDirection: null, openQuestions: null };
            }
        }
        return parsed;
    } catch (error) {
        console.error('[gemini] Summarize conversation error:', error);
        throw error;
    }
}

/**
 * HOLISTIC IMAGE AUDIT — The real quality system.
 * Analyzes an actual generated/uploaded image across 6 cinematic dimensions
 * using Gemini's multimodal vision capabilities.
 *
 * Returns scores (0-10 per dimension, 0-100 overall), recommendation
 * (LOCK IT IN / REFINE / REGENERATE), specific issues, and prompt adjustments.
 */
async function holisticImageAudit({ imageBuffer, mimeType, project, scene, shot, characters, objects, kbContent }) {
    const projectBlock = buildContextBlock('PROJECT', project);
    const sceneBlock = scene ? buildContextBlock('SCENE', {
        name: scene.name,
        location_setting: scene.location_setting,
        time_of_day: scene.time_of_day,
        mood_tone: scene.mood_tone,
        lighting_notes: scene.lighting_notes,
    }) : '';
    const shotBlock = shot ? buildContextBlock('SHOT', {
        shot_number: shot.shot_number,
        description: shot.description,
        shot_type: shot.shot_type,
        camera_angle: shot.camera_angle,
        camera_movement: shot.camera_movement,
        focal_length: shot.focal_length,
        camera_lens: shot.camera_lens,
        blocking: shot.blocking,
    }) : '';

    let characterBlock = '';
    if (characters && characters.length > 0) {
        characterBlock = '\nCHARACTERS (check identity consistency):\n' + characters.map(c =>
            `- ${c.name}: ${c.description || 'No description'}${c.personality ? ' | ' + c.personality : ''}`
        ).join('\n');
    }

    let objectBlock = '';
    if (objects && objects.length > 0) {
        objectBlock = '\nOBJECTS/PROPS (check placement & scale):\n' + objects.map(o =>
            `- ${o.name}: ${o.description || 'No description'}`
        ).join('\n');
    }

    const systemInstruction = `You are an expert Holistic Image Auditor for AI-generated cinematography. You analyze images with the eye of a seasoned Director of Photography, evaluating them across 6 critical dimensions for professional production quality.

Your analysis must be precise, actionable, and grounded in real cinematography principles. Score honestly — a mediocre AI-generated image should NOT score 90+. Reserve high scores for genuinely production-quality results.

SCORING GUIDELINES:
- 0-3: Severe issues, fundamentally broken
- 4-5: Below average, noticeable problems
- 6-7: Acceptable with clear room for improvement
- 8-9: Strong, minor refinements only
- 10: Exceptional, professional production quality

OVERALL SCORE = weighted sum of dimensions (not a simple average):
- Physics (weight 2): 20% of total
- Style Consistency (weight 2): 20% of total
- Lighting & Atmosphere (weight 1.5): 15% of total
- Clarity (weight 1): 10% of total
- Objects & Composition (weight 1.5): 15% of total
- Character Identity (weight 2): 20% of total

RECOMMENDATION THRESHOLDS:
- LOCK IT IN: 95-100 (exceptional, ready for production)
- REFINE: 70-94 (good foundation, targeted improvements needed)
- REGENERATE: 0-69 (fundamental issues, needs new generation with adjusted prompt)

REALISM DIAGNOSIS — Check for these 4 common AI image failure patterns:

1. "AI Plastic Look" — Overly crisp micro-contrast, HDR glow/haloing, plastic/waxy skin, perfectly clean gradients (no natural noise), sterile symmetry, unrealistic bokeh, surfaces too glossy/clean/new, unmotivated flat lighting. CAUSE: Kill-switch terms in prompt ("hyper detailed," "8K," "perfect skin"), no entropy, unmotivated lighting. FIX: Remove killer terms, add filmic tonality + grain, specify motivated lighting + falloff, add subtle entropy.

2. "Flat / Lifeless" — No directional light, no contrast ratio, no atmosphere depth cues, image feels two-dimensional and unengaging. CAUSE: No directional light specified, no fill/contrast control, no atmosphere. FIX: Specify key light direction + quality, add negative space and subject separation, add subtle haze/dust if appropriate.

3. "CGI / Game Engine Look" — Glossy highlights with perfect edges, too much micro-contrast, render-like background sharpness, volumetrics that look like smoke simulation. CAUSE: Excessive global sharpness, render-like lighting, no lens imperfections. FIX: Soften tonality, add rolloff, reduce global sharpness, add subtle lens imperfections, enforce photographic anchor language ("captured through a physical lens").

4. "Lighting Drift" — Light direction and source inconsistent within image or doesn't match scene intent, shadows fall in wrong direction, multiple conflicting light sources without motivation. CAUSE: Light direction and source not locked. FIX: Define scene-level lighting lock (source + direction + quality + contrast ratio), treat lighting as canon.

For each pattern detected, classify severity as "severe" (dominates the image), "moderate" (noticeable but not dominant), or "none" (not present). Only flag patterns that are actually present.`;

    const userPrompt = `${kbContent ? `KNOWLEDGE BASE (use for evaluation criteria):\n${kbContent}\n\n` : ''}${projectBlock}
${sceneBlock}
${shotBlock}
${characterBlock}
${objectBlock}

Analyze the uploaded image across ALL 6 dimensions. Compare against the project DNA, scene context, and shot intent described above.

For each dimension, provide:
1. A score (0-10)
2. Specific observations (what works, what doesn't)

Then provide:
- Overall weighted score (0-100)
- Recommendation (LOCK IT IN / REFINE / REGENERATE)
- List of specific issues found
- Suggested prompt adjustments to fix identified issues

OUTPUT VALID JSON ONLY:
{
  "overall_score": <0-100>,
  "recommendation": "LOCK IT IN" | "REFINE" | "REGENERATE",
  "dimensions": {
    "physics": {
      "score": <0-10>,
      "notes": "Analysis of lighting direction consistency, shadow accuracy, perspective/vanishing points, physical plausibility of objects and their interactions, gravity, reflections"
    },
    "style_consistency": {
      "score": <0-10>,
      "notes": "How well the image matches the project's established aesthetic, tone, mood, color palette, and visual language. Check for AI artifacts like HDR sheen, plastic textures, or over-processed look"
    },
    "lighting_atmosphere": {
      "score": <0-10>,
      "notes": "Artistic intent of lighting, motivated light sources, atmospheric depth (haze, volumetrics), contrast ratio, color temperature consistency, key/fill/rim balance"
    },
    "clarity": {
      "score": <0-10>,
      "notes": "Sharpness where needed, appropriate depth of field, focus accuracy, absence of unwanted blur/noise, optical quality matching specified lens character"
    },
    "composition": {
      "score": <0-10>,
      "notes": "Subject placement, rule of thirds/golden ratio, leading lines, negative space, scale relationships, foreground/midground/background layering, framing that matches specified shot type"
    },
    "character_identity": {
      "score": <0-10>,
      "notes": "Facial accuracy, clothing/wardrobe consistency with character descriptions, body proportions, expression appropriateness for scene context, absence of uncanny valley artifacts"
    }
  },
  "issues": ["Specific issue 1", "Specific issue 2"],
  "prompt_adjustments": ["Suggested fix 1 — add/modify this in the prompt", "Suggested fix 2"],
  "realism_diagnosis": [
    {
      "pattern": "AI Plastic Look" | "Flat / Lifeless" | "CGI / Game Engine Look" | "Lighting Drift",
      "severity": "severe" | "moderate",
      "details": "What specifically triggers this diagnosis in the image",
      "fix": "Specific prompt-level fix from the Core Realism Principles"
    }
  ],
  "summary": "2-3 sentence overall assessment"
}`;

    // Build parts: image first, then text prompt
    const parts = [
        {
            inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBuffer.toString('base64'),
            }
        },
        { text: '↑ Analyze this image using the Holistic Image Audit framework.\n\n' + userPrompt }
    ];

    try {
        const text = await callGemini({
            parts,
            systemInstruction,
            thinkingLevel: 'high',
            // Note: responseMimeType omitted — Gemini thinking mode with inline
            // image data does not reliably support forced JSON response mode.
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
                throw new Error('Could not parse holistic audit JSON');
            }
        }

        // Validate and normalize the response
        const result = {
            overall_score: Math.min(100, Math.max(0, parsed.overall_score || 0)),
            recommendation: ['LOCK IT IN', 'REFINE', 'REGENERATE'].includes(parsed.recommendation)
                ? parsed.recommendation
                : (parsed.overall_score >= 95 ? 'LOCK IT IN' : parsed.overall_score >= 70 ? 'REFINE' : 'REGENERATE'),
            dimensions: {
                physics: { score: Math.min(10, Math.max(0, parsed.dimensions?.physics?.score || 0)), notes: parsed.dimensions?.physics?.notes || '' },
                style_consistency: { score: Math.min(10, Math.max(0, parsed.dimensions?.style_consistency?.score || 0)), notes: parsed.dimensions?.style_consistency?.notes || '' },
                lighting_atmosphere: { score: Math.min(10, Math.max(0, parsed.dimensions?.lighting_atmosphere?.score || 0)), notes: parsed.dimensions?.lighting_atmosphere?.notes || '' },
                clarity: { score: Math.min(10, Math.max(0, parsed.dimensions?.clarity?.score || 0)), notes: parsed.dimensions?.clarity?.notes || '' },
                composition: { score: Math.min(10, Math.max(0, parsed.dimensions?.composition?.score || 0)), notes: parsed.dimensions?.composition?.notes || '' },
                character_identity: { score: Math.min(10, Math.max(0, parsed.dimensions?.character_identity?.score || 0)), notes: parsed.dimensions?.character_identity?.notes || '' },
            },
            issues: Array.isArray(parsed.issues) ? parsed.issues : [],
            prompt_adjustments: Array.isArray(parsed.prompt_adjustments) ? parsed.prompt_adjustments : [],
            realism_diagnosis: Array.isArray(parsed.realism_diagnosis)
                ? parsed.realism_diagnosis.filter(d => d && d.pattern && d.severity && d.severity !== 'none')
                : [],
            summary: parsed.summary || '',
        };

        return result;
    } catch (error) {
        console.error('[gemini] Holistic image audit error:', error);
        throw error;
    }
}

/**
 * AI-powered prompt refinement based on audit results and model-specific KB.
 * Takes the original prompt, audit feedback, and model KB, then generates a corrected prompt.
 */
async function refinePromptFromAudit({ originalPrompt, auditResult, modelName, modelKBContent, project, scene, shot, characters, objects }) {
    const projectBlock = buildContextBlock('PROJECT', project);
    const sceneBlock = scene ? buildContextBlock('SCENE', {
        name: scene.name,
        location_setting: scene.location_setting,
        time_of_day: scene.time_of_day,
        mood_tone: scene.mood_tone,
        lighting_notes: scene.lighting_notes,
    }) : '';
    const shotBlock = shot ? buildContextBlock('SHOT', {
        shot_number: shot.shot_number,
        description: shot.description,
        shot_type: shot.shot_type,
        camera_angle: shot.camera_angle,
        camera_movement: shot.camera_movement,
        focal_length: shot.focal_length,
        camera_lens: shot.camera_lens,
        blocking: shot.blocking,
    }) : '';

    let characterBlock = '';
    if (characters && characters.length > 0) {
        characterBlock = '\nCHARACTERS:\n' + characters.map(c =>
            `- ${c.name}: ${c.description || 'No description'}${c.personality ? ' | ' + c.personality : ''}`
        ).join('\n');
    }

    let objectBlock = '';
    if (objects && objects.length > 0) {
        objectBlock = '\nOBJECTS/PROPS:\n' + objects.map(o =>
            `- ${o.name}: ${o.description || 'No description'}`
        ).join('\n');
    }

    // Build issues + adjustments summary from audit
    const issuesList = (auditResult.issues || []).map((iss, i) => `${i + 1}. ${iss}`).join('\n');
    const adjustmentsList = (auditResult.prompt_adjustments || []).map((adj, i) => `${i + 1}. ${adj}`).join('\n');

    const dimensionSummary = Object.entries(auditResult.dimensions || {}).map(([key, dim]) =>
        `- ${key.replace(/_/g, ' ').toUpperCase()}: ${dim.score}/10 — ${dim.notes}`
    ).join('\n');

    const systemInstruction = `You are an expert AI prompt engineer specializing in ${modelName}. You have two jobs:

1. REFINE THE PROMPT: Take a prompt that generated an image, analyze audit feedback, and produce a corrected prompt.
2. RECOMMEND A REFERENCE STRATEGY: Based on the model's KB-documented capabilities and the audit results, tell the user whether to use the previous image as a reference or start fresh with text only.

PROMPT REFINEMENT RULES:
- Follow the ${modelName} syntax and formatting rules from the KB EXACTLY
- Address EVERY issue identified in the audit
- Apply EVERY suggested prompt adjustment
- Preserve what worked well (high-scoring dimensions)
- Reference characters by their EXACT names from context
- Do NOT add unnecessary elements not in the original intent

REFERENCE STRATEGY RULES:
- Consult the ${modelName} KB below for what reference image / editing capabilities the model supports
- If the KB documents reference image input, editing, img2img, --oref, --cref, conversational editing, or similar capabilities, the model supports references
- For REFINE recommendations (score 70-94): if the model supports references, recommend using the previous image as reference to preserve what works
- For REGENERATE recommendations (score 0-69): generally recommend starting fresh, UNLESS a specific dimension (like character identity) scored well AND the model supports character references — then note that as optional
- Always explain HOW to use the reference (the specific method from the KB: parameter name, upload method, etc.)
- If the KB does not document any reference/editing capability for this model, recommend text-only

OUTPUT FORMAT: Respond with valid JSON only. No markdown, no code fences, no explanation outside the JSON.
{
  "refined_prompt": "the corrected prompt text",
  "reference_strategy": {
    "action": "use_reference" | "text_only" | "ref_optional",
    "title": "short directive (e.g. 'Use Previous Image — Conversational Edit')",
    "reason": "1-2 sentence explanation citing specific KB capabilities and audit scores"
  }
}`;

    const userPrompt = `TASK: Refine this ${modelName} prompt and recommend a reference strategy.

ORIGINAL PROMPT:
${originalPrompt}

AUDIT RESULTS (Score: ${auditResult.overall_score}/100, Recommendation: ${auditResult.recommendation}):
${auditResult.summary || ''}

DIMENSION SCORES:
${dimensionSummary}

ISSUES FOUND:
${issuesList || 'None'}

SUGGESTED PROMPT ADJUSTMENTS:
${adjustmentsList || 'None'}

CONTEXT:
${projectBlock}
${sceneBlock}
${shotBlock}
${characterBlock}
${objectBlock}

${modelName.toUpperCase()} KB (consult for syntax rules AND reference image capabilities):
${modelKBContent || 'No model-specific KB available'}

Respond with JSON only.`;

    try {
        const text = await callGemini({
            parts: [{ text: userPrompt }],
            systemInstruction,
            thinkingLevel: 'high',
            maxOutputTokens: 4096,
        });

        // Parse JSON response
        const cleaned = text.trim().replace(/^```(?:json)?\n?/gm, '').replace(/```$/gm, '').trim();
        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch (parseErr) {
            // Fallback: if Gemini didn't return valid JSON, extract what we can
            console.warn('[gemini] Refinement response was not valid JSON, attempting fallback parse');
            const promptMatch = cleaned.match(/"refined_prompt"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"reference_strategy|"\s*})/);
            parsed = {
                refined_prompt: promptMatch ? promptMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : cleaned,
                reference_strategy: {
                    action: auditResult.recommendation === 'REFINE' ? 'use_reference' : 'text_only',
                    title: auditResult.recommendation === 'REFINE' ? 'Use Previous Image' : 'Start Fresh — Text Only',
                    reason: `Score ${auditResult.overall_score}/100. Gemini response could not be parsed — using audit recommendation as fallback.`,
                },
            };
        }

        const refinedPrompt = (parsed.refined_prompt || '').trim();
        const referenceStrategy = parsed.reference_strategy || {
            action: 'text_only',
            title: 'Use Refined Prompt',
            reason: 'No reference strategy returned by model.',
        };

        return { refined_prompt: refinedPrompt, reference_strategy: referenceStrategy };
    } catch (error) {
        console.error('[gemini] Prompt refinement error:', error);
        throw error;
    }
}

export {
    generateRecommendations,
    generatePrompt,
    analyzeReadiness,
    generateAestheticSuggestions,
    generateCharacterSuggestions,
    generateShotPlan,
    readinessDialogue,
    analyzeScript,
    generateObjectSuggestions,
    buildContextBlock,
    refineContent,
    creativeDirectorCollaborate,
    summarizeConversation,
    holisticImageAudit,
    refinePromptFromAudit,
};
