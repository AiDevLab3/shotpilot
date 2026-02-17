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
            thinkingLevel: 'high',
            temperature: 0, // deterministic scoring — same image should get same scores
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
async function analyzeEntityImage({ imageBuffer, mimeType, originalPrompt, entityType, entityName, entityDescription, project, kbContent }) {
    const projectBlock = project ? buildContextBlock('PROJECT', project) : '';
    const entityLabel = entityType === 'character' ? 'Character' : 'Object';

    const systemInstruction = `You are an expert Holistic Image Auditor for AI-generated cinematography, specifically evaluating ${entityLabel.toLowerCase()} reference images. You analyze images with the eye of a seasoned Director of Photography, evaluating them across 6 critical dimensions for professional production quality.

CRITICAL CONTEXT: This is a ${entityLabel.toLowerCase()} reference image that will be used as a visual anchor for shots in the production. The quality, style, and realism standards you evaluate here MUST be the same standards applied to final shot images. If this reference passes your audit but has hidden quality issues (AI plastic look, wrong lighting style, etc.), those issues will propagate into every shot featuring this ${entityLabel.toLowerCase()}.

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

For each pattern detected, classify severity as "severe" (dominates the image), "moderate" (noticeable but not dominant), or "none" (not present). Only include patterns that are actually present (not "none").`;

    const contextLines = [];
    if (entityName) contextLines.push(`${entityLabel} Name: ${entityName}`);
    if (entityDescription) contextLines.push(`${entityLabel} Description: ${entityDescription}`);

    const userPrompt = `${kbContent ? `KNOWLEDGE BASE (use for evaluation criteria):\n${kbContent}\n\n` : ''}${projectBlock}
${contextLines.length > 0 ? `\n${entityLabel.toUpperCase()} DETAILS:\n${contextLines.join('\n')}\n` : ''}
ORIGINAL PROMPT USED TO GENERATE THIS IMAGE:
${originalPrompt}

Analyze the uploaded ${entityLabel.toLowerCase()} reference image across ALL 6 dimensions. Compare against the project DNA and ${entityLabel.toLowerCase()} description. Also evaluate how well the image matches the original prompt.

For each dimension, provide:
1. A score (0-10)
2. Specific observations (what works, what doesn't)

Then provide:
- Overall weighted score (0-100)
- Verdict (STRONG MATCH / NEEDS TWEAKS / SIGNIFICANT MISMATCH)
- List of specific issues found
- What specifically works well
- Suggested prompt adjustments to fix identified issues
- A complete revised prompt with all fixes applied

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
  "revised_prompt": "Complete revised prompt with all fixes applied, ready to copy and paste",
  "summary": "2-3 sentence assessment"
}`;

    const parts = [
        {
            inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBuffer.toString('base64'),
            }
        },
        { text: `↑ Analyze this ${entityLabel.toLowerCase()} reference image using the Holistic Image Audit framework.\n\n` + userPrompt }
    ];

    try {
        const text = await callGemini({
            parts,
            systemInstruction,
            thinkingLevel: 'high',
            temperature: 0, // deterministic scoring — same image should get same scores
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
