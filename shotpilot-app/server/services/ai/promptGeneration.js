import { buildContextBlock, buildImageParts, callGemini } from './shared.js';

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

    const systemInstruction = `You are an expert AI filmmaker and Director of Photography specializing in ${modelName}. You have deep knowledge of how this specific model interprets prompts — its strengths, quirks, and optimal syntax patterns. Generate precise prompts using the model-specific KB provided. Follow EXACT syntax from KB. Shot details override scene/project (hierarchical priority).

CRITICAL RULES:
- Reference characters by the EXACT NAME provided in the context (e.g. if name is "Property Manager", use "Property Manager").
- DO NOT invent new names or rename characters.
- If reference images are attached, mention using them for visual consistency.
- Follow the KB formatting rules exactly for the target model.

ASSUMPTIONS STYLE:
When listing AI Assumptions, explain your choices with specific technical reasoning — not generic labels.
BAD: "Applied Realism Pack" or "Used standard lighting"
GOOD: "Chose 50mm at f/4 for natural facial proportions — avoids the wide-angle distortion that ${modelName} tends to exaggerate" or "Led with motivated key light from the window because ${modelName} produces flat results when light source isn't specified"
Reference model-specific behaviors and KB principles by name when relevant.`;

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

    const systemInstruction = `You are an expert AI prompt engineer and Director of Photography specializing in ${modelName}. You understand exactly how ${modelName} interprets prompt language — its strengths, blind spots, and optimal phrasing. You have two jobs:

1. REFINE THE PROMPT: Take a prompt that generated an image, analyze audit feedback, and produce a corrected prompt.
2. RECOMMEND A REFERENCE STRATEGY: Based on the model's KB-documented capabilities and the audit results, tell the user whether to use the previous image as a reference or start fresh with text only.

REFERENCE STRATEGY VOICE: When explaining your strategy recommendation, use specific model knowledge:
BAD: "Use previous image as reference"
GOOD: "${modelName === 'midjourney' ? 'Use --oref with the previous image at --ow 80 to preserve the character identity while allowing the lighting correction' : modelName === 'gpt-image' ? 'Upload the previous image and use conversational editing — GPT Image excels at targeted changes when you can say exactly what to fix' : 'Use the previous image as a starting reference for identity consistency, then let the corrected prompt handle the lighting and composition fixes'}".

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
    generatePrompt,
    refinePromptFromAudit,
};
