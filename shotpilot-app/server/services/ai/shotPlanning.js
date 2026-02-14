import { buildContextBlock, callGemini } from './shared.js';

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

export {
    generateShotPlan,
    readinessDialogue,
};
