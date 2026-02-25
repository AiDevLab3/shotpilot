import { buildContextBlock, callGemini } from './shared.js';

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

COMMUNICATION STYLE — Write like a seasoned DP giving notes on set, not like a generic AI:
BAD: "Lighting could be improved" or "Style consistency is moderate"
GOOD: "The key light is unmotivated — there's no visible source for that highlight on the subject's left cheek. In real cinematography, every light needs a physical origin: a window, a practical lamp, overhead fluorescents. Without motivation, the image reads as synthetic."
GOOD: "This has the classic 'AI plastic look' — notice the micro-contrast is cranked up and the skin texture looks waxy with no pores. The fix is specific: add 'subtle film grain, natural skin texture with pores, soft highlight rolloff' to the prompt and remove any 'hyper detailed' or '8K clarity' language."
Reference specific KB principles, model behaviors, and film techniques by name. Explain WHY something matters, not just WHAT is wrong.

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
            thinkingLevel: 'low',  // lower thinking = less reasoning variability for scoring consistency
            temperature: 0,
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
 * ENTITY IMAGE ANALYSIS — Full-quality analysis using the SAME evaluation
 * framework as holisticImageAudit for continuity.
 *
 * Evaluates entity reference images (characters, objects) across the same
 * 6 cinematic dimensions + 4 realism diagnosis patterns used for shot variants,
 * PLUS prompt-matching and revised prompt generation specific to entity refs.
 *
 * This ensures that a character/object reference image that scores well here
 * will integrate seamlessly when used in shot generation — same quality bar,
 * same visual language, same realism standards.
 */
async function analyzeEntityImage({ imageBuffer, mimeType, originalPrompt, entityType, entityName, entityDescription, project, kbContent, modelKBContent, targetModel, referenceImageBuffer, referenceImageMimeType, isTurnaround, iterationHistory }) {
    const projectBlock = project ? buildContextBlock('PROJECT', project) : '';
    const entityLabel = entityType === 'character' ? 'Character' : 'Object';

    const isTurnaroundSheet = !!isTurnaround;
    const imageTypeLabel = isTurnaroundSheet ? 'turnaround sheet' : 'reference image';

    const turnaroundExtra = isTurnaroundSheet ? `
TURNAROUND SHEET EVALUATION — This is a character/object turnaround sheet (typically a 2x2 or 4-panel grid showing multiple angles). In addition to standard quality evaluation:
- CHECK CROSS-ANGLE CONSISTENCY: Do all angles show the same character/object? Look for drifting features (different eye color, hair style, clothing, proportions) between panels.
- COMPARE AGAINST REFERENCE IMAGE: A reference image has been provided. Score how well the turnaround sheet matches the reference — same face, same clothing, same colors, same style.
- EVALUATE LAYOUT: Is it a clean grid with distinct angles? Are the angles useful (front, 3/4, side, back)?
- The ${entityType === 'character' ? 'character_identity' : 'object_accuracy'} dimension is ESPECIALLY important here — it should evaluate consistency ACROSS all panels AND against the reference image.` : '';

    const systemInstruction = `You are an expert Holistic Image Auditor for AI-generated cinematography, specifically evaluating ${entityLabel.toLowerCase()} ${imageTypeLabel}s. You analyze images with the eye of a seasoned Director of Photography, evaluating them across 6 critical dimensions for professional production quality.
${turnaroundExtra}
CRITICAL CONTEXT: This is a ${entityLabel.toLowerCase()} ${imageTypeLabel} that will be used as a visual anchor for shots in the production. The quality, style, and realism standards you evaluate here MUST be the same standards applied to final shot images. If this ${imageTypeLabel} passes your audit but has hidden quality issues (AI plastic look, wrong lighting style, etc.), those issues will propagate into every shot featuring this ${entityLabel.toLowerCase()}.

Your analysis must be precise, actionable, and grounded in real cinematography principles. Score honestly — a mediocre AI-generated image should NOT score 90+. Reserve high scores for genuinely production-quality results.

COMMUNICATION STYLE — Write like a seasoned DP giving notes on set, not like a generic AI:
BAD: "Lighting could be improved" or "Style consistency is moderate"
GOOD: "The key light is unmotivated — there's no visible source for that highlight on the subject's left cheek. In real cinematography, every light needs a physical origin: a window, a practical lamp, overhead fluorescents. Without motivation, the image reads as synthetic."
GOOD: "This has the classic 'AI plastic look' — notice the micro-contrast is cranked up and the skin texture looks waxy with no pores. The fix is specific: add 'subtle film grain, natural skin texture with pores, soft highlight rolloff' to the prompt and remove any 'hyper detailed' or '8K clarity' language."
Reference specific KB principles, model behaviors, and film techniques by name. Explain WHY something matters, not just WHAT is wrong.

SCORING GUIDELINES:
- 0-3: Severe issues, fundamentally broken
- 4-5: Below average, noticeable problems
- 6-7: Acceptable with clear room for improvement
- 8-9: Strong, minor refinements only
- 10: Exceptional, professional production quality

OVERALL SCORE = weighted sum of dimensions (same weights as shot variant audit):
- Physics (weight 2): 20% of total
- Style Consistency (weight 2): 20% of total
- Lighting & Atmosphere (weight 1.5): 15% of total
- Clarity (weight 1): 10% of total
- Objects & Composition (weight 1.5): 15% of total
- ${entityType === 'character' ? 'Character Identity (weight 2): 20% of total' : 'Object Accuracy (weight 2): 20% of total'}

VERDICT THRESHOLDS (maps to the same quality bar as shot variant audit):
- STRONG MATCH: 85-100 (production-quality reference, ready to use in shots)
- NEEDS TWEAKS: 60-84 (good base, targeted prompt adjustments needed)
- SIGNIFICANT MISMATCH: 0-59 (fundamental issues, needs regeneration)

REALISM DIAGNOSIS — Check for these 4 common AI image failure patterns:

1. "AI Plastic Look" — Overly crisp micro-contrast, HDR glow/haloing, plastic/waxy skin, perfectly clean gradients (no natural noise), sterile symmetry, unrealistic bokeh, surfaces too glossy/clean/new, unmotivated flat lighting. CAUSE: Kill-switch terms in prompt ("hyper detailed," "8K," "perfect skin"), no entropy, unmotivated lighting. FIX: Remove killer terms, add filmic tonality + grain, specify motivated lighting + falloff, add subtle entropy.

2. "Flat / Lifeless" — No directional light, no contrast ratio, no atmosphere depth cues, image feels two-dimensional and unengaging. CAUSE: No directional light specified, no fill/contrast control, no atmosphere. FIX: Specify key light direction + quality, add negative space and subject separation, add subtle haze/dust if appropriate.

3. "CGI / Game Engine Look" — Glossy highlights with perfect edges, too much micro-contrast, render-like background sharpness, volumetrics that look like smoke simulation. CAUSE: Excessive global sharpness, render-like lighting, no lens imperfections. FIX: Soften tonality, add rolloff, reduce global sharpness, add subtle lens imperfections, enforce photographic anchor language ("captured through a physical lens").

4. "Lighting Drift" — Light direction and source inconsistent within image or doesn't match scene intent, shadows fall in wrong direction, multiple conflicting light sources without motivation. CAUSE: Light direction and source not locked. FIX: Define scene-level lighting lock (source + direction + quality + contrast ratio), treat lighting as canon.

For each pattern detected, classify severity as "severe" (dominates the image), "moderate" (noticeable but not dominant), or "none" (not present). Only include patterns that are actually present (not "none").

STAGNATION DETECTION — When iteration history is provided, you MUST analyze the score trajectory:
- If 3+ iterations have been attempted and total improvement is less than 15 points from V1, this is STAGNATION.
- When stagnation is detected: the current model/approach has likely hit its ceiling for this subject. Do NOT give another round of minor prompt tweaks that will yield +2 points.
- Instead, you MUST:
  1. Diagnose WHY the model is plateauing (e.g., "Midjourney V7 tends to over-stylize photorealistic portraits — the plastic skin and HDR glow are baked into the model's aesthetic")
  2. Recommend a SPECIFIC different model and explain why it would do better (e.g., "Switch to Flux Pro for photorealistic work — it handles skin texture and natural lighting falloff significantly better than Midjourney for this type of subject")
  3. Write the revised_prompt formatted for the RECOMMENDED model, not the current one
  4. If the approach itself is flawed (e.g., trying to get photorealism from a stylized model), say so directly

Model strengths you should know:
- Midjourney: Strong aesthetic style, cinematic compositions, struggles with true photorealism and specific details
- Flux (Pro/Dev): Excellent photorealism, natural skin textures, accurate text rendering, less "artistic" default look
- DALL-E 3: Good at following complex instructions, decent realism, can be too clean/corporate
- Stable Diffusion (SDXL/SD3): Highly controllable with LoRAs, great for specific styles, requires more prompt engineering
- Ideogram: Strong at text in images, good compositions, newer model with improving quality`;



    // Build iteration context for stagnation detection
    let iterationContext = '';
    if (Array.isArray(iterationHistory) && iterationHistory.length > 0) {
        const scores = iterationHistory.map(h => `V${h.version}: ${h.score}`).join(' → ');
        const firstScore = iterationHistory[0].score;
        const lastScore = iterationHistory[iterationHistory.length - 1].score;
        const totalImprovement = lastScore - firstScore;
        const iterCount = iterationHistory.length;
        iterationContext = `\nITERATION HISTORY — This is iteration ${iterCount + 1}. Previous scores: ${scores} (total improvement: ${totalImprovement > 0 ? '+' : ''}${totalImprovement} over ${iterCount} iteration${iterCount > 1 ? 's' : ''}).${iterCount >= 3 && totalImprovement < 15 ? `\n⚠️ STAGNATION DETECTED — ${iterCount} iterations with only ${totalImprovement} points of improvement. The current approach has hit a ceiling. You MUST recommend a different model or fundamentally different approach. Do NOT suggest minor prompt tweaks.` : iterCount >= 2 && totalImprovement < 5 ? '\n⚠️ SLOW PROGRESS — Score is barely improving. Consider whether a different model would be more effective.' : ''}\n`;
    }

    const contextLines = [];
    if (entityName) contextLines.push(`${entityLabel} Name: ${entityName}`);
    if (entityDescription) contextLines.push(`${entityLabel} Description: ${entityDescription}`);

    const hasPrompt = originalPrompt && originalPrompt.trim().length > 0;
    const promptSection = hasPrompt
        ? `PROMPT USED TO GENERATE THIS IMAGE (for iteration context — NOT an evaluation rubric):\n${originalPrompt}\nUse this prompt to understand what the user was going for and to write targeted revisions in your revised_prompt. If something needs fixing, show exactly what to change in the prompt to fix it.`
        : `NO ORIGINAL PROMPT PROVIDED — The user uploaded this image without including the prompt they used. Reverse-engineer a complete prompt from what you observe in the image (put this in revised_prompt) so the user has a starting point for iteration.`;

    const modelSection = targetModel && modelKBContent
        ? `TARGET MODEL: ${targetModel}\nMODEL-SPECIFIC SYNTAX GUIDE:\n${modelKBContent}\n\nIMPORTANT: The revised_prompt MUST use the exact syntax, parameters, and conventions for ${targetModel} as described in the guide above. Include model-specific flags (e.g., --ar, --v, --s, --oref for Midjourney).`
        : targetModel
            ? `TARGET MODEL: ${targetModel}\nWrite the revised_prompt using the correct syntax and conventions for ${targetModel}.`
            : 'No target model specified. Write the revised_prompt in generic natural language that works across models.';

    const userPrompt = `${kbContent ? `KNOWLEDGE BASE (use for evaluation criteria):\n${kbContent}\n\n` : ''}${modelKBContent ? `MODEL GUIDE:\n${modelKBContent}\n\n` : ''}${projectBlock}
${contextLines.length > 0 ? `\n${entityLabel.toUpperCase()} DETAILS:\n${contextLines.join('\n')}\n` : ''}
${promptSection}
${iterationContext}
${modelSection}

Analyze the uploaded ${entityLabel.toLowerCase()} reference image across ALL 6 dimensions. Compare against the project DNA and ${entityLabel.toLowerCase()} description. Score the IMAGE QUALITY itself — not how well it matches a prompt.

For each dimension, provide:
1. A score (0-10)
2. Specific observations (what works, what doesn't)

Then provide:
- Overall weighted score (0-100)
- Verdict (STRONG MATCH / NEEDS TWEAKS / SIGNIFICANT MISMATCH)
- List of specific issues found
- What specifically works well
- Suggested prompt adjustments to fix identified issues (if a prompt was provided, reference specific parts to change; if not, write suggestions from scratch)
- A complete revised prompt that addresses all identified issues (if a prompt was provided, start from it and show what changed; if not, write one from scratch based on the image). Format this prompt for ${targetModel || 'the target model'}.
- A reference strategy recommendation: should the user attach the current image as a reference image when re-generating with the revised prompt, or start completely fresh? Consider: if the image has the right subject/composition but wrong style/lighting/details, reference + revised prompt is best. If the image has fundamental issues (wrong subject, wrong composition, wrong everything), fresh start is better.

OUTPUT VALID JSON ONLY:
{
  "overall_score": <0-100>,
  "verdict": "STRONG MATCH" | "NEEDS TWEAKS" | "SIGNIFICANT MISMATCH",
  "dimensions": {
    "physics": {
      "score": <0-10>,
      "notes": "Lighting direction consistency, shadow accuracy, perspective, physical plausibility, reflections"
    },
    "style_consistency": {
      "score": <0-10>,
      "notes": "How well the image matches the project's aesthetic, tone, mood, color palette. Check for AI artifacts like HDR sheen, plastic textures"
    },
    "lighting_atmosphere": {
      "score": <0-10>,
      "notes": "Motivated light sources, atmospheric depth, contrast ratio, color temperature, key/fill balance"
    },
    "clarity": {
      "score": <0-10>,
      "notes": "Sharpness, depth of field, focus accuracy, absence of unwanted blur/noise, optical quality"
    },
    "composition": {
      "score": <0-10>,
      "notes": "Subject placement, framing, scale relationships, negative space, overall visual balance"
    },
    "${entityType === 'character' ? 'character_identity' : 'object_accuracy'}": {
      "score": <0-10>,
      "notes": "${entityType === 'character' ? 'Facial accuracy, clothing/wardrobe consistency, body proportions, expression, absence of uncanny valley artifacts' : 'Object accuracy vs description, material/texture fidelity, scale correctness, detail accuracy, absence of AI distortion'}"
    }
  },
  "realism_diagnosis": [
    {
      "pattern": "AI Plastic Look" | "Flat / Lifeless" | "CGI / Game Engine Look" | "Lighting Drift",
      "severity": "severe" | "moderate",
      "details": "What specifically triggers this diagnosis",
      "fix": "Specific prompt-level fix"
    }
  ],
  "issues": [
    {
      "category": "description_mismatch" | "style_issue" | "ai_artifact" | "composition" | "quality" | "realism",
      "detail": "What specifically is wrong",
      "severity": "minor" | "moderate" | "major"
    }
  ],
  "what_works": ["Specific element that matches well"],
  "prompt_adjustments": ["Specific change: add/remove/modify X in the prompt"],
  "revised_prompt": "Complete revised prompt with all fixes applied, formatted for ${targetModel || 'generic use'}, ready to copy and paste",
  "reference_strategy": {
    "action": "use_reference" | "fresh_start" | "ref_optional",
    "reason": "Brief explanation of why — e.g., 'The subject and composition are solid, so using this image as a reference will help preserve the good parts while the revised prompt fixes the lighting issues' or 'Fundamental composition and subject issues mean starting fresh will give better results than trying to iterate'"
  },
  "stagnation_alert": null | {
    "detected": true,
    "diagnosis": "Why the current model/approach is plateauing — be specific about the model's limitations for this subject",
    "recommended_model": "Name of the recommended model (e.g., 'flux-pro', 'midjourney', 'dall-e-3')",
    "recommended_model_reason": "Why this model would do better — cite specific strengths relevant to the issues found",
    "revised_prompt_for_recommended": "Complete revised prompt formatted for the RECOMMENDED model (not the current one)"
  },
  "summary": "2-3 sentence assessment"
}`;

    const parts = [];

    // If we have a reference image for comparison (turnaround sheets), include it first
    if (referenceImageBuffer) {
        parts.push({
            inlineData: {
                mimeType: referenceImageMimeType || 'image/jpeg',
                data: referenceImageBuffer.toString('base64'),
            }
        });
        parts.push({ text: `↑ This is the REFERENCE IMAGE — the master visual anchor for this ${entityLabel.toLowerCase()}. The turnaround sheet below must match this reference.` });
    }

    // The image being analyzed
    parts.push({
        inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBuffer.toString('base64'),
        }
    });
    parts.push({ text: `↑ Analyze this ${entityLabel.toLowerCase()} ${imageTypeLabel} using the Holistic Image Audit framework.${referenceImageBuffer ? ' Compare against the reference image above.' : ''}\n\n` + userPrompt });

    try {
        const text = await callGemini({
            parts,
            systemInstruction,
            thinkingLevel: 'low',  // lower thinking = less reasoning variability for scoring consistency
            temperature: 0,
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
                throw new Error('Could not parse entity image analysis JSON');
            }
        }

        // Normalize the 6th dimension key (character_identity or object_accuracy)
        const sixthDimKey = entityType === 'character' ? 'character_identity' : 'object_accuracy';
        const rawSixthDim = parsed.dimensions?.[sixthDimKey] || parsed.dimensions?.character_identity || parsed.dimensions?.object_accuracy;

        const dimensions = {
            physics: { score: Math.min(10, Math.max(0, parsed.dimensions?.physics?.score || 0)), notes: parsed.dimensions?.physics?.notes || '' },
            style_consistency: { score: Math.min(10, Math.max(0, parsed.dimensions?.style_consistency?.score || 0)), notes: parsed.dimensions?.style_consistency?.notes || '' },
            lighting_atmosphere: { score: Math.min(10, Math.max(0, parsed.dimensions?.lighting_atmosphere?.score || 0)), notes: parsed.dimensions?.lighting_atmosphere?.notes || '' },
            clarity: { score: Math.min(10, Math.max(0, parsed.dimensions?.clarity?.score || 0)), notes: parsed.dimensions?.clarity?.notes || '' },
            composition: { score: Math.min(10, Math.max(0, parsed.dimensions?.composition?.score || 0)), notes: parsed.dimensions?.composition?.notes || '' },
            [sixthDimKey]: { score: Math.min(10, Math.max(0, rawSixthDim?.score || 0)), notes: rawSixthDim?.notes || '' },
        };

        const overallScore = Math.min(100, Math.max(0, parsed.overall_score || 0));

        return {
            overall_score: overallScore,
            verdict: ['STRONG MATCH', 'NEEDS TWEAKS', 'SIGNIFICANT MISMATCH'].includes(parsed.verdict)
                ? parsed.verdict
                : (overallScore >= 85 ? 'STRONG MATCH' : overallScore >= 60 ? 'NEEDS TWEAKS' : 'SIGNIFICANT MISMATCH'),
            dimensions,
            realism_diagnosis: Array.isArray(parsed.realism_diagnosis)
                ? parsed.realism_diagnosis.filter(d => d && d.pattern && d.severity && d.severity !== 'none')
                : [],
            issues: Array.isArray(parsed.issues) ? parsed.issues : [],
            what_works: Array.isArray(parsed.what_works) ? parsed.what_works : [],
            prompt_adjustments: Array.isArray(parsed.prompt_adjustments) ? parsed.prompt_adjustments : [],
            revised_prompt: parsed.revised_prompt || originalPrompt,
            reference_strategy: parsed.reference_strategy && parsed.reference_strategy.action
                ? { action: parsed.reference_strategy.action, reason: parsed.reference_strategy.reason || '' }
                : null,
            stagnation_alert: parsed.stagnation_alert && parsed.stagnation_alert.detected
                ? {
                    detected: true,
                    diagnosis: parsed.stagnation_alert.diagnosis || '',
                    recommended_model: parsed.stagnation_alert.recommended_model || '',
                    recommended_model_reason: parsed.stagnation_alert.recommended_model_reason || '',
                    revised_prompt_for_recommended: parsed.stagnation_alert.revised_prompt_for_recommended || '',
                }
                : null,
            summary: parsed.summary || '',
        };
    } catch (error) {
        console.error('[gemini] Entity image analysis error:', error);
        throw error;
    }
}

export {
    holisticImageAudit,
    analyzeEntityImage,
};
