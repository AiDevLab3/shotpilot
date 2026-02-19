/**
 * Cine-AI Prompt Compiler
 * 
 * Translates creative briefs into model-specific optimized prompts.
 * Think of it like a programming language compiler:
 *   Creative brief (source) → KB + Translation Matrix → Model-specific prompt (target)
 */
import { loadKB, resolveModelName } from './kb-loader.js';
import { callText } from './gemini.js';

/**
 * Compile a creative brief into a model-specific prompt.
 * 
 * @param {object} brief - The creative brief
 * @param {string} brief.description - What the shot should show (required)
 * @param {string} brief.shotType - Shot type (e.g., "Wide Shot", "Close-up")
 * @param {string} brief.mood - Mood/tone (e.g., "neo-noir", "warm", "tense")
 * @param {string} brief.lighting - Lighting direction (e.g., "blue-teal, high contrast")
 * @param {object[]} brief.characters - Characters in the shot [{name, description}]
 * @param {object[]} brief.objects - Objects/props [{name, description}]
 * @param {object} brief.styleProfile - Reusable style constraints
 * @param {string} brief.styleProfile.name - Profile name (e.g., "tcpw-dark-knight")
 * @param {string} brief.styleProfile.aesthetic - Visual style description
 * @param {string} brief.styleProfile.colorPalette - Color direction
 * @param {string} brief.styleProfile.lensProfile - Camera/lens defaults
 * @param {string} brief.styleProfile.avoidList - Things to avoid in generation
 * @param {string} targetModel - Target model name (e.g., "nano-banana-pro", "midjourney")
 * @returns {{ prompt: string, assumptions: string[], tokensUsed: number, model: string }}
 */
async function compile(brief, targetModel) {
  const resolved = resolveModelName(targetModel);
  const hasChars = brief.characters && brief.characters.length > 0;
  
  // Load tiered KB — only what's needed
  const kb = loadKB(targetModel, {
    tier: 'compile',
    shotType: brief.shotType,
    hasCharacters: hasChars,
  });

  console.log(`[compiler] KB loaded: ${kb.tokens} tokens (${kb.sections.join(', ')})`);

  // Build the context
  const briefText = buildBriefText(brief);
  const styleText = brief.styleProfile ? buildStyleText(brief.styleProfile) : '';

  const systemInstruction = `You are the Cine-AI Prompt Compiler — an expert system that translates creative briefs into model-specific prompts. You have deep knowledge of how ${targetModel} interprets prompt language — its exact syntax, parameters, strengths, and failure modes.

CRITICAL RULES:
1. Output ONLY the ready-to-use prompt. No preamble, no explanation, no markdown formatting.
2. Follow the ${targetModel} KB syntax EXACTLY — parameters, structure, word order.
3. Include safety framing: "Cinematic film still" or "A scene from a feature film" to pass content filters. Do NOT describe crew, cameras, or behind-the-scenes elements — the frame should look like a final film frame, not a BTS photo.
4. Include anti-AI-artifact language: avoid CGI, plastic skin, HDR glow, hyper-detailed, 8K clarity, waxy texture.
5. Include filmic entropy: natural grain, motivated lighting with physical sources, micro-imperfections.
6. Reference characters by EXACT NAME from the brief.
7. Every technical choice (lens, f-stop, lighting) must be specifically motivated by the shot's intent.
8. The brief description is THE NON-NEGOTIABLE INTENT. Do not trade brief adherence for technical polish. If the brief says "clearly visible logo projected in the sky," the logo MUST be prominent and legible. Period.

After the prompt, on a new line starting with "// Assumptions:", list your technical choices and why.`;

  const prompt = `${kb.content}

${styleText}

CREATIVE BRIEF:
${briefText}

TARGET MODEL: ${targetModel}

Generate the ${targetModel}-optimized prompt now. Output the prompt first, then assumptions.`;

  const result = await callText({
    prompt,
    systemInstruction,
    thinkingLevel: 'high',
    maxOutputTokens: 2048,
  });

  // Parse prompt and assumptions
  const splitIdx = result.indexOf('// Assumptions:');
  const compiledPrompt = splitIdx > -1 ? result.substring(0, splitIdx).trim() : result.trim();
  const assumptions = splitIdx > -1
    ? result.substring(splitIdx).split('\n').filter(l => l.trim().startsWith('//')).map(l => l.replace(/^\/\/\s*-?\s*/, '').trim()).filter(Boolean)
    : [];

  return {
    prompt: compiledPrompt,
    assumptions,
    tokensUsed: kb.tokens,
    model: resolved,
    kbSections: kb.sections,
  };
}

/**
 * Compile the same brief for MULTIPLE models at once.
 * Returns an array of compiled prompts — same intent, different model syntax.
 */
async function compileMulti(brief, targetModels) {
  const results = await Promise.all(
    targetModels.map(model => compile(brief, model).catch(err => ({
      model: resolveModelName(model),
      error: err.message,
    })))
  );
  return results;
}

/**
 * Build human-readable brief text for the LLM.
 */
function buildBriefText(brief) {
  const lines = [];
  lines.push(`DESCRIPTION: ${brief.description}`);
  if (brief.shotType) lines.push(`SHOT TYPE: ${brief.shotType}`);
  if (brief.mood) lines.push(`MOOD: ${brief.mood}`);
  if (brief.lighting) lines.push(`LIGHTING: ${brief.lighting}`);
  if (brief.timeOfDay) lines.push(`TIME: ${brief.timeOfDay}`);
  if (brief.location) lines.push(`LOCATION: ${brief.location}`);
  if (brief.cameraAngle) lines.push(`CAMERA ANGLE: ${brief.cameraAngle}`);
  if (brief.focalLength) lines.push(`FOCAL LENGTH: ${brief.focalLength}`);
  if (brief.aspectRatio) lines.push(`ASPECT RATIO: ${brief.aspectRatio}`);

  if (brief.characters?.length) {
    lines.push('\nCHARACTERS:');
    brief.characters.forEach(c => {
      lines.push(`  - ${c.name}: ${c.description || 'No description'}`);
      if (c.wardrobe) lines.push(`    Wardrobe: ${c.wardrobe}`);
      if (c.action) lines.push(`    Action: ${c.action}`);
    });
  }

  if (brief.objects?.length) {
    lines.push('\nOBJECTS/PROPS:');
    brief.objects.forEach(o => {
      lines.push(`  - ${o.name}: ${o.description || 'No description'}`);
    });
  }

  if (brief.constraints) {
    lines.push(`\nCONSTRAINTS: ${brief.constraints}`);
  }

  return lines.join('\n');
}

/**
 * Build style profile text.
 */
function buildStyleText(style) {
  const lines = ['STYLE PROFILE:'];
  if (style.name) lines.push(`  Name: ${style.name}`);
  if (style.aesthetic) lines.push(`  Aesthetic: ${style.aesthetic}`);
  if (style.colorPalette) lines.push(`  Color Palette: ${style.colorPalette}`);
  if (style.lensProfile) lines.push(`  Lens/Camera: ${style.lensProfile}`);
  if (style.filmReferences) lines.push(`  Film References: ${style.filmReferences}`);
  if (style.avoidList) lines.push(`  AVOID: ${style.avoidList}`);
  return lines.join('\n');
}

export { compile, compileMulti };
