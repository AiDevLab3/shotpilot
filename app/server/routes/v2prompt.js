/**
 * Expert Prompt Generation Route — POST /api/v2/prompt
 * Generates model-specific expert prompts using KB guides + Translation Matrix + Packs
 * ShotPilot v2
 */
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getModelById } from '../services/modelRegistry.js';
import { callGemini } from '../services/ai/shared.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_ROOT = path.join(__dirname, '../../kb');

/**
 * Load KB content for a model — tries full guide first, then condensed
 */
function loadModelKB(modelId, model) {
  let content = '';
  
  // Full Prompting_Mastery guide
  if (model.kbPath) {
    const fullPath = path.join(KB_ROOT, model.kbPath, 'Prompting_Mastery.md');
    if (fs.existsSync(fullPath)) {
      const raw = fs.readFileSync(fullPath, 'utf-8');
      content += `\n=== ${model.name} Prompting Mastery Guide ===\n${raw.slice(0, 12000)}\n`;
    }
  }

  // Condensed version (if full is too big or missing)
  const condensedDir = path.join(KB_ROOT, 'condensed');
  if (fs.existsSync(condensedDir)) {
    const condensedFiles = fs.readdirSync(condensedDir).filter(f => 
      f.toLowerCase().includes(modelId.replace(/_/g, '').toLowerCase().slice(0, 8)) ||
      f.toLowerCase().includes(model.name.toLowerCase().split(' ')[0])
    );
    for (const f of condensedFiles.slice(0, 1)) {
      const raw = fs.readFileSync(path.join(condensedDir, f), 'utf-8');
      if (content.length < 2000) {
        content += `\n=== Condensed Guide: ${f} ===\n${raw.slice(0, 6000)}\n`;
      }
    }
  }

  return content;
}

/**
 * Load core packs for realism/quality context
 */
function loadCorePacks() {
  let content = '';
  const packsDir = path.join(KB_ROOT, 'packs');
  if (!fs.existsSync(packsDir)) return content;

  // Load cinematic realism pack (most critical)
  const realismPack = path.join(packsDir, 'Cine-AI_Cinematic_Realism_Pack_v1.md');
  if (fs.existsSync(realismPack)) {
    const raw = fs.readFileSync(realismPack, 'utf-8');
    // Extract the critical blocks: REALISM_LOCK_BLOCK, LENS_BLOCK, LIGHTING_MOTIVATION_BLOCK
    const blocks = raw.match(/\*\*(REALISM_LOCK_BLOCK|Universal Negative Pack|LENS_BLOCK|LIGHTING_MOTIVATION_BLOCK)\*\*[\s\S]*?(?=\*\*[A-Z]|\n##|\n---)/g);
    if (blocks) {
      content += '\n=== Core Realism Blocks ===\n' + blocks.join('\n') + '\n';
    } else {
      content += '\n=== Cinematic Realism Pack (excerpt) ===\n' + raw.slice(0, 3000) + '\n';
    }
  }

  return content;
}

/**
 * Load translation matrix for cross-model prompt translation
 */
function loadTranslationMatrix() {
  const matrixPath = path.join(KB_ROOT, 'translation', 'translation-matrix.md');
  if (fs.existsSync(matrixPath)) {
    return fs.readFileSync(matrixPath, 'utf-8');
  }
  return '';
}

const router = Router();

router.post('/api/v2/prompt', async (req, res) => {
  try {
    const { modelId, strategy, analysisResult, sourceImageUrl, userNotes, projectStyle, shotDescription } = req.body;

    if (!modelId) return res.status(400).json({ error: 'modelId required' });
    if (!analysisResult) return res.status(400).json({ error: 'analysisResult required' });

    const model = getModelById(modelId);
    if (!model) return res.status(400).json({ error: `Unknown model: ${modelId}` });

    // Load all relevant KB content
    const modelKB = loadModelKB(modelId, model);
    const corePacks = loadCorePacks();
    const translationMatrix = loadTranslationMatrix();

    // Build the system prompt — this is the core of expert prompt generation
    const systemPrompt = `You are the Cine-AI Prompt Compiler — the world's foremost expert on generating model-specific prompts for cinematic AI image generation. You have encyclopedic knowledge of every model's syntax, quirks, strengths, and failure modes.

YOUR TASK: Generate a precise, production-ready prompt for ${model.name} (${model.provider}) to ${strategy === 'edit' ? 'edit/improve an existing image' : 'generate a new image from scratch'}.

═══════════════════════════════════════════════════════════════
MODEL PROFILE: ${model.name}
═══════════════════════════════════════════════════════════════
- Provider: ${model.provider}
- Capabilities: ${(model.capabilities || []).join(', ')}
- Strengths: ${(model.strengths || []).join(', ')}
- Weaknesses: ${(model.weaknesses || []).join(', ')}
- Best For: ${(model.bestFor || []).join(', ')}
- Worst For: ${(model.worstFor || []).join(', ')}
${model.active ? `- API Endpoint: ${model.endpoint}` : '- EXTERNAL ONLY: Generate prompt for manual use'}
${strategy === 'edit' && model.editEndpoint ? `- Edit Endpoint: ${model.editEndpoint}` : ''}

═══════════════════════════════════════════════════════════════
CURRENT IMAGE ANALYSIS
═══════════════════════════════════════════════════════════════
- Verdict: ${analysisResult.verdict} (Score: ${analysisResult.score}/100)
- Style Match: ${analysisResult.styleMatch}/10
- Realism: ${analysisResult.realism}/10
- Diagnosis: ${analysisResult.diagnosis || 'N/A'}
- Issues: ${(analysisResult.issues || []).join('; ')}
- Suggested Fixes: ${(analysisResult.fixes || []).join('; ')}
- Strategy: ${strategy} (${strategy === 'edit' ? 'preserve what works, fix what doesn\'t' : 'regenerate with corrected parameters'})
${userNotes ? `- User Notes: ${userNotes}` : ''}
${shotDescription ? `- Shot Description: ${shotDescription}` : ''}
${projectStyle ? `- Project Style: ${JSON.stringify(projectStyle)}` : ''}

═══════════════════════════════════════════════════════════════
MODEL-SPECIFIC KNOWLEDGE BASE
═══════════════════════════════════════════════════════════════
${modelKB || '(No specific KB guide available for this model — use general best practices)'}

═══════════════════════════════════════════════════════════════
CINEMATIC REALISM RULES (ALWAYS APPLY)
═══════════════════════════════════════════════════════════════
${corePacks || `
REALISM_LOCK_BLOCK (always include):
- cinematic still frame, raw photographed realism, captured through a physical lens
- natural depth of field, realistic highlight rolloff, subtle filmic grain
- physically plausible lighting and shadows, realistic skin texture (no plastic)
- imperfect real-world entropy: mild wear, micro-scratches, natural variation
- avoid AI sheen, avoid HDR/glow, avoid sterile symmetry

NEGATIVE (always exclude):
- no CGI, no render, no plastic skin, no waxy texture, no hyper-detailed, no oversharpened
- no HDR, no perfect symmetry, no airbrushed skin, no unnatural bokeh`}

═══════════════════════════════════════════════════════════════
PROMPT GENERATION RULES
═══════════════════════════════════════════════════════════════
1. Follow the model's EXACT syntax from the KB guide (parameters, formatting, structure)
2. Address EVERY issue listed in the diagnosis — don't skip any
3. ALWAYS include realism-preserving language appropriate for this model
4. NEVER use AI kill-words: "hyper detailed", "8K", "perfect", "flawless", "ultra realistic"
5. For EDIT strategy: specify what to PRESERVE vs what to CHANGE
6. For REGENERATE strategy: build the complete prompt from scratch incorporating all fixes
7. Be specific about: lighting direction + color temp, lens focal length + aperture, atmosphere/weather
8. Include ONE motivated light source minimum
9. Specify camera angle and composition explicitly
10. For external models (Midjourney, etc.): include model-specific parameters (--ar, --s, --oref, etc.)

OUTPUT FORMAT:
- Output ONLY the prompt text — no explanation, no markdown headers, no commentary
- If the model uses specific formatting (e.g., Kling 3.0's [SCENE]/[CAMERA] layers), use that format
- If it's an external model, include all parameters in the correct syntax

Generate the prompt now.`;

    const result = await callGemini({
      parts: [{ text: 'Generate the expert prompt.' }],
      systemInstruction: systemPrompt,
      thinkingLevel: 'medium',
      maxOutputTokens: 2048,
    });

    // Clean up the response
    let prompt = result.trim();
    // Remove markdown code fences if present
    prompt = prompt.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim();
    // Remove any "Here is the prompt:" type prefixes
    prompt = prompt.replace(/^(here'?s?\s+(the\s+)?prompt:?\s*)/i, '').trim();

    // Build syntax notes
    let syntaxNotes = '';
    if (model.active) {
      syntaxNotes = `Optimized for ${model.name} via ${model.provider === 'fal' ? 'fal.ai' : model.provider === 'openai' ? 'OpenAI' : model.provider} API.`;
      if (strategy === 'edit' && model.editEndpoint) {
        syntaxNotes += ` Using edit endpoint: ${model.editEndpoint}`;
      }
    } else {
      syntaxNotes = `${model.name} is external-only. Copy this prompt and use it in the ${model.name} interface.`;
      if (model.description) syntaxNotes += ` ${model.description}`;
    }

    // Add model capability notes
    const caps = [];
    if (model.capabilities?.includes('character-consistency')) caps.push('Supports character consistency references');
    if (model.capabilities?.includes('inpaint')) caps.push('Supports inpainting for targeted edits');
    if (model.variants) {
      const variantNames = Object.entries(model.variants).map(([k, v]) => `${k}: ${v.description}`);
      if (variantNames.length > 0) caps.push(`Variants available: ${variantNames.join(', ')}`);
    }
    if (caps.length > 0) syntaxNotes += '\n' + caps.join('. ') + '.';

    res.json({ prompt, modelSyntaxNotes: syntaxNotes });
  } catch (error) {
    console.error('[v2prompt] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
