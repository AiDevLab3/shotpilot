import { buildContextBlock, callGemini } from './shared.js';

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

export {
    analyzeReadiness,
    generateRecommendations,
};
