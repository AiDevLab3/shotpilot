/**
 * Tiered KB Loader — loads only what's needed for the task at hand.
 * 
 * Tier 1 (always): Model-specific syntax + anti-AI-artifact rules
 * Tier 2 (conditional): Shot-type-specific techniques
 * Tier 3 (refinement only): Full diagnostic context
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_ROOT = path.join(__dirname, '../../kb');

// Model name normalization map
const MODEL_ALIASES = {
  'nano-banana-pro': 'nano_banana_pro',
  'nano_banana_pro': 'nano_banana_pro',
  'midjourney': 'midjourney',
  'gpt-image': 'gpt_image_1_5',
  'gpt-image-1.5': 'gpt_image_1_5',
  'gpt_image_1_5': 'gpt_image_1_5',
  'higgsfield': 'higgsfield_cinema_studio_v1_5',
  'higgsfield-cinema': 'higgsfield_cinema_studio_v1_5',
  'higgsfield_cinema_studio_v1_5': 'higgsfield_cinema_studio_v1_5',
  'kling-2.6': 'kling_2_6',
  'kling_2_6': 'kling_2_6',
  'kling-3.0': 'kling_3_0',
  'veo-3.1': 'veo_3_1',
  'veo_3_1': 'veo_3_1',
  'flux': 'flux_2',
  'flux-2': 'flux_2',
  'flux_2': 'flux_2',
  'runway': 'runway_gen4_5',
  'runway_gen4_5': 'runway_gen4_5',
  'imagen-4': 'imagen_4',
  'sora': 'sora_2',
  'sora-2': 'sora_2',
  'gpt-image-1': 'gpt_image_1',
  'gpt_image_1': 'gpt_image_1',
  'openai': 'gpt_image_1_5',
  'recraft-v4': 'recraft_v4',
  'recraft_v4': 'recraft_v4',
  'recraft': 'recraft_v4',
  'kling-3.0': 'kling_3_0',
  'kling_3_0': 'kling_3_0',
  'kling-3': 'kling_3_0',
  'grok-imagine': 'grok_imagine',
  'grok_imagine': 'grok_imagine',
  'grok': 'grok_imagine',
  'veo-3.1': 'veo_3_1',
  'veo_3_1': 'veo_3_1',
  'veo': 'veo_3_1',
  'wan-2.6': 'wan_2_6',
  'wan_2_6': 'wan_2_6',
  'wan': 'wan_2_6',
  'seedream-4.5': 'seedream_4_5',
  'seedream_4_5': 'seedream_4_5',
  'seedream': 'seedream_4_5',
  'z-image': 'z_image',
  'z_image': 'z_image',
  'minimax-hailuo': 'minimax_hailuo_02',
  'minimax_hailuo_02': 'minimax_hailuo_02',
  'minimax': 'minimax_hailuo_02',
  'hailuo': 'minimax_hailuo_02',
  'seedance-1.5-pro': 'seedance_1_5_pro',
  'seedance_1_5_pro': 'seedance_1_5_pro',
  'seedance': 'seedance_1_5_pro',
  'sora_2': 'sora_2',
  'reve': 'reve',
  'topaz': 'topaz',

  // Flux Kontext
  'flux-kontext': 'flux_kontext_pro',
  'flux-kontext-pro': 'flux_kontext_pro',
  'flux_kontext_pro': 'flux_kontext_pro',
  'kontext': 'flux_kontext_pro',
  'kontext-pro': 'flux_kontext_pro',
  'flux-kontext-max': 'flux_kontext_max',
  'flux_kontext_max': 'flux_kontext_max',
  'kontext-max': 'flux_kontext_max',
  'flux-kontext-t2i': 'flux_kontext_t2i',
  'flux_kontext_t2i': 'flux_kontext_t2i',
  'kontext-t2i': 'flux_kontext_t2i',

  // Kling Image
  'kling-image-v3': 'kling_image_v3',
  'kling_image_v3': 'kling_image_v3',
  'kling-image': 'kling_image_v3',
  'kling-image-o3': 'kling_image_o3',
  'kling_image_o3': 'kling_image_o3',

  // Qwen Image Max
  'qwen-image-max': 'qwen_image_max',
  'qwen_image_max': 'qwen_image_max',
  'qwen-image': 'qwen_image_max',
  'qwen': 'qwen_image_max',

  // Ideogram V3
  'ideogram': 'ideogram_v3',
  'ideogram-v3': 'ideogram_v3',
  'ideogram_v3': 'ideogram_v3',

  // Bria FIBO
  'bria-fibo': 'bria_fibo',
  'bria_fibo': 'bria_fibo',
  'fibo': 'bria_fibo',

  // PixVerse v5.6
  'pixverse': 'pixverse_v56_t2v',
  'pixverse-t2v': 'pixverse_v56_t2v',
  'pixverse-v56-t2v': 'pixverse_v56_t2v',
  'pixverse_v56_t2v': 'pixverse_v56_t2v',
  'pixverse-i2v': 'pixverse_v56_i2v',
  'pixverse-v56-i2v': 'pixverse_v56_i2v',
  'pixverse_v56_i2v': 'pixverse_v56_i2v',

  // Vidu Q3
  'vidu': 'vidu_q3_t2v',
  'vidu-t2v': 'vidu_q3_t2v',
  'vidu-q3-t2v': 'vidu_q3_t2v',
  'vidu_q3_t2v': 'vidu_q3_t2v',
  'vidu-i2v': 'vidu_q3_i2v',
  'vidu-q3-i2v': 'vidu_q3_i2v',
  'vidu_q3_i2v': 'vidu_q3_i2v',

  // LTX-2 19B
  'ltx': 'ltx_2_19b',
  'ltx-2': 'ltx_2_19b',
  'ltx-2-19b': 'ltx_2_19b',
  'ltx_2_19b': 'ltx_2_19b',
};

function resolveModelName(name) {
  const normalized = name.toLowerCase().trim();
  return MODEL_ALIASES[normalized] || normalized;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return null;
  }
}

/**
 * Load KB content with tiered strategy.
 * 
 * @param {string} modelName - Target model name
 * @param {object} options
 * @param {string} options.tier - 'compile' (Tier 1+2), 'refine' (Tier 1+2+3), 'audit' (Tier 1+3)
 * @param {string} options.shotType - Shot type for conditional loading (e.g., 'Close-up', 'Wide Shot')
 * @param {boolean} options.hasCharacters - Whether characters are in the shot
 * @returns {{ content: string, tokens: number, sections: string[] }}
 */
function loadKB(modelName, options = {}) {
  const { tier = 'compile', shotType = null, hasCharacters = false } = options;
  const resolved = resolveModelName(modelName);
  const sections = [];
  const parts = [];

  // ── Tier 1: ALWAYS LOADED ──────────────────────────────────────────
  
  // Model-specific prompting guide
  const modelGuide = readFile(path.join(KB_ROOT, 'models', resolved, 'Prompting_Mastery.md'));
  if (modelGuide) {
    parts.push(`=== ${modelName} Prompting Guide ===\n${modelGuide}`);
    sections.push(`model:${resolved}`);
  } else {
    console.warn(`[kb-loader] No guide found for model: ${resolved}`);
  }

  // Core anti-artifact rules (always critical)
  const coreRealism = readFile(path.join(KB_ROOT, 'core', 'realism-principles.md'))
    || readFile(path.join(KB_ROOT, 'packs', 'Cine-AI_Cinematic_Realism_Pack_v1.md'));
  if (coreRealism) {
    // Extract just the anti-artifact section for Tier 1 (not the full pack)
    const antiArtifact = extractSection(coreRealism, ['artifact', 'avoid', 'realism', 'photographic anchor']);
    if (antiArtifact && tier === 'compile') {
      parts.push(`=== Anti-AI Artifact Rules ===\n${antiArtifact}`);
      sections.push('core:anti-artifact');
    } else {
      parts.push(`=== Core Realism Principles ===\n${coreRealism}`);
      sections.push('core:realism-full');
    }
  }

  // ── Tier 2: CONDITIONAL (shot-type specific) ──────────────────────
  
  if (tier === 'compile' || tier === 'refine') {
    // Character consistency pack — only if characters are in the shot
    if (hasCharacters) {
      const charPack = readFile(path.join(KB_ROOT, 'core', 'character-consistency.md'))
        || readFile(path.join(KB_ROOT, 'packs', 'Cine-AI_Character_Consistency_Pack_v1.md'));
      if (charPack) {
        parts.push(`=== Character Consistency ===\n${charPack}`);
        sections.push('pack:character-consistency');
      }
    }

    // Spatial composition — only for wide/establishing/tracking shots
    const spatialTypes = ['wide shot', 'extreme long shot', 'establishing', 'tracking shot', 'pov shot'];
    if (shotType && spatialTypes.some(t => shotType.toLowerCase().includes(t))) {
      const spatialPack = readFile(path.join(KB_ROOT, 'core', 'spatial-composition.md'))
        || readFile(path.join(KB_ROOT, 'packs', 'Cine-AI_Spatial_Composition_Anatomy_Pack_v1.md'));
      if (spatialPack) {
        parts.push(`=== Spatial Composition ===\n${spatialPack}`);
        sections.push('pack:spatial-composition');
      }
    }
  }

  // ── Tier 3: REFINEMENT/AUDIT ONLY ─────────────────────────────────
  
  if (tier === 'refine' || tier === 'audit') {
    // Full quality control pack
    const qcPack = readFile(path.join(KB_ROOT, 'core', 'quality-control.md'))
      || readFile(path.join(KB_ROOT, 'packs', 'Cine-AI_Quality_Control_Pack_v1.md'));
    if (qcPack) {
      parts.push(`=== Quality Control ===\n${qcPack}`);
      sections.push('pack:quality-control');
    }

    // Translation matrix — only for refinement when considering model switch
    if (tier === 'refine') {
      const matrix = readFile(path.join(KB_ROOT, 'translation', 'translation-matrix.md'));
      if (matrix) {
        parts.push(`=== Translation Matrix ===\n${matrix}`);
        sections.push('translation:matrix');
      }
    }
  }

  const content = parts.join('\n\n');
  const estimatedTokens = Math.round(content.length / 4);

  return { content, tokens: estimatedTokens, sections };
}

/**
 * Extract a section from a document based on keyword matching in headers.
 */
function extractSection(text, keywords) {
  const lines = text.split('\n');
  const extracted = [];
  let capturing = false;
  let headerLevel = 0;

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const title = headerMatch[2].toLowerCase();
      
      if (keywords.some(k => title.includes(k.toLowerCase()))) {
        capturing = true;
        headerLevel = level;
        extracted.push(line);
        continue;
      } else if (capturing && level <= headerLevel) {
        capturing = false;
      }
    }
    
    if (capturing) {
      extracted.push(line);
    }
  }

  return extracted.length > 0 ? extracted.join('\n') : null;
}

/**
 * Get list of all available models.
 */
function getAvailableModels() {
  const modelsDir = path.join(KB_ROOT, 'models');
  if (!fs.existsSync(modelsDir)) return [];
  
  return fs.readdirSync(modelsDir)
    .filter(d => fs.existsSync(path.join(modelsDir, d, 'Prompting_Mastery.md')))
    .map(d => ({
      id: d,
      hasGuide: true,
      guideSize: fs.statSync(path.join(modelsDir, d, 'Prompting_Mastery.md')).size,
    }));
}

export { loadKB, resolveModelName, getAvailableModels, readFile, KB_ROOT };
