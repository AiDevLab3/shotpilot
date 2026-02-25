import { buildContextBlock, callGemini } from './shared.js';

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

export {
    analyzeScript,
};
