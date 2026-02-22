/**
 * Model Registry — Master catalog of all 33 KB models
 * ShotPilot v2
 */

const MODELS = {
  // ===== ACTIVE IMAGE MODELS (fal.ai / OpenAI API) =====
  flux_2: {
    id: 'flux_2', name: 'Flux 2 Flex', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/flux-2-flex', editEndpoint: 'fal-ai/flux-2-flex/edit',
    capabilities: ['generate', 'edit', 'img2img'],
    strengths: ['environments', 'photorealistic', 'stylized', 'consistency'],
    kbPath: 'models/flux_2', active: true,
  },
  flux_kontext: {
    id: 'flux_kontext', name: 'Flux Kontext', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/flux-pro/kontext', editEndpoint: null,
    capabilities: ['generate', 'edit', 'img2img', 'character-consistency'],
    strengths: ['consistency', 'stylized', 'characters'],
    kbPath: 'models/flux_kontext', active: true,
  },
  gpt_image_1_5: {
    id: 'gpt_image_1_5', name: 'GPT Image 1.5', type: 'image', provider: 'openai',
    endpoint: 'fal-ai/gpt-image-1.5', editEndpoint: null,
    capabilities: ['generate', 'edit', 'img2img'],
    strengths: ['photorealistic', 'characters', 'typography', 'consistency'],
    kbPath: 'models/gpt_image_1_5', active: true,
  },
  nano_banana_pro: {
    id: 'nano_banana_pro', name: 'Nano Banana Pro', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/nano-banana-pro', editEndpoint: 'fal-ai/nano-banana-pro/edit',
    capabilities: ['generate', 'edit'],
    strengths: ['photorealistic', 'characters', 'typography'],
    kbPath: 'models/nano_banana_pro', active: true,
  },
  seedream_4_5: {
    id: 'seedream_4_5', name: 'Seedream 4.5', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/bytedance/seedream/v4.5/text-to-image', editEndpoint: 'fal-ai/bytedance/seedream/v4.5/edit',
    capabilities: ['generate', 'edit'],
    strengths: ['photorealistic', 'characters', 'environments'],
    kbPath: 'models/seedream_4_5', active: true,
  },
  ideogram: {
    id: 'ideogram', name: 'Ideogram v3', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/ideogram/v3', editEndpoint: 'fal-ai/ideogram/character/edit',
    capabilities: ['generate', 'edit', 'character-consistency'],
    strengths: ['typography', 'stylized', 'characters', 'consistency'],
    kbPath: 'models/ideogram', active: true,
  },
  recraft_v4: {
    id: 'recraft_v4', name: 'Recraft v4', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/recraft/v4/text-to-image', editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['typography', 'stylized', 'environments'],
    kbPath: 'models/recraft_v4', active: true,
  },
  kling_image_v3: {
    id: 'kling_image_v3', name: 'Kling Image v3', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/kling-image/v3/text-to-image', editEndpoint: null,
    capabilities: ['generate', 'img2img'],
    strengths: ['photorealistic', 'characters'],
    kbPath: 'models/kling_image_v3', active: true,
    img2imgEndpoint: 'fal-ai/kling-image/v3/image-to-image',
  },
  kling_o1_image: {
    id: 'kling_o1_image', name: 'Kling O1 Image', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/kling-image/o3/text-to-image', editEndpoint: null,
    capabilities: ['generate', 'img2img'],
    strengths: ['photorealistic', 'characters', 'environments'],
    kbPath: 'models/kling_o1_image', active: true,
    img2imgEndpoint: 'fal-ai/kling-image/o3/image-to-image',
  },
  qwen_image_max: {
    id: 'qwen_image_max', name: 'Qwen Image Max', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/qwen-image', editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['stylized', 'characters'],
    kbPath: 'models/qwen_image_max', active: true,
  },
  grok_imagine: {
    id: 'grok_imagine', name: 'Grok Imagine', type: 'image', provider: 'fal',
    endpoint: 'xai/grok-imagine-image', editEndpoint: 'xai/grok-imagine-image/edit',
    capabilities: ['generate', 'edit'],
    strengths: ['photorealistic', 'stylized'],
    kbPath: 'models/grok_imagine', active: true,
  },

  // ===== ACTIVE UTILITY MODELS =====
  topaz: {
    id: 'topaz', name: 'Topaz Upscale', type: 'utility', provider: 'fal',
    endpoint: 'fal-ai/topaz/upscale/image', editEndpoint: null,
    capabilities: ['upscale'],
    strengths: ['photorealistic'],
    kbPath: 'models/topaz', active: true,
    videoEndpoint: 'fal-ai/topaz/upscale/video',
  },

  // ===== ACTIVE VIDEO MODELS =====
  kling_3_0: {
    id: 'kling_3_0', name: 'Kling 3.0', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/kling-video/v3/pro/image-to-video', editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion', 'characters', 'consistency'],
    kbPath: 'models/kling_3_0', active: true,
  },
  veo_3_1: {
    id: 'veo_3_1', name: 'VEO 3.1', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/veo3.1/reference-to-video', editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion', 'environments', 'photorealistic'],
    kbPath: 'models/veo_3_1', active: true,
  },
  ltx_2: {
    id: 'ltx_2', name: 'LTX 2', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/ltx-2-19b/image-to-video', editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion'],
    kbPath: 'models/ltx_2', active: true,
  },
  wan_2_6: {
    id: 'wan_2_6', name: 'Wan 2.6', type: 'video', provider: 'fal',
    endpoint: 'wan/v2.6/reference-to-video/flash', editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion', 'consistency'],
    kbPath: 'models/wan_2_6', active: true,
  },
  vidu_q3: {
    id: 'vidu_q3', name: 'Vidu Q3', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/vidu/q3/image-to-video', editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion'],
    kbPath: 'models/vidu_q3', active: true,
  },

  // ===== EXTERNAL-ONLY MODELS (prompt generation only) =====
  midjourney: {
    id: 'midjourney', name: 'Midjourney', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate', 'character-consistency'],
    strengths: ['stylized', 'environments', 'characters', 'photorealistic'],
    kbPath: 'models/midjourney', active: false,
  },
  sora_2: {
    id: 'sora_2', name: 'Sora 2', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion', 'photorealistic'],
    kbPath: 'models/sora_2', active: false,
  },
  runway_gen4_5: {
    id: 'runway_gen4_5', name: 'Runway Gen-4.5', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion', 'photorealistic', 'consistency'],
    kbPath: 'models/runway_gen4_5', active: false,
  },
  higgsfield_dop: {
    id: 'higgsfield_dop', name: 'Higgsfield DOP', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['photorealistic', 'characters'],
    kbPath: 'models/higgsfield_dop', active: false,
  },
  higgsfield_cinema_studio_v1_5: {
    id: 'higgsfield_cinema_studio_v1_5', name: 'Higgsfield Cinema Studio v1.5', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['photorealistic', 'characters', 'environments'],
    kbPath: 'models/higgsfield_cinema_studio_v1_5', active: false,
  },
  bria_fibo: {
    id: 'bria_fibo', name: 'Bria Fibo', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['stylized'],
    kbPath: 'models/bria_fibo', active: false,
  },
  reve: {
    id: 'reve', name: 'Rêve', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['stylized', 'environments'],
    kbPath: 'models/reve', active: false,
  },
  pixverse_v5_6: {
    id: 'pixverse_v5_6', name: 'PixVerse v5.6', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion', 'stylized'],
    kbPath: 'models/pixverse_v5_6', active: false,
  },
  seedance_1_5_pro: {
    id: 'seedance_1_5_pro', name: 'Seedance 1.5 Pro', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion', 'characters'],
    kbPath: 'models/seedance_1_5_pro', active: false,
  },
  minimax_hailuo_02: {
    id: 'minimax_hailuo_02', name: 'MiniMax Hailuo 02', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion'],
    kbPath: 'models/minimax_hailuo_02', active: false,
  },
  kling_avatars_2_0: {
    id: 'kling_avatars_2_0', name: 'Kling Avatars 2.0', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate', 'character-consistency'],
    strengths: ['characters', 'consistency'],
    kbPath: 'models/kling_avatars_2_0', active: false,
  },
  kling_motion_control: {
    id: 'kling_motion_control', name: 'Kling Motion Control', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion'],
    kbPath: 'models/kling_motion_control', active: false,
  },
  kling_o1_edit: {
    id: 'kling_o1_edit', name: 'Kling O1 Edit', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['edit'],
    strengths: ['characters', 'photorealistic'],
    kbPath: 'models/kling_o1_edit', active: false,
  },
  kling_2_6: {
    id: 'kling_2_6', name: 'Kling 2.6', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['motion', 'consistency'],
    kbPath: 'models/kling_2_6', active: false,
  },
  wan_2_2_image: {
    id: 'wan_2_2_image', name: 'Wan 2.2 Image', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['stylized'],
    kbPath: 'models/wan_2_2_image', active: false,
  },
  z_image: {
    id: 'z_image', name: 'Z Image', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['stylized'],
    kbPath: 'models/z_image', active: false,
  },
};

export function getAllModels() {
  return Object.values(MODELS);
}

export function getActiveModels() {
  return Object.values(MODELS).filter(m => m.active);
}

export function getModelById(id) {
  return MODELS[id] || null;
}

export function getImageModels() {
  return Object.values(MODELS).filter(m => m.type === 'image');
}

export function getVideoModels() {
  return Object.values(MODELS).filter(m => m.type === 'video');
}

/**
 * Quick recommend based on analysis result issues/strengths needed.
 * For full recommendation logic, use modelRecommender.js
 */
export function recommendModels(analysisResult) {
  const issues = analysisResult?.issues || [];
  const issueText = issues.join(' ').toLowerCase();

  const scored = getActiveModels()
    .filter(m => m.type === 'image')
    .map(m => {
      let score = 0;
      if (issueText.includes('waxy') || issueText.includes('plastic')) {
        if (m.strengths.includes('photorealistic')) score += 3;
        if (['seedream_4_5', 'gpt_image_1_5'].includes(m.id)) score += 5;
      }
      if (issueText.includes('typography') || issueText.includes('text')) {
        if (m.strengths.includes('typography')) score += 5;
      }
      if (issueText.includes('environment') || issueText.includes('flat')) {
        if (m.strengths.includes('environments')) score += 3;
        if (m.id === 'flux_2') score += 3;
      }
      if (issueText.includes('consistency') || issueText.includes('character')) {
        if (m.strengths.includes('consistency')) score += 3;
        if (m.capabilities.includes('character-consistency')) score += 3;
      }
      if (issueText.includes('style')) {
        if (m.capabilities.includes('edit') || m.capabilities.includes('img2img')) score += 3;
        if (m.id === 'flux_kontext') score += 4;
      }
      return { ...m, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5);
}
