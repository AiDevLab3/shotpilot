/**
 * Model Router — recommends the best model for a given shot based on its characteristics.
 * 
 * Uses the Translation Matrix + model capability profiles to make intelligent routing decisions.
 * This is the "which model should I use?" brain.
 */
import { loadKB, resolveModelName, getAvailableModels } from './kb-loader.js';
import { callText } from './gemini.js';
import { generateImage as generateGemini } from './gemini.js';
import { generateFlux2, generateRecraftV4, generateKling3 } from './fal.js';
import { generateOpenAI } from './openai.js';

/**
 * Model capability profiles — what each model is best (and worst) at.
 * This is the distilled knowledge from the KB, kept small for fast routing.
 */
const MODEL_PROFILES = {
  nano_banana_pro: {
    displayName: 'Nano Banana Pro',
    type: 'image',
    strengths: ['conversational editing', '4K output', 'text rendering', 'character consistency (up to 14 refs)', 'physics-aware composition', 'natural language iteration'],
    weaknesses: ['can plateau on photorealism after 3-4 iterations', 'sometimes over-renders clean surfaces'],
    bestFor: ['character portraits', 'object references', 'text-heavy shots', 'iterative refinement'],
    worstFor: ['extreme wide landscapes without subjects', 'highly stylized non-photorealistic'],
    apiAvailable: true,
    provider: 'gemini',
    apiModel: 'nano-banana-pro-preview',
  },
  midjourney: {
    displayName: 'Midjourney',
    type: 'image',
    strengths: ['artistic aesthetics', 'stylized imagery', 'V7 personalization', '--oref character consistency', 'draft mode for rapid iteration'],
    weaknesses: ['no public API', 'text rendering unreliable', 'can be too stylized for photorealism'],
    bestFor: ['concept art', 'stylized hero stills', 'mood boards', 'artistic portraits'],
    worstFor: ['precise text rendering', 'exact technical specifications', 'photorealistic product shots'],
    apiAvailable: false,
  },
  gpt_image_1: {
    displayName: 'GPT Image 1',
    type: 'image',
    strengths: ['conversational editing', 'multi-image compositing', 'text rendering', 'identity preservation', 'precise instruction following'],
    weaknesses: ['can look too clean/corporate', 'safety filters aggressive', 'less cinematic default look'],
    bestFor: ['iterative edits', 'text in images', 'multi-image scenes', 'precise composition control'],
    worstFor: ['gritty/raw aesthetics', 'extreme stylization', 'dark/violent content'],
    apiAvailable: true,
    provider: 'openai',
    apiModel: 'gpt-image-1',
  },
  higgsfield_cinema_studio_v1_5: {
    displayName: 'Higgsfield Cinema Studio',
    type: 'image',
    strengths: ['camera rig language', 'precise cinematic control', 'photorealistic humans', 'natural lighting'],
    weaknesses: ['newer model with less community knowledge', 'smaller parameter space'],
    bestFor: ['character close-ups', 'realistic portraits', 'natural expressions', 'cinema-grade stills'],
    worstFor: ['highly abstract concepts', 'non-photorealistic styles'],
    apiAvailable: false, // Need to check
  },
  veo_3_1: {
    displayName: 'VEO 3.1',
    type: 'video',
    strengths: ['advanced camera movement', 'long-form video', 'audio generation', 'cinematographic language'],
    weaknesses: ['video-only (no stills)', 'longer generation times'],
    bestFor: ['dynamic scenes', 'camera movements', 'establishing shots with motion'],
    worstFor: ['static hero stills', 'precise frame composition'],
    apiAvailable: false,
  },
  kling_2_6: {
    displayName: 'Kling 2.6',
    type: 'video',
    strengths: ['fast iteration', 'scene consistency', 'reliable output', 'good motion'],
    weaknesses: ['less cinematic than 3.0', 'limited multi-character handling'],
    bestFor: ['quick drafts', 'scene consistency tests', 'action sequences'],
    worstFor: ['multi-character dialogue', 'complex narrative sequences'],
    apiAvailable: false,
  },
  imagen_4: {
    displayName: 'Imagen 4',
    type: 'image',
    strengths: ['photorealism', 'text rendering', 'Google ecosystem integration', 'fast generation'],
    weaknesses: ['less community knowledge', 'style range narrower than MJ'],
    bestFor: ['photorealistic scenes', 'product shots', 'text-heavy images'],
    worstFor: ['highly stylized art', 'extreme artistic styles'],
    apiAvailable: true,
    apiModel: 'imagen-4.0-generate-001',
  },
  flux_2: {
    displayName: 'Flux 2 Flex',
    type: 'image',
    strengths: ['photorealism', 'natural skin textures', 'accurate text rendering', 'LoRA support', 'configurable inference steps'],
    weaknesses: ['less artistic default aesthetic', 'requires more prompt engineering'],
    bestFor: ['photorealistic work', 'natural skin/textures', 'technical accuracy'],
    worstFor: ['highly stylized looks without LoRAs', 'abstract concepts'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'flux-2-flex',
  },
  recraft_v4: {
    displayName: 'Recraft V4 Pro',
    type: 'image',
    strengths: ['design quality', 'typography', 'brand assets', 'vector-like outputs'],
    weaknesses: ['less photorealistic for portraits', 'newer model'],
    bestFor: ['design assets', 'illustrations', 'brand materials', 'typography'],
    worstFor: ['photorealistic portraits', 'cinematic scenes'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'recraft-v4',
  },
  kling_3_0: {
    displayName: 'Kling 3.0 Pro',
    type: 'video',
    strengths: ['high quality video generation', 'cinematic motion', 'multi-character scenes'],
    weaknesses: ['video only', 'longer generation times', 'queue-based'],
    bestFor: ['dynamic scenes', 'cinematic video', 'character animation'],
    worstFor: ['static hero stills', 'fast iteration'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'kling-3',
  },
};

/**
 * Recommend the best model for a given brief.
 * Fast path: uses capability profiles without LLM call.
 * 
 * @param {object} brief - Creative brief
 * @param {object} options
 * @param {string[]} options.availableModels - Models the user has API access to
 * @param {string} options.currentModel - Model that was just used (for switch recommendations)
 * @param {number} options.currentScore - Score from audit (for switch threshold)
 * @returns {{ recommended: string, reason: string, alternatives: object[] }}
 */
function recommendModel(brief, options = {}) {
  const { availableModels = null, currentModel = null, currentScore = null } = options;

  // Filter to only models with API access if specified
  const candidates = availableModels
    ? Object.entries(MODEL_PROFILES).filter(([id]) => availableModels.includes(id))
    : Object.entries(MODEL_PROFILES).filter(([, p]) => p.apiAvailable);

  if (candidates.length === 0) {
    return { recommended: 'nano_banana_pro', reason: 'No other models available', alternatives: [] };
  }

  // Score each candidate based on brief characteristics
  const scored = candidates.map(([id, profile]) => {
    let score = 50; // baseline

    // Shot type matching
    const desc = (brief.description || '').toLowerCase();
    const shotType = (brief.shotType || '').toLowerCase();

    // Character-heavy shots
    if (brief.characters?.length > 0) {
      if (profile.bestFor.some(b => b.includes('character') || b.includes('portrait'))) score += 20;
      if (profile.weaknesses.some(w => w.includes('character'))) score -= 15;
    }

    // Text rendering needs
    if (desc.includes('text') || desc.includes('logo') || desc.includes('sign') || desc.includes('label')) {
      if (profile.strengths.some(s => s.includes('text rendering'))) score += 25;
      if (profile.weaknesses.some(w => w.includes('text'))) score -= 20;
    }

    // Wide/establishing shots
    if (shotType.includes('wide') || shotType.includes('establishing') || shotType.includes('extreme long')) {
      if (profile.bestFor.some(b => b.includes('establishing') || b.includes('scene'))) score += 10;
    }

    // Photorealism emphasis
    if (desc.includes('realistic') || desc.includes('photorealistic') || brief.styleProfile?.aesthetic?.includes('realism')) {
      if (profile.strengths.some(s => s.includes('photorealism') || s.includes('natural'))) score += 15;
    }

    // Stylized/artistic emphasis
    if (desc.includes('stylized') || desc.includes('artistic') || desc.includes('concept art')) {
      if (profile.bestFor.some(b => b.includes('stylized') || b.includes('concept') || b.includes('artistic'))) score += 15;
    }

    // If this is the current model and score is low, penalize to encourage switching
    if (currentModel && resolveModelName(currentModel) === id && currentScore && currentScore < 75) {
      score -= 30;
    }

    return { id, profile, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  const alternatives = scored.slice(1, 3).map(s => ({
    model: s.id,
    displayName: s.profile.displayName,
    score: s.score,
    reason: s.profile.bestFor[0],
  }));

  return {
    recommended: best.id,
    displayName: best.profile.displayName,
    reason: best.profile.bestFor.slice(0, 2).join(', '),
    score: best.score,
    alternatives,
  };
}

/**
 * Get model profile by name.
 */
function getModelProfile(modelName) {
  const resolved = resolveModelName(modelName);
  return MODEL_PROFILES[resolved] || null;
}

/**
 * List all models with their profiles.
 */
function listModels() {
  return Object.entries(MODEL_PROFILES).map(([id, profile]) => ({
    id,
    ...profile,
  }));
}

/**
 * Route a generation request to the correct provider based on model ID.
 * Returns the same { buffer, mimeType, textResponse } shape regardless of provider.
 * 
 * @param {string} modelId - Resolved model ID (e.g., 'nano_banana_pro', 'flux_2', 'gpt_image_1')
 * @param {string} prompt - The compiled prompt
 * @returns {{ buffer: Buffer, mimeType: string, textResponse: string|null }}
 */
async function routeGeneration(modelId, prompt) {
  const profile = MODEL_PROFILES[modelId];
  if (!profile) throw new Error(`Unknown model: ${modelId}`);
  if (!profile.apiAvailable) throw new Error(`Model ${modelId} has no API access (missing API key?)`);

  const provider = profile.provider || 'gemini';

  switch (provider) {
    case 'gemini':
      return await generateGemini(prompt);
    
    case 'openai':
      return await generateOpenAI(prompt, { model: profile.apiModel });
    
    case 'fal': {
      const falKey = profile.apiModel; // e.g., 'flux-2-flex', 'recraft-v4', 'kling-3'
      switch (falKey) {
        case 'flux-2-flex': return await generateFlux2(prompt);
        case 'recraft-v4': return await generateRecraftV4(prompt);
        case 'kling-3': return await generateKling3(prompt);
        default: throw new Error(`Unknown fal.ai model key: ${falKey}`);
      }
    }

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * Get list of models that currently have API access (keys present in env).
 */
function getAvailableApiModels() {
  return Object.entries(MODEL_PROFILES)
    .filter(([, p]) => {
      if (!p.apiAvailable) return false;
      const provider = p.provider || 'gemini';
      if (provider === 'openai') return !!process.env.OPENAI_API_KEY;
      if (provider === 'fal') return !!process.env.FALAI_API_KEY;
      if (provider === 'gemini') return !!process.env.GEMINI_API_KEY;
      return false;
    })
    .map(([id, p]) => ({
      id,
      displayName: p.displayName,
      type: p.type,
      provider: p.provider || 'gemini',
    }));
}

export { recommendModel, getModelProfile, listModels, routeGeneration, getAvailableApiModels, MODEL_PROFILES };
