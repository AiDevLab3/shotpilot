/**
 * Image Audit System — evaluates generated images against brief intent + technical quality.
 * 
 * Key difference from ShotPilot's audit: includes BRIEF ADHERENCE as a weighted dimension.
 * This prevents the "optimizes for realism, loses the brief" problem.
 */
import { callVision } from './gemini.js';
import { loadKB } from './kb-loader.js';

/**
 * Audit a generated image against its brief.
 * 
 * @param {Buffer} imageBuffer - The image data
 * @param {string} mimeType - Image MIME type
 * @param {object} brief - The original creative brief
 * @param {string} modelUsed - Which model generated this
 * @returns {object} Audit result with scores, issues, and routing recommendation
 */
async function auditImage(imageBuffer, mimeType, brief, modelUsed) {
  const kb = loadKB(modelUsed, { tier: 'audit' });

  const systemInstruction = `You are the Cine-AI Image Auditor — a seasoned Director of Photography who evaluates AI-generated images against their creative briefs.

CRITICAL: You evaluate TWO things equally:
1. TECHNICAL QUALITY — physics, lighting, realism, composition (standard cinematography)
2. BRIEF ADHERENCE — does this image deliver what was asked for? This is NON-NEGOTIABLE.

A technically perfect image that doesn't match the brief is a FAILURE.
A rougher image that nails the brief intent is BETTER than a polished miss.

SCORING (7 dimensions, weighted):
- Brief Adherence (weight 3): 30% — Does the image show what the brief asked for?
- Physics (weight 1.5): 15% — Lighting consistency, shadows, perspective, plausibility
- Style Consistency (weight 1.5): 15% — Matches project aesthetic, no AI artifacts
- Lighting & Atmosphere (weight 1): 10% — Motivated sources, contrast, color temp
- Clarity (weight 0.5): 5% — Sharpness, DoF, focus accuracy
- Composition (weight 1): 10% — Framing, subject placement, visual balance
- Character/Object Identity (weight 1.5): 15% — Accuracy to descriptions, consistency

OVERALL SCORE: 0-100 weighted sum.

ROUTING RECOMMENDATION (most important output):
- ACCEPT (90-100): Production ready.
- REFINE_SAME_MODEL (75-89): Good foundation, targeted prompt fix can improve.
- SWITCH_MODEL (50-74): This model is hitting its ceiling for this content. Recommend a better model.
- REGENERATE (0-49): Fundamental failure. Needs complete rethink.

When recommending SWITCH_MODEL, you MUST suggest which model would do better and WHY.

Respond with valid JSON only.`;

  const briefSummary = [
    `DESCRIPTION: ${brief.description}`,
    brief.shotType ? `SHOT TYPE: ${brief.shotType}` : '',
    brief.mood ? `MOOD: ${brief.mood}` : '',
    brief.lighting ? `LIGHTING: ${brief.lighting}` : '',
    brief.characters?.length ? `CHARACTERS: ${brief.characters.map(c => c.name).join(', ')}` : '',
    brief.objects?.length ? `OBJECTS: ${brief.objects.map(o => o.name).join(', ')}` : '',
    brief.styleProfile?.aesthetic ? `STYLE: ${brief.styleProfile.aesthetic}` : '',
  ].filter(Boolean).join('\n');

  const userPrompt = `${kb.content ? `KNOWLEDGE BASE:\n${kb.content}\n\n` : ''}MODEL USED: ${modelUsed}

ORIGINAL BRIEF:
${briefSummary}

Audit this image against the brief. Score all 7 dimensions. Provide routing recommendation.

OUTPUT JSON:
{
  "overall_score": <0-100>,
  "recommendation": "ACCEPT" | "REFINE_SAME_MODEL" | "SWITCH_MODEL" | "REGENERATE",
  "dimensions": {
    "brief_adherence": { "score": <0-10>, "notes": "Does the image show what was asked for? Every element from the brief accounted for." },
    "physics": { "score": <0-10>, "notes": "" },
    "style_consistency": { "score": <0-10>, "notes": "" },
    "lighting_atmosphere": { "score": <0-10>, "notes": "" },
    "clarity": { "score": <0-10>, "notes": "" },
    "composition": { "score": <0-10>, "notes": "" },
    "identity": { "score": <0-10>, "notes": "" }
  },
  "issues": ["issue 1", "issue 2"],
  "prompt_fixes": ["specific change to make in the prompt"],
  "routing": {
    "current_model": "${modelUsed}",
    "recommended_model": "<same or different model>",
    "reason": "Why this model, or why switch"
  },
  "summary": "2-3 sentence assessment"
}`;

  const parts = [
    { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBuffer.toString('base64') } },
    { text: `Audit this image.\n\n${userPrompt}` }
  ];

  const text = await callVision({
    parts,
    systemInstruction,
    thinkingLevel: 'low',
    maxOutputTokens: 2048,
  });

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    else throw new Error('Could not parse audit response');
  }

  // Normalize
  return {
    overall_score: Math.min(100, Math.max(0, parsed.overall_score || 0)),
    recommendation: parsed.recommendation || 'REGENERATE',
    dimensions: parsed.dimensions || {},
    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    prompt_fixes: Array.isArray(parsed.prompt_fixes) ? parsed.prompt_fixes : [],
    routing: parsed.routing || { current_model: modelUsed, recommended_model: modelUsed, reason: '' },
    summary: parsed.summary || '',
  };
}

export { auditImage };
