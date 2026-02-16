import { buildContextBlock, callGemini } from './shared.js';

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
 * Supports model-specific prompts and turnaround shots.
 */
async function generateCharacterSuggestions(context) {
    const { character, project, kbContent, modelKBContent, targetModel } = context;

    const projectBlock = buildContextBlock('PROJECT', project);

    const modelNote = targetModel
        ? `You are generating prompts for ${targetModel}. Use the model-specific KB below for EXACT syntax, parameters, and formatting.`
        : `No target model selected. Generate prompts using general cinematic photography language. Note in your response which model would be best suited for this character.`;

    const systemInstruction = `You are an expert character designer for AI-generated cinematography. Using the Character Consistency Pack, generate detailed character bible entries that will produce consistent results across AI image/video models. Every detail should be specific enough to reproduce exactly — no vague descriptions.

${modelNote}`;

    const userPrompt = `Generate a detailed character bible for an AI filmmaking project.

${kbContent ? `CORE KB PRINCIPLES:\n${kbContent}\n` : ''}
${modelKBContent ? `MODEL-SPECIFIC KB (${targetModel}):\n${modelKBContent}\n` : ''}
${projectBlock}

CHARACTER NAME: ${character.name || 'Unnamed Character'}
${character.description ? `EXISTING DESCRIPTION: ${character.description}` : ''}
${character.personality ? `EXISTING PERSONALITY: ${character.personality}` : ''}

Generate comprehensive, prompt-ready character details following the Character Bible Checklist.

Also generate turnaround prompts — a set of 3 angle-specific prompts to establish the character from multiple viewpoints for consistency across shots. Each turnaround prompt should specify a different angle (front portrait, 3/4 profile, full body).

OUTPUT VALID JSON ONLY:
{
  "description": "Detailed physical description covering: face (eye color, nose shape, jawline, distinguishing marks), age & skin (specific age range, skin tone with undertones), hair (style, color, length, texture), build & posture (body type, posture habits), wardrobe (default clothing, accessories). Written as a dense paragraph optimized for AI image generation prompts.",
  "personality": "2-3 core personality traits with behavioral mannerisms. Written to guide expression and body language in generated images.",
  "referencePrompt": "A model-specific prompt to generate a master reference image for this character. Must use exact model syntax (e.g. Midjourney parameters, Higgsfield camera rig language, etc). Include specific physical details, lighting, and framing.",
  "turnaroundPrompts": [
    "Front portrait prompt — model-specific syntax",
    "3/4 profile view prompt — model-specific syntax",
    "Full body view prompt — model-specific syntax"
  ],
  "consistencyTips": ["Tip 1 for maintaining this character across shots", "Tip 2", "Tip 3"],
  "recommendedModel": "Model name recommendation (only if no target model selected, otherwise null)"
}`;

    const geminiOpts = {
        parts: [{ text: userPrompt }],
        systemInstruction,
        thinkingLevel: 'medium',
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
    };

    const parseObject = (text) => {
        let parsed;
        try { parsed = JSON.parse(text); } catch (e) {
            const posMatch = e.message.match(/position (\d+)/);
            if (posMatch) {
                try { parsed = JSON.parse(text.substring(0, parseInt(posMatch[1]))); } catch {}
            }
            if (!parsed) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try { parsed = JSON.parse(jsonMatch[0]); } catch {}
                }
            }
            if (!parsed) throw new Error('Could not parse character suggestions JSON');
        }
        // Gemini sometimes wraps the object in an array
        if (Array.isArray(parsed)) parsed = parsed[0];
        return parsed;
    };

    try {
        const text = await callGemini(geminiOpts);
        return parseObject(text);
    } catch (firstError) {
        try {
            console.warn('[gemini] Character suggestions: first attempt failed, retrying...', firstError.message);
            const text = await callGemini(geminiOpts);
            return parseObject(text);
        } catch (retryError) {
            console.error('[gemini] Character suggestions error (after retry):', retryError);
            throw retryError;
        }
    }
}

/**
 * Phase 3.6: Generate detailed object/prop suggestions.
 */
async function generateObjectSuggestions(context) {
    const { object, project, kbContent, modelKBContent, targetModel } = context;

    const projectBlock = buildContextBlock('PROJECT', project);

    const modelNote = targetModel
        ? `You are generating prompts for ${targetModel}. Use the model-specific KB below for EXACT syntax, parameters, and formatting.`
        : `No target model selected. Generate prompts using general cinematic photography language. Note in your response which model would be best suited for this object.`;

    const systemInstruction = `You are an expert prop master and production designer for AI-generated cinematography. Generate detailed object/prop descriptions that will produce consistent results across AI image/video models. Focus on material, color, condition, scale, and contextual placement.

${modelNote}`;

    const userPrompt = `Generate a detailed object/prop description for an AI filmmaking project.

${kbContent ? `CORE KB PRINCIPLES:\n${kbContent}\n` : ''}
${modelKBContent ? `MODEL-SPECIFIC KB (${targetModel}):\n${modelKBContent}\n` : ''}
${projectBlock}

OBJECT NAME: ${object.name || 'Unnamed Object'}
${object.description ? `EXISTING DESCRIPTION: ${object.description}` : ''}

Generate comprehensive, prompt-ready object details. The reference prompt MUST use the target model's exact syntax and parameters from the KB.

Also generate turnaround prompts — a set of 3 angle-specific prompts to establish the object from multiple viewpoints for consistency across shots. Each turnaround prompt should specify a different angle (front 3/4, side profile, top-down or detail close-up).

OUTPUT VALID JSON ONLY:
{
  "description": "Detailed physical description covering: material, color, texture, condition (new/worn/damaged), dimensions/scale relative to human, distinctive features, contextual placement. Written as a dense paragraph optimized for AI image generation prompts.",
  "referencePrompt": "A model-specific prompt to generate a master reference image for this object. Must use exact model syntax (e.g. Midjourney parameters, Higgsfield camera rig language, etc). Include specific material details, lighting, and framing.",
  "turnaroundPrompts": [
    "Front 3/4 view prompt — model-specific syntax",
    "Side profile view prompt — model-specific syntax",
    "Detail close-up or top-down view prompt — model-specific syntax"
  ],
  "consistencyTips": ["Tip 1 for maintaining this object across shots", "Tip 2"],
  "recommendedModel": "Model name recommendation (only if no target model selected, otherwise null)"
}`;

    const geminiOpts = {
        parts: [{ text: userPrompt }],
        systemInstruction,
        thinkingLevel: 'low',
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
    };

    const parseObject = (text) => {
        let parsed;
        try { parsed = JSON.parse(text); } catch (e) {
            const posMatch = e.message.match(/position (\d+)/);
            if (posMatch) {
                try { parsed = JSON.parse(text.substring(0, parseInt(posMatch[1]))); } catch {}
            }
            if (!parsed) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try { parsed = JSON.parse(jsonMatch[0]); } catch {}
                }
            }
            if (!parsed) throw new Error('Could not parse object suggestions JSON');
        }
        // Gemini sometimes wraps the object in an array
        if (Array.isArray(parsed)) parsed = parsed[0];
        return parsed;
    };

    try {
        const text = await callGemini(geminiOpts);
        return parseObject(text);
    } catch (firstError) {
        // Single retry — Gemini JSON output is occasionally malformed
        try {
            console.warn('[gemini] Object suggestions: first attempt failed, retrying...', firstError.message);
            const text = await callGemini(geminiOpts);
            return parseObject(text);
        } catch (retryError) {
            console.error('[gemini] Object suggestions error (after retry):', retryError);
            throw retryError;
        }
    }
}

export {
    generateAestheticSuggestions,
    generateCharacterSuggestions,
    generateObjectSuggestions,
};
