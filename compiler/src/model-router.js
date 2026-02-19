/**
 * Model Router — recommends the best model for a given shot based on its characteristics.
 * 
 * Uses the Translation Matrix + model capability profiles to make intelligent routing decisions.
 * This is the "which model should I use?" brain.
 */
import { loadKB, resolveModelName, getAvailableModels } from './kb-loader.js';
import { callText } from './gemini.js';
import { generateImage as generateGemini } from './gemini.js';
import {
  generateFlux2, generateRecraftV4, generateKling3,
  generateGrokImagine, generateVeo31, generateWan26, generateSeedream45,
  generateZImage, generateMinimaxHailuo, generateSeedance15Pro, generateSora2Fal,
  generateReve, generateFal,
} from './fal.js';
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
  gpt_image_1_5: {
    displayName: 'GPT Image 1.5',
    type: 'image',
    strengths: ['conversational editing', 'multi-image compositing', 'text rendering', 'identity preservation', 'precise instruction following', 'high-fidelity photorealism', 'world knowledge reasoning'],
    weaknesses: ['can look too clean/corporate', 'safety filters aggressive', 'less cinematic default look'],
    bestFor: ['iterative edits', 'text in images', 'multi-image scenes', 'precise composition control'],
    worstFor: ['gritty/raw aesthetics', 'extreme stylization', 'dark/violent content'],
    apiAvailable: true,
    provider: 'openai',
    apiModel: 'gpt-image-1.5',
  },
  // Legacy alias — routes to gpt-image-1.5
  gpt_image_1: {
    displayName: 'GPT Image 1 (Legacy → 1.5)',
    type: 'image',
    strengths: ['conversational editing', 'multi-image compositing', 'text rendering', 'identity preservation', 'precise instruction following'],
    weaknesses: ['can look too clean/corporate', 'safety filters aggressive', 'less cinematic default look'],
    bestFor: ['iterative edits', 'text in images', 'multi-image scenes', 'precise composition control'],
    worstFor: ['gritty/raw aesthetics', 'extreme stylization', 'dark/violent content'],
    apiAvailable: true,
    provider: 'openai',
    apiModel: 'gpt-image-1.5',
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
  grok_imagine: {
    displayName: 'Grok Imagine',
    type: 'image',
    strengths: ['fast generation', 'creative interpretation', 'cheap ($0.02/image)', 'good photorealism'],
    weaknesses: ['newer model with less community knowledge', 'limited editing capabilities'],
    bestFor: ['quick concept exploration', 'photorealistic scenes', 'creative imagery'],
    worstFor: ['precise iterative editing', 'multi-reference compositing'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'grok-imagine',
  },
  veo_3_1: {
    displayName: 'VEO 3.1',
    type: 'video',
    strengths: ['advanced camera movement', 'long-form video', 'audio generation', 'cinematographic language', 'reference-to-video'],
    weaknesses: ['video-only (no stills)', 'longer generation times', 'expensive'],
    bestFor: ['dynamic scenes', 'camera movements', 'establishing shots with motion', 'cinematic video'],
    worstFor: ['static hero stills', 'precise frame composition'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'veo-3.1',
  },
  wan_2_6: {
    displayName: 'Wan 2.6',
    type: 'video',
    strengths: ['high quality video generation', 'text-to-video', 'image-to-video', 'good motion dynamics'],
    weaknesses: ['video only', 'can struggle with complex multi-character scenes'],
    bestFor: ['dynamic video scenes', 'motion sequences', 'cinematic video generation'],
    worstFor: ['static images', 'precise text rendering'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'wan-2.6',
  },
  seedream_4_5: {
    displayName: 'Seedream 4.5',
    type: 'image',
    strengths: ['high aesthetic quality', 'strong text rendering', 'photorealistic output', 'ByteDance quality'],
    weaknesses: ['newer model', 'limited community knowledge'],
    bestFor: ['photorealistic scenes', 'text-heavy images', 'high-aesthetic stills'],
    worstFor: ['highly stylized non-photorealistic art'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'seedream-4.5',
  },
  z_image: {
    displayName: 'Z-Image',
    type: 'image',
    strengths: ['fast generation', 'turbo mode available', 'good quality-to-speed ratio'],
    weaknesses: ['less refined than top-tier models', 'newer model'],
    bestFor: ['rapid prototyping', 'quick iterations', 'draft generation'],
    worstFor: ['final production shots', 'extreme detail work'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'z-image',
  },
  minimax_hailuo_02: {
    displayName: 'Minimax Hailuo 02',
    type: 'video',
    strengths: ['high quality video generation', 'strong motion understanding', 'good character animation'],
    weaknesses: ['video only', 'longer generation times'],
    bestFor: ['character-driven video', 'dynamic scenes', 'cinematic motion'],
    worstFor: ['static images', 'fast iteration'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'minimax-hailuo',
  },
  seedance_1_5_pro: {
    displayName: 'Seedance 1.5 Pro',
    type: 'video',
    strengths: ['dance/motion generation', 'character animation', 'ByteDance quality', 'good temporal consistency'],
    weaknesses: ['video only', 'specialized for motion'],
    bestFor: ['character motion', 'dance sequences', 'action video'],
    worstFor: ['static scenes', 'landscape-only shots'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'seedance-1.5-pro',
  },
  sora_2: {
    displayName: 'Sora 2',
    type: 'video',
    strengths: ['cinematic video generation', 'strong narrative understanding', 'long-form video', 'OpenAI quality'],
    weaknesses: ['video only', 'expensive', 'queue-based'],
    bestFor: ['narrative video', 'cinematic scenes', 'story-driven video'],
    worstFor: ['static images', 'quick iterations'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'sora-2',
  },
  reve: {
    displayName: 'Reve',
    type: 'image',
    strengths: ['text-to-image', 'edit capabilities', 'remix mode', 'versatile generation'],
    weaknesses: ['newer model', 'less community knowledge'],
    bestFor: ['creative imagery', 'image editing', 'remix/variations'],
    worstFor: ['extreme photorealism', 'precise technical specs'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'reve',
  },

  // ── New Image Models ────────────────────────────────────────────────

  flux_kontext_pro: {
    displayName: 'Flux Kontext Pro',
    type: 'image',
    subtype: 'image-to-image',
    strengths: ['image editing', 'character consistency', 'context-aware edits', 'reference-based generation'],
    weaknesses: ['requires input image', 'less suited for pure text-to-image'],
    bestFor: ['image editing', 'character consistency across shots', 'style transfer'],
    worstFor: ['text-to-image from scratch (use flux-kontext-t2i instead)'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'flux-kontext-pro',
  },
  flux_kontext_max: {
    displayName: 'Flux Kontext Max',
    type: 'image',
    subtype: 'image-to-image',
    strengths: ['premium image editing', 'highest quality Kontext output', 'character consistency', 'context-aware edits'],
    weaknesses: ['requires input image', 'more expensive than Pro'],
    bestFor: ['premium image editing', 'final-quality character consistency', 'high-fidelity style transfer'],
    worstFor: ['quick drafts', 'text-to-image from scratch'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'flux-kontext-max',
  },
  flux_kontext_t2i: {
    displayName: 'Flux Kontext Pro T2I',
    type: 'image',
    strengths: ['text-to-image with Kontext quality', 'strong prompt adherence', 'character consistency'],
    weaknesses: ['newer model', 'less community knowledge'],
    bestFor: ['text-to-image generation', 'character-consistent imagery', 'creative stills'],
    worstFor: ['image editing (use flux-kontext-pro instead)'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'flux-kontext-t2i',
  },
  kling_image_v3: {
    displayName: 'Kling Image V3',
    type: 'image',
    strengths: ['photorealism', 'cinematic quality', 'Kling ecosystem', 'strong detail rendering'],
    weaknesses: ['newer model', 'limited community knowledge'],
    bestFor: ['photorealistic scenes', 'cinematic stills', 'character portraits'],
    worstFor: ['stylized art', 'abstract concepts'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'kling-image-v3',
  },
  kling_image_o3: {
    displayName: 'Kling Image O3',
    type: 'image',
    strengths: ['photorealism', 'optimized generation', 'Kling ecosystem', 'fast output'],
    weaknesses: ['newer model', 'limited community knowledge'],
    bestFor: ['photorealistic scenes', 'quick high-quality stills'],
    worstFor: ['stylized art', 'abstract concepts'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'kling-image-o3',
  },
  qwen_image_max: {
    displayName: 'Qwen Image Max',
    type: 'image',
    strengths: ['high resolution', 'strong text rendering', 'Alibaba quality', 'versatile styles'],
    weaknesses: ['newer model', 'less community knowledge'],
    bestFor: ['text-heavy images', 'high-resolution stills', 'versatile generation'],
    worstFor: ['highly specialized cinematic looks'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'qwen-image-max',
  },
  ideogram_v3: {
    displayName: 'Ideogram V3',
    type: 'image',
    strengths: ['exceptional typography', 'logo generation', 'poster design', 'commercial-grade output'],
    weaknesses: ['less suited for photorealistic portraits', 'design-focused'],
    bestFor: ['typography', 'logos', 'posters', 'commercial design', 'text-in-image'],
    worstFor: ['photorealistic portraits', 'raw cinematic scenes'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'ideogram-v3',
  },
  bria_fibo: {
    displayName: 'Bria FIBO',
    type: 'image',
    strengths: ['commercially safe output', 'trained on licensed data', 'clean aesthetics'],
    weaknesses: ['less artistic flair', 'newer model'],
    bestFor: ['commercial-safe imagery', 'brand-safe content', 'clean product shots'],
    worstFor: ['edgy artistic styles', 'gritty aesthetics'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'bria-fibo',
  },

  // ── New Video Models ───────────────────────────────────────────────

  pixverse_v56_t2v: {
    displayName: 'PixVerse v5.6 T2V',
    type: 'video',
    strengths: ['text-to-video', 'strong motion', 'cinematic output', 'good prompt adherence'],
    weaknesses: ['video only', 'newer model'],
    bestFor: ['dynamic video from text', 'cinematic scenes', 'creative video'],
    worstFor: ['static images', 'precise frame control'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'pixverse-v56-t2v',
  },
  pixverse_v56_i2v: {
    displayName: 'PixVerse v5.6 I2V',
    type: 'video',
    subtype: 'image-to-video',
    strengths: ['image-to-video', 'preserves input frame', 'strong motion dynamics'],
    weaknesses: ['requires input image', 'video only'],
    bestFor: ['animating stills', 'extending hero shots into motion', 'image-to-video'],
    worstFor: ['text-only generation', 'static output'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'pixverse-v56-i2v',
  },
  vidu_q3_t2v: {
    displayName: 'Vidu Q3 T2V',
    type: 'video',
    strengths: ['text-to-video', 'high quality generation', 'good temporal consistency'],
    weaknesses: ['video only', 'newer model'],
    bestFor: ['narrative video', 'cinematic text-to-video', 'scene generation'],
    worstFor: ['static images', 'quick iterations'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'vidu-q3-t2v',
  },
  vidu_q3_i2v: {
    displayName: 'Vidu Q3 I2V',
    type: 'video',
    subtype: 'image-to-video',
    strengths: ['image-to-video', 'high quality animation', 'preserves input composition'],
    weaknesses: ['requires input image', 'video only'],
    bestFor: ['animating stills', 'image-driven video', 'extending frames'],
    worstFor: ['text-only generation', 'static output'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'vidu-q3-i2v',
  },
  ltx_2_19b: {
    displayName: 'LTX-2 19B',
    type: 'video',
    subtype: 'image-to-video',
    strengths: ['large model capacity (19B params)', 'image-to-video', 'high detail retention'],
    weaknesses: ['requires input image', 'longer generation times', 'video only'],
    bestFor: ['high-quality image-to-video', 'detailed animation', 'cinematic motion from stills'],
    worstFor: ['text-only generation', 'quick drafts'],
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'ltx-2-19b',
  },

  // ── Utility Models ─────────────────────────────────────────────────

  topaz_upscale_image: {
    displayName: 'Topaz Upscale (Image)',
    type: 'utility',
    category: 'upscale',
    description: 'AI-powered image upscaling via Topaz',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'topaz-upscale',
  },
  topaz_upscale_video: {
    displayName: 'Topaz Upscale (Video)',
    type: 'utility',
    category: 'upscale',
    description: 'AI-powered video upscaling via Topaz',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'topaz-upscale-video',
  },
  seedvr_upscale_image: {
    displayName: 'SeedVR2 Upscale (Image)',
    type: 'utility',
    category: 'upscale',
    description: 'SeedVR2 image upscaler — alternative to Topaz',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'seedvr-upscale-image',
  },
  seedvr_upscale_video: {
    displayName: 'SeedVR2 Upscale (Video)',
    type: 'utility',
    category: 'upscale',
    description: 'SeedVR2 video upscaler',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'seedvr-upscale-video',
  },
  recraft_upscale_creative: {
    displayName: 'Recraft Upscale (Creative)',
    type: 'utility',
    category: 'upscale',
    description: 'Recraft creative upscaler — adds detail and texture',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'recraft-upscale-creative',
  },
  recraft_upscale_crisp: {
    displayName: 'Recraft Upscale (Crisp)',
    type: 'utility',
    category: 'upscale',
    description: 'Recraft crisp upscaler — clean, sharp upscaling',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'recraft-upscale-crisp',
  },
  bria_bg_remove: {
    displayName: 'Bria Background Removal (Image)',
    type: 'utility',
    category: 'background-removal',
    description: 'Remove background from images using Bria RMBG 2.0',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'bria-bg-remove',
  },
  bria_bg_remove_video: {
    displayName: 'Bria Background Removal (Video)',
    type: 'utility',
    category: 'background-removal',
    description: 'Remove background from video using Bria',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'bria-bg-remove-video',
  },
  trim_video: {
    displayName: 'Trim Video',
    type: 'utility',
    category: 'video-utility',
    description: 'Trim video to a start/end time range (FFMPEG-based)',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'trim-video',
  },
  scale_video: {
    displayName: 'Scale Video',
    type: 'utility',
    category: 'video-utility',
    description: 'Scale/resize video (FFMPEG-based)',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'scale-video',
  },
  blend_video: {
    displayName: 'Blend Video',
    type: 'utility',
    category: 'video-utility',
    description: 'Blend/crossfade between videos (FFMPEG-based)',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'blend-video',
  },
  reverse_video: {
    displayName: 'Reverse Video',
    type: 'utility',
    category: 'video-utility',
    description: 'Reverse video playback (FFMPEG-based)',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'reverse-video',
  },
  extract_frame: {
    displayName: 'Extract Frame',
    type: 'utility',
    category: 'video-utility',
    description: 'Extract the Nth frame from a video (FFMPEG-based)',
    apiAvailable: true,
    provider: 'fal',
    apiModel: 'extract-frame',
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
 * List all models with their profiles, optionally categorized by type.
 */
function listModels(categorize = false) {
  const all = Object.entries(MODEL_PROFILES).map(([id, profile]) => ({
    id,
    ...profile,
  }));
  if (!categorize) return all;
  return {
    image: all.filter(m => m.type === 'image'),
    video: all.filter(m => m.type === 'video'),
    utility: all.filter(m => m.type === 'utility'),
  };
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
      const falKey = profile.apiModel;
      // Generic fal.ai routing — any model in FAL_MODELS
      return await generateFal(falKey, prompt);
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
