import { buildContextBlock, callGemini } from './shared.js';

/**
 * Phase 3.3: Generate shot plan for a scene.
 * Returns a sequence of recommended shots with cinematography guidance.
 */
async function generateShotPlan(context) {
    const { scene, project, existingShots, kbContent, mode = 'full', scriptContent } = context;

    // Build focused project context (style info only, not full dump)
    const projectStyle = [
        project.style_aesthetic && `Style: ${project.style_aesthetic}`,
        project.mood && `Mood: ${project.mood}`,
        project.cinematography && `Cinematography: ${project.cinematography}`,
        project.lighting && `Lighting: ${project.lighting}`,
        project.frame_size && `Frame: ${project.frame_size}`,
        project.references && `References: ${project.references}`,
    ].filter(Boolean).join('\n  ');

    // Extract ONLY this scene's script section (not the full script)
    let sceneScript = '';
    if (scriptContent) {
        // Try to extract just this scene's portion
        const sceneName = scene.name || '';
        const sceneNameClean = sceneName.replace(/^SCENE \d+:\s*/i, '').trim();
        const lines = scriptContent.split('\n');
        let capturing = false;
        const captured = [];
        for (const line of lines) {
            if (line.toUpperCase().includes(sceneNameClean.toUpperCase()) || 
                (scene.name && line.toUpperCase().includes(scene.name.toUpperCase()))) {
                capturing = true;
            } else if (capturing && /^SCENE \d/i.test(line.trim())) {
                break; // Hit next scene
            }
            if (capturing) captured.push(line);
        }
        sceneScript = captured.length > 0 ? captured.join('\n') : '';
    }

    const sceneBlock = [
        `Scene: ${scene.name || 'Untitled'}`,
        scene.description && `Description: ${scene.description}`,
        scene.location && `Location: ${scene.location}`,
        scene.time_of_day && `Time: ${scene.time_of_day}`,
        scene.mood && `Mood: ${scene.mood}`,
        sceneScript && `\nScript:\n${sceneScript}`,
    ].filter(Boolean).join('\n');

    let existingShotsBlock = '';
    if (mode === 'add' && existingShots && existingShots.length > 0) {
        existingShotsBlock = '\nEXISTING SHOTS (do NOT recreate these):\n' + existingShots.map((s, i) =>
            `  Shot ${s.shot_number}: ${s.shot_type || 'unset'} — ${s.description || 'no description'}`
        ).join('\n');
    }

    const systemInstruction = `You are an expert cinematographer planning shot sequences for a specific scene.

CRITICAL RULES:
- Plan shots ONLY for the scene described below. Do NOT reference events, characters, or locations from other scenes.
- Stay within the scope of what happens in THIS scene's script excerpt.
- Use the Storyboard Shot Sequence framework (Opening Hook → Establishing → Detail → Action → Resolution).
- Each shot should be specific, actionable, and grounded in what the scene actually depicts.`;

    const nextShotNumber = mode === 'add' ? (existingShots?.length || 0) + 1 : 1;

    const userPrompt = `Plan a shot sequence for this scene.

${kbContent ? `Cinematography principles:\n${kbContent}\n` : ''}
PROJECT STYLE:
  ${projectStyle || 'No specific style set'}

SCENE:
${sceneBlock}
${existingShotsBlock}

${mode === 'add'
    ? `Suggest 2-4 additional shots to complement the existing ${existingShots?.length || 0} shots. Start numbering at ${nextShotNumber}.`
    : 'Suggest a complete shot sequence (4-7 shots) for this scene. Number them starting at 1.'}

OUTPUT VALID JSON ONLY:
{
  "shots": [
    {
      "shot_number": "${nextShotNumber}",
      "shot_type": "Wide Shot",
      "camera_angle": "Eye Level",
      "camera_movement": "Static",
      "focal_length": "24mm",
      "description": "Specific description of what the shot captures IN THIS SCENE",
      "blocking": "Character/object positions and actions",
      "purpose": "Why this shot exists in the sequence"
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

    const systemInstruction = `You are an expert cinematographer discussing shot prompt readiness with a filmmaker. Explain WHY things matter using real cinematography craft — not generic advice. Discuss trade-offs and suggest alternatives with specific technical reasoning.

Example expertise: "Without specifying camera angle, the AI will default to eye level — which is fine for dialogue but kills the tension you want here. A low angle on the protagonist at this moment gives them visual authority. Try 'low angle, 35mm' to get that imposing feeling without distorting their face."

Keep responses concise (2-4 sentences for simple questions, up to a paragraph for complex ones). Reference model-specific behaviors when the user has a target model selected.`;

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
