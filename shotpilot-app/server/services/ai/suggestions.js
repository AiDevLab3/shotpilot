import { buildContextBlock, callGemini } from './shared.js';

/**
 * Build a concise story-context block for description enhancement.
 * Gives the AI awareness of the script, other entities, and scenes
 * so it can ground its enhancement in the actual story.
 */
function buildStoryContext(storyContext, entityType, entityName) {
    if (!storyContext) return '';
    const lines = [];

    // Script — truncate to keep token budget reasonable
    if (storyContext.script) {
        const scriptPreview = storyContext.script.length > 2000
            ? storyContext.script.substring(0, 2000) + '\n[... truncated]'
            : storyContext.script;
        lines.push(`SCRIPT:\n${scriptPreview}`);
    }

    // Other characters (for character enhance) or all characters (for object enhance)
    const chars = storyContext.otherCharacters || storyContext.characters || [];
    if (chars.length > 0) {
        const charList = chars.map(c => `  - ${c.name}${c.description ? `: ${c.description.substring(0, 120)}` : ''}`).join('\n');
        lines.push(`${entityType === 'character' ? 'OTHER ' : ''}CHARACTERS IN PROJECT:\n${charList}`);
    }

    // Scenes — show which ones mention this entity or are relevant
    if (storyContext.scenes && storyContext.scenes.length > 0) {
        const nameLower = (entityName || '').toLowerCase();
        const relevant = storyContext.scenes.filter(s => {
            const desc = (s.description || '').toLowerCase();
            const present = (s.characters_present || '').toLowerCase();
            return desc.includes(nameLower) || present.includes(nameLower);
        });
        const scenesToShow = relevant.length > 0 ? relevant : storyContext.scenes.slice(0, 5);
        const label = relevant.length > 0 ? `SCENES FEATURING "${entityName}"` : 'SCENES IN PROJECT (first 5)';
        const sceneList = scenesToShow.map(s => `  - ${s.name}${s.description ? `: ${s.description.substring(0, 150)}` : ''}`).join('\n');
        lines.push(`${label}:\n${sceneList}`);
    }

    return lines.length > 0 ? lines.join('\n\n') + '\n' : '';
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
 * Supports model-specific prompts and turnaround shots.
 */
async function generateCharacterSuggestions(context) {
    const { character, project, kbContent, modelKBContent, targetModel, descriptionOnly, storyContext } = context;

    const projectBlock = buildContextBlock('PROJECT', project);

    const modelNote = targetModel
        ? `You are generating prompts for ${targetModel}. Use the model-specific KB below for EXACT syntax, parameters, and formatting.`
        : `No target model selected. Based on the KB content provided, recommend the best model and generate prompts using THAT model's syntax from the KB. CRITICAL: For Midjourney, ALWAYS use --v 7 (V7). V6 and V6.1 are deprecated. Use --oref (not --cref) for character references in V7.`;

    const systemInstruction = `You are an expert character designer for AI-generated cinematography. Using the Character Consistency Pack, generate detailed character bible entries that will produce consistent results across AI image/video models. Every detail should be specific enough to reproduce exactly — no vague descriptions.

CRITICAL RULE: Only use model syntax, parameters, and version numbers that appear in the KB content provided below. Do NOT use older or deprecated syntax from your training data. For Midjourney: ALWAYS --v 7, NEVER --v 6 or --v 6.1. ALWAYS --oref, NEVER --cref.

${modelNote}`;

    // Build story context block for description enhancement
    const storyBlock = buildStoryContext(storyContext, 'character', character.name);

    const userPrompt = descriptionOnly
        ? `Enhance this character's description and personality for an AI filmmaking project. Keep the character's core identity but make details specific, vivid, and optimized for AI image generation.

${kbContent ? `CORE KB PRINCIPLES:\n${kbContent}\n` : ''}
${projectBlock}
${storyBlock}
CHARACTER NAME: ${character.name || 'Unnamed Character'}
${character.description ? `EXISTING DESCRIPTION: ${character.description}` : ''}
${character.personality ? `EXISTING PERSONALITY: ${character.personality}` : ''}

Expand and enhance the description and personality. Use the script and scene context to understand this character's role, arc, and relationships. Be specific — include exact physical details (eye color, hair texture, skin tone, build, wardrobe) that align with who this character is in the story. Keep the original intent but make it production-ready.

OUTPUT VALID JSON ONLY:
{
  "description": "Detailed physical description covering: face (eye color, nose shape, jawline, distinguishing marks), age & skin (specific age range, skin tone with undertones), hair (style, color, length, texture), build & posture (body type, posture habits), wardrobe (default clothing, accessories). Ground choices in the character's story role and personality. Written as a dense paragraph optimized for AI image generation prompts.",
  "personality": "2-3 core personality traits with behavioral mannerisms drawn from the script context. Written to guide expression and body language in generated images."
}`
        : `Generate a detailed character bible for an AI filmmaking project.

${kbContent ? `CORE KB PRINCIPLES:\n${kbContent}\n` : ''}
${modelKBContent ? `MODEL-SPECIFIC KB (${targetModel}):\n${modelKBContent}\n` : ''}
${projectBlock}

CHARACTER NAME: ${character.name || 'Unnamed Character'}
${character.description ? `EXISTING DESCRIPTION: ${character.description}` : ''}
${character.personality ? `EXISTING PERSONALITY: ${character.personality}` : ''}

Generate comprehensive, prompt-ready character details following the Character Bible Checklist.

OUTPUT VALID JSON ONLY:
{
  "description": "Detailed physical description covering: face (eye color, nose shape, jawline, distinguishing marks), age & skin (specific age range, skin tone with undertones), hair (style, color, length, texture), build & posture (body type, posture habits), wardrobe (default clothing, accessories). Written as a dense paragraph optimized for AI image generation prompts.",
  "personality": "2-3 core personality traits with behavioral mannerisms. Written to guide expression and body language in generated images.",
  "referencePrompt": "A model-specific prompt to generate a master reference image for this character. Must use exact model syntax (e.g. Midjourney parameters, Higgsfield camera rig language, etc). Include specific physical details, lighting, and framing.",
  "consistencyTips": ["Tip 1 for maintaining this character across shots", "Tip 2", "Tip 3"],
  "recommendedModel": "JUST the model name, e.g. 'midjourney' or 'higgsfield'. Must match one of the supported model IDs exactly. Null if a target model was selected.",
  "recommendedModelReason": "One plain-English sentence explaining WHY this model is best for this character. No technical jargon — write it for someone who has never used AI image tools. Null if a target model was selected."
}`;

    const geminiOpts = {
        parts: [{ text: userPrompt }],
        systemInstruction,
        thinkingLevel: descriptionOnly ? 'low' : 'medium',
        responseMimeType: 'application/json',
        maxOutputTokens: descriptionOnly ? 1024 : 4096,
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
    const { object, project, kbContent, modelKBContent, targetModel, descriptionOnly, storyContext } = context;

    const projectBlock = buildContextBlock('PROJECT', project);

    const modelNote = targetModel
        ? `You are generating prompts for ${targetModel}. Use the model-specific KB below for EXACT syntax, parameters, and formatting.`
        : `No target model selected. Based on the KB content provided, recommend the best model and generate prompts using THAT model's syntax from the KB. CRITICAL: For Midjourney, ALWAYS use --v 7 (V7). V6 and V6.1 are deprecated. Use --oref (not --cref) for object references in V7.`;

    const systemInstruction = `You are an expert prop master and production designer for AI-generated cinematography. Generate detailed object/prop descriptions that will produce consistent results across AI image/video models. Focus on material, color, condition, scale, and contextual placement.

CRITICAL RULE: Only use model syntax, parameters, and version numbers that appear in the KB content provided below. Do NOT use older or deprecated syntax from your training data. For Midjourney: ALWAYS --v 7, NEVER --v 6 or --v 6.1. ALWAYS --oref, NEVER --cref.

${modelNote}`;

    // Build story context block for description enhancement
    const storyBlock = buildStoryContext(storyContext, 'object', object.name);

    const userPrompt = descriptionOnly
        ? `Enhance this object's description for an AI filmmaking project. Keep the object's core identity but make details specific, vivid, and optimized for AI image generation.

${kbContent ? `CORE KB PRINCIPLES:\n${kbContent}\n` : ''}
${projectBlock}
${storyBlock}
OBJECT NAME: ${object.name || 'Unnamed Object'}
${object.description ? `EXISTING DESCRIPTION: ${object.description}` : ''}

Expand and enhance the description. Use the script and scene context to understand this object's role in the story — how it's used, who handles it, what it means narratively. Be specific — include exact material, color, texture, condition, dimensions, distinctive features, and contextual placement. Keep the original intent but make it production-ready.

OUTPUT VALID JSON ONLY:
{
  "description": "Detailed physical description covering: material, color, texture, condition (new/worn/damaged), dimensions/scale relative to human, distinctive features, contextual placement. Ground details in the story context — if the script tells you this is a weathered heirloom, make it look like one. Written as a dense paragraph optimized for AI image generation prompts."
}`
        : `Generate a detailed object/prop description for an AI filmmaking project.

${kbContent ? `CORE KB PRINCIPLES:\n${kbContent}\n` : ''}
${modelKBContent ? `MODEL-SPECIFIC KB (${targetModel}):\n${modelKBContent}\n` : ''}
${projectBlock}

OBJECT NAME: ${object.name || 'Unnamed Object'}
${object.description ? `EXISTING DESCRIPTION: ${object.description}` : ''}

Generate comprehensive, prompt-ready object details. The reference prompt MUST use the target model's exact syntax and parameters from the KB.

OUTPUT VALID JSON ONLY:
{
  "description": "Detailed physical description covering: material, color, texture, condition (new/worn/damaged), dimensions/scale relative to human, distinctive features, contextual placement. Written as a dense paragraph optimized for AI image generation prompts.",
  "referencePrompt": "A model-specific prompt to generate a master reference image for this object. Must use exact model syntax (e.g. Midjourney parameters, Higgsfield camera rig language, etc). Include specific material details, lighting, and framing.",
  "consistencyTips": ["Tip 1 for maintaining this object across shots", "Tip 2"],
  "recommendedModel": "JUST the model name, e.g. 'midjourney' or 'higgsfield'. Must match one of the supported model IDs exactly. Null if a target model was selected.",
  "recommendedModelReason": "One plain-English sentence explaining WHY this model is best for this object. No technical jargon — write it for someone who has never used AI image tools. Null if a target model was selected."
}`;

    const geminiOpts = {
        parts: [{ text: userPrompt }],
        systemInstruction,
        thinkingLevel: descriptionOnly ? 'low' : 'low',
        responseMimeType: 'application/json',
        maxOutputTokens: descriptionOnly ? 1024 : 4096,
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

/**
 * Generate a turnaround sheet prompt based on the ACTUAL reference prompt
 * that was used to create the uploaded reference image.
 */
async function generateTurnaroundPrompt(context) {
    const { entityType, entityName, entityDescription, originalRefPrompt, project, kbContent, modelKBContent, targetModel } = context;

    const isCharacter = entityType === 'character';
    const entityLabel = isCharacter ? 'character' : 'object';
    const projectBlock = buildContextBlock('PROJECT', project);

    const anglesCharacter = 'front portrait, 3/4 profile, side profile, back view';
    const anglesObject = 'front 3/4 view, side profile, back view, detail close-up';
    const angles = isCharacter ? anglesCharacter : anglesObject;

    const modelNote = targetModel
        ? `Generate the turnaround prompt for ${targetModel}. Use the model-specific KB below for EXACT syntax and parameters.`
        : `No target model selected. Use Midjourney V7 syntax as default. ALWAYS --v 7, NEVER --v 6 or --v 6.1. Use --oref for reference images.`;

    const systemInstruction = `You are an expert ${isCharacter ? 'character designer' : 'prop master'} for AI-generated cinematography. You are generating a turnaround sheet prompt that MUST be consistent with an existing reference image.

CRITICAL: The user has already created a reference image using a specific prompt. Your turnaround prompt must build on that EXACT prompt — same physical details, same style, same model syntax. The model does NOT know this ${entityLabel} by name. The prompt must reference "the attached reference image" as the visual source.

${modelNote}

CRITICAL RULE: Only use model syntax that appears in the KB content provided.`;

    const userPrompt = `${kbContent ? `CORE KB PRINCIPLES:\n${kbContent}\n` : ''}
${modelKBContent ? `MODEL-SPECIFIC KB (${targetModel}):\n${modelKBContent}\n` : ''}
${projectBlock}

${entityLabel.toUpperCase()} NAME: ${entityName || 'Unnamed'}
${entityDescription ? `${entityLabel.toUpperCase()} DESCRIPTION: ${entityDescription}` : ''}

ORIGINAL REFERENCE PROMPT (the exact prompt used to create the reference image — your turnaround prompt must be consistent with this):
${originalRefPrompt}

Generate a single turnaround sheet prompt that produces a 2x2 grid showing this ${entityLabel} from 4 angles (${angles}).

Requirements:
- The prompt must say "turnaround sheet of the ${entityLabel} in the attached reference image" — the user will attach their reference image
- Pull physical details, style, lighting language, and model syntax from the ORIGINAL REFERENCE PROMPT above
- If the model supports reference image parameters (e.g. Midjourney --oref), include them and set turnaroundUsesRef to true
- If the model does NOT support reference image attachment, write full standalone descriptions and set turnaroundUsesRef to false
- Request consistent even lighting, neutral pose, clean background across all 4 angles

OUTPUT VALID JSON ONLY:
{
  "turnaroundPrompt": "The complete turnaround sheet prompt ready to copy-paste",
  "turnaroundUsesRef": true
}`;

    const text = await callGemini({
        parts: [{ text: userPrompt }],
        systemInstruction,
        thinkingLevel: 'medium',
        responseMimeType: 'application/json',
        maxOutputTokens: 2048,
    });

    let parsed;
    try { parsed = JSON.parse(text); } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        else throw new Error('Could not parse turnaround prompt JSON');
    }
    if (Array.isArray(parsed)) parsed = parsed[0];

    return {
        turnaroundPrompt: parsed.turnaroundPrompt || '',
        turnaroundUsesRef: parsed.turnaroundUsesRef !== false,
    };
}

export {
    generateAestheticSuggestions,
    generateCharacterSuggestions,
    generateObjectSuggestions,
    generateTurnaroundPrompt,
};
