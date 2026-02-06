import fetch from 'node-fetch';

// Gemini API — use gemini-2.0-flash (stable) or gemini-3-flash-preview (latest)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function generateRecommendations(context) {
    const { project, scene, shot, missingFields } = context;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const systemInstruction = `You are an expert cinematographer and director. Recommend appropriate values for missing fields based on context. For each field provide:
1. Specific recommendation
2. Clear reasoning (reference their specific context)
3. 2-3 alternatives

Be educational but concise.`;

    const userPrompt = `Based on this project, recommend values for missing fields:

PROJECT: ${project.title || 'Untitled'}
- Style: ${project.style_aesthetic || 'Not specified'}
- Mood: ${project.atmosphere_mood || 'Not specified'}

SCENE: ${scene.name || 'Untitled'}
- Description: ${scene.description || 'Not specified'}
- Location: ${scene.location_setting || 'Not specified'}
- Time: ${scene.time_of_day || 'Not specified'}
- Mood: ${scene.mood_tone || 'Not specified'}

SHOT #${shot.shot_number}:
- Type: ${shot.shot_type || 'Not specified'}
- Description: ${shot.description || 'Not specified'}

MISSING: ${missingFields.map(f => f.label).join(', ')}

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
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: { temperature: 0.8, maxOutputTokens: 2048, responseMimeType: "application/json" }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Parse JSON safely
        try {
            return JSON.parse(text);
        } catch (e) {
            // Fallback regex if mime type wasn't enough or API ignored it
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Could not parse recommendations JSON');
        }
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

async function generatePrompt(context) {
    const { project, scene, shot, modelName, kbContent, qualityTier } = context;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const systemInstruction = `You are an expert AI filmmaker specializing in ${modelName}. Generate precise prompts using the model-specific KB provided. Follow EXACT syntax from KB. Shot details override scene/project (hierarchical priority).`;

    const userPrompt = `Generate ${modelName} prompt.

QUALITY: ${qualityTier.toUpperCase()}
${qualityTier === 'draft' ? '⚠️ Some context missing - make inferences' : '✅ Full context'}

PRIORITY: Shot > Scene > Project

PROJECT:
- Title: ${project.title || 'Untitled'}
- Style: ${project.style_aesthetic || '[infer from scene/shot]'}
- Mood: ${project.atmosphere_mood || '[infer from scene]'}

SCENE:
- Name: ${scene.name || 'Untitled'}
- Location: ${scene.location_setting || '[infer from description]'}
- Time: ${scene.time_of_day || '[infer from lighting]'}
- Mood: ${scene.mood_tone || '[infer from project]'}
- Lighting: ${scene.lighting_notes || '[infer from time/mood]'}

SHOT #${shot.shot_number}:
- Type: ${shot.shot_type || '[CRITICAL ERROR]'}
- Angle: ${shot.camera_angle || '[infer from type]'}
- Movement: ${shot.camera_movement || '[assume static]'}
- Description: ${shot.description || '[CRITICAL ERROR]'}
- Duration: ${shot.desired_duration || 5}s

KB - ${modelName.toUpperCase()}:
${kbContent}

OUTPUT FORMAT:
[CLEAN PROMPT - NO PREAMBLE]

// AI Assumptions:
// - [list inferences made]`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Split on assumptions marker
        const parts = text.split(/\/\/ AI Assumptions/i);
        const prompt = parts[0].trim().replace(/^```.*\n?/gm, '').replace(/```$/gm, '').trim();
        const assumptions = parts[1] ? parts[1].trim() : null;

        return { prompt, assumptions };
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

export {
    generateRecommendations,
    generatePrompt
};
