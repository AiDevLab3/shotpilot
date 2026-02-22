/**
 * Model Registry v2 — Complete catalog of all models with rich profiles
 * Merged from compiler/src/model-router.js + compiler/src/fal.js + original registry
 * ShotPilot v2
 */

const MODELS = {
  // ═══════════════════════════════════════════════════════════════════
  // ACTIVE IMAGE MODELS (fal.ai / OpenAI / Google API)
  // ═══════════════════════════════════════════════════════════════════

  flux_2: {
    id: 'flux_2', name: 'Flux 2 Flex', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/flux-2-flex',
    editEndpoint: 'fal-ai/flux-2-flex/edit',
    capabilities: ['generate', 'edit', 'img2img'],
    strengths: ['environments', 'photorealistic', 'stylized', 'consistency', 'typography'],
    weaknesses: ['less artistic default aesthetic', 'requires more prompt engineering for stylized looks'],
    bestFor: ['photorealistic environments', 'natural skin/textures', 'technical accuracy', 'typography'],
    worstFor: ['highly stylized looks without LoRAs', 'abstract concepts'],
    kbPath: 'models/flux_2', active: true,
    defaultParams: { num_images: 1, image_size: 'landscape_16_9', num_inference_steps: 28, guidance_scale: 3.5, output_format: 'jpeg' },
  },

  flux_kontext: {
    id: 'flux_kontext', name: 'Flux Kontext Pro', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/flux-pro/kontext',
    editEndpoint: null,
    capabilities: ['edit', 'img2img', 'character-consistency', 'style-transfer'],
    strengths: ['consistency', 'stylized', 'characters', 'context-aware edits', 'reference-based'],
    weaknesses: ['requires input image for best results', 'less suited for pure text-to-image'],
    bestFor: ['image editing', 'character consistency across shots', 'style transfer', 'targeted local edits'],
    worstFor: ['text-to-image from scratch'],
    kbPath: 'models/flux_kontext', active: true,
    defaultParams: { output_format: 'jpeg' },
    variants: {
      max: { endpoint: 'fal-ai/flux-pro/kontext/max', description: 'Highest quality Kontext output' },
      t2i: { endpoint: 'fal-ai/flux-pro/kontext/text-to-image', description: 'Text-to-image with Kontext quality' },
    },
  },

  gpt_image_1_5: {
    id: 'gpt_image_1_5', name: 'GPT Image 1.5', type: 'image', provider: 'openai',
    endpoint: 'fal-ai/gpt-image-1.5',
    editEndpoint: null,
    capabilities: ['generate', 'edit', 'img2img', 'inpaint'],
    strengths: ['photorealistic', 'characters', 'typography', 'consistency', 'conversational editing', 'multi-image compositing', 'identity preservation', 'world knowledge'],
    weaknesses: ['can look too clean/corporate', 'safety filters aggressive', 'less cinematic default look'],
    bestFor: ['iterative edits', 'text in images', 'multi-image scenes', 'precise composition control', 'character portraits'],
    worstFor: ['gritty/raw aesthetics', 'extreme stylization', 'dark/violent content'],
    kbPath: 'models/gpt_image_1_5', active: true,
    directOpenAI: true, // Can also be called via direct OpenAI API
    defaultParams: { num_images: 1, image_size: 'landscape_16_9' },
  },

  nano_banana_pro: {
    id: 'nano_banana_pro', name: 'Nano Banana Pro', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/nano-banana-pro',
    editEndpoint: 'fal-ai/nano-banana-pro/edit',
    capabilities: ['generate', 'edit'],
    strengths: ['photorealistic', 'characters', 'typography', 'conversational editing', '4K output', 'up to 14 reference images', 'physics-aware composition'],
    weaknesses: ['can plateau on photorealism after 3-4 iterations', 'sometimes over-renders clean surfaces'],
    bestFor: ['character portraits', 'object references', 'text-heavy shots', 'iterative refinement'],
    worstFor: ['extreme wide landscapes without subjects', 'highly stylized non-photorealistic'],
    kbPath: 'models/nano_banana_pro', active: true,
    defaultParams: { num_images: 1, image_size: 'landscape_16_9' },
  },

  seedream_4_5: {
    id: 'seedream_4_5', name: 'Seedream 4.5', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/bytedance/seedream/v4.5/text-to-image',
    editEndpoint: 'fal-ai/bytedance/seedream/v4.5/edit',
    capabilities: ['generate', 'edit'],
    strengths: ['photorealistic', 'characters', 'environments', 'high aesthetic quality', 'strong text rendering'],
    weaknesses: ['newer model with less community knowledge'],
    bestFor: ['photorealistic scenes', 'text-heavy images', 'high-aesthetic stills', 'natural skin texture'],
    worstFor: ['highly stylized non-photorealistic art'],
    kbPath: 'models/seedream_4_5', active: true,
    defaultParams: { num_images: 1, image_size: 'landscape_16_9', output_format: 'jpeg' },
  },

  ideogram: {
    id: 'ideogram', name: 'Ideogram v3', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/ideogram/v3',
    editEndpoint: 'fal-ai/ideogram/character/edit',
    capabilities: ['generate', 'edit', 'character-consistency', 'reframe'],
    strengths: ['typography', 'stylized', 'characters', 'consistency', 'logo generation', 'poster design', 'commercial-grade output'],
    weaknesses: ['less suited for raw photorealistic portraits', 'design-focused'],
    bestFor: ['typography', 'logos', 'posters', 'commercial design', 'text-in-image', 'character consistency'],
    worstFor: ['photorealistic portraits', 'gritty cinematic scenes'],
    kbPath: 'models/ideogram', active: true,
    defaultParams: { num_images: 1 },
    variants: {
      character: { endpoint: 'fal-ai/ideogram/character', description: 'Consistent character generation' },
      characterEdit: { endpoint: 'fal-ai/ideogram/character/edit', description: 'Edit while preserving character identity' },
      characterRemix: { endpoint: 'fal-ai/ideogram/character/remix', description: 'Transform character into different styles' },
      reframe: { endpoint: 'fal-ai/ideogram/v3/reframe', description: 'Extend/expand images' },
    },
  },

  recraft_v4: {
    id: 'recraft_v4', name: 'Recraft v4', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/recraft/v4/text-to-image',
    editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['typography', 'stylized', 'environments', 'design quality', 'brand assets', 'vector-like outputs'],
    weaknesses: ['less photorealistic for portraits', 'newer model'],
    bestFor: ['design assets', 'illustrations', 'brand materials', 'typography', 'environmental art'],
    worstFor: ['photorealistic portraits', 'cinematic character close-ups'],
    kbPath: 'models/recraft_v4', active: true,
    defaultParams: { num_images: 1, image_size: 'landscape_16_9', output_format: 'jpeg' },
    variants: {
      pro: { endpoint: 'fal-ai/recraft/v4/pro/text-to-image', description: 'Pro quality' },
      vector: { endpoint: 'fal-ai/recraft/v4/text-to-vector', description: 'Vector output' },
    },
  },

  kling_image_v3: {
    id: 'kling_image_v3', name: 'Kling Image v3', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/kling-image/v3/text-to-image',
    editEndpoint: null,
    img2imgEndpoint: 'fal-ai/kling-image/v3/image-to-image',
    capabilities: ['generate', 'img2img'],
    strengths: ['photorealistic', 'characters', 'cinematic quality', 'strong detail rendering'],
    weaknesses: ['newer model', 'limited community knowledge'],
    bestFor: ['photorealistic scenes', 'cinematic stills', 'character portraits'],
    worstFor: ['stylized art', 'abstract concepts'],
    kbPath: 'models/kling_image_v3', active: true,
    defaultParams: { num_images: 1, image_size: 'landscape_16_9' },
  },

  kling_o1_image: {
    id: 'kling_o1_image', name: 'Kling O3 Image', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/kling-image/o3/text-to-image',
    editEndpoint: null,
    img2imgEndpoint: 'fal-ai/kling-image/o3/image-to-image',
    capabilities: ['generate', 'img2img'],
    strengths: ['photorealistic', 'characters', 'environments', 'optimized generation', 'fast output'],
    weaknesses: ['newer model', 'limited community knowledge'],
    bestFor: ['photorealistic scenes', 'quick high-quality stills', 'cinematic imagery'],
    worstFor: ['stylized art', 'abstract concepts'],
    kbPath: 'models/kling_o1_image', active: true,
    defaultParams: { num_images: 1, image_size: 'landscape_16_9' },
  },

  qwen_image_max: {
    id: 'qwen_image_max', name: 'Qwen Image Max', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/qwen-image',
    editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['stylized', 'characters', 'high resolution', 'strong text rendering', 'versatile styles'],
    weaknesses: ['newer model', 'less community knowledge'],
    bestFor: ['text-heavy images', 'high-resolution stills', 'versatile generation'],
    worstFor: ['highly specialized cinematic looks'],
    kbPath: 'models/qwen_image_max', active: true,
    defaultParams: { num_images: 1, output_format: 'jpeg' },
  },

  grok_imagine: {
    id: 'grok_imagine', name: 'Grok Imagine', type: 'image', provider: 'fal',
    endpoint: 'xai/grok-imagine-image',
    editEndpoint: 'xai/grok-imagine-image/edit',
    capabilities: ['generate', 'edit'],
    strengths: ['photorealistic', 'fast generation', 'creative interpretation', 'cheap ($0.02/image)'],
    weaknesses: ['newer model with less community knowledge', 'limited editing capabilities'],
    bestFor: ['quick concept exploration', 'photorealistic scenes', 'creative imagery', 'budget-conscious iteration'],
    worstFor: ['precise iterative editing', 'multi-reference compositing'],
    kbPath: 'models/grok_imagine', active: true,
    defaultParams: { num_images: 1, image_size: 'landscape_16_9', output_format: 'jpeg' },
  },

  reve: {
    id: 'reve', name: 'Reve', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/reve/text-to-image',
    editEndpoint: 'fal-ai/reve/edit',
    capabilities: ['generate', 'edit'],
    strengths: ['versatile', 'edit capabilities', 'remix mode'],
    weaknesses: ['newer model', 'less community knowledge'],
    bestFor: ['creative imagery', 'image editing', 'remix/variations'],
    worstFor: ['extreme photorealism', 'precise technical specs'],
    kbPath: 'models/reve', active: true,
    defaultParams: { num_images: 1, image_size: 'landscape_16_9', output_format: 'jpeg' },
    variants: {
      remix: { endpoint: 'fal-ai/reve/remix', description: 'Remix existing images' },
    },
  },

  z_image: {
    id: 'z_image', name: 'Z-Image', type: 'image', provider: 'fal',
    endpoint: 'fal-ai/z-image',
    editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['fast generation', 'turbo mode', 'good quality-to-speed ratio'],
    weaknesses: ['less refined than top-tier models'],
    bestFor: ['rapid prototyping', 'quick iterations', 'draft generation'],
    worstFor: ['final production shots', 'extreme detail work'],
    kbPath: 'models/z_image', active: true,
    defaultParams: { num_images: 1, image_size: 'landscape_16_9', output_format: 'jpeg' },
    variants: {
      turbo: { endpoint: 'fal-ai/z-image/turbo', description: 'Ultra-fast generation' },
    },
  },

  bria_fibo: {
    id: 'bria_fibo', name: 'Bria FIBO', type: 'image', provider: 'fal',
    endpoint: 'bria/fibo/generate',
    editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['commercially safe output', 'trained on licensed data', 'clean aesthetics'],
    weaknesses: ['less artistic flair'],
    bestFor: ['commercial-safe imagery', 'brand-safe content', 'clean product shots'],
    worstFor: ['edgy artistic styles', 'gritty aesthetics'],
    kbPath: 'models/bria_fibo', active: true,
    defaultParams: { num_images: 1 },
  },

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY MODELS
  // ═══════════════════════════════════════════════════════════════════

  topaz: {
    id: 'topaz', name: 'Topaz Upscale', type: 'utility', provider: 'fal',
    endpoint: 'fal-ai/topaz/upscale/image',
    editEndpoint: null,
    capabilities: ['upscale'],
    strengths: ['professional-grade upscaling', 'detail preservation', 'noise reduction'],
    weaknesses: ['requires @fal-ai/client SDK (non-standard queue protocol)'],
    bestFor: ['final production upscaling', 'detail enhancement', 'resolution boost'],
    worstFor: ['creative generation', 'style changes'],
    kbPath: 'models/topaz', active: true,
    useFalSdk: true, // Must use @fal-ai/client, not raw fetch
    variants: {
      video: { endpoint: 'fal-ai/topaz/upscale/video', description: 'Video upscaling' },
    },
  },

  seedvr_upscale: {
    id: 'seedvr_upscale', name: 'SeedVR2 Upscale', type: 'utility', provider: 'fal',
    endpoint: 'fal-ai/seedvr/upscale/image',
    editEndpoint: null,
    capabilities: ['upscale'],
    strengths: ['AI-powered upscaling', 'creative enhancement'],
    bestFor: ['alternative upscaling', 'creative resolution boost'],
    worstFor: ['precise detail preservation'],
    kbPath: null, active: true,
    variants: {
      video: { endpoint: 'fal-ai/seedvr/upscale/video', description: 'Video upscaling' },
    },
  },

  recraft_upscale: {
    id: 'recraft_upscale', name: 'Recraft Upscale', type: 'utility', provider: 'fal',
    endpoint: 'fal-ai/recraft/upscale/creative',
    editEndpoint: null,
    capabilities: ['upscale'],
    strengths: ['creative upscaling with detail generation', 'two modes: creative + crisp'],
    bestFor: ['artistic upscaling', 'adding detail during upscale'],
    worstFor: ['pure resolution increase without changes'],
    kbPath: null, active: true,
    variants: {
      crisp: { endpoint: 'fal-ai/recraft/upscale/crisp', description: 'Clean, sharp upscale' },
    },
  },

  bria_bg_remove: {
    id: 'bria_bg_remove', name: 'Bria Background Removal', type: 'utility', provider: 'fal',
    endpoint: 'fal-ai/bria/background/remove',
    editEndpoint: null,
    capabilities: ['background-removal'],
    strengths: ['clean background removal', 'subject isolation'],
    bestFor: ['compositing prep', 'subject extraction', 'transparent backgrounds'],
    worstFor: ['creative generation'],
    kbPath: null, active: true,
    variants: {
      video: { endpoint: 'bria/video/background-removal', description: 'Video background removal' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // ACTIVE VIDEO MODELS (fal.ai)
  // ═══════════════════════════════════════════════════════════════════

  kling_3_0: {
    id: 'kling_3_0', name: 'Kling 3.0 Pro', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/kling-video/v3/pro/image-to-video',
    editEndpoint: null,
    capabilities: ['image-to-video', 'text-to-video'],
    strengths: ['cinematic motion', 'multi-character scenes', 'high quality', '15s clips', 'native audio'],
    weaknesses: ['longer generation times', 'queue-based', 'expensive'],
    bestFor: ['dynamic scenes', 'cinematic video', 'character animation', 'multi-shot intelligence'],
    worstFor: ['static hero stills', 'fast iteration'],
    kbPath: 'models/kling_3_0', active: true,
    defaultParams: { aspect_ratio: '16:9' },
    variants: {
      standard: { endpoint: 'fal-ai/kling-video/v3/standard/image-to-video', description: 'Standard quality' },
      o3: { endpoint: 'fal-ai/kling-video/o3/standard/image-to-video', description: 'Kling O3 video' },
    },
  },

  veo_3_1: {
    id: 'veo_3_1', name: 'VEO 3.1', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/veo3.1/reference-to-video',
    editEndpoint: null,
    capabilities: ['image-to-video', 'text-to-video'],
    strengths: ['advanced camera movement', 'long-form video', 'audio generation', 'cinematographic language', 'reference-to-video'],
    weaknesses: ['video only', 'longer generation times', 'expensive'],
    bestFor: ['dynamic scenes', 'camera movements', 'establishing shots with motion', 'cinematic video'],
    worstFor: ['static hero stills', 'precise frame composition'],
    kbPath: 'models/veo_3_1', active: true,
    defaultParams: { duration: '8s', aspect_ratio: '16:9' },
  },

  ltx_2: {
    id: 'ltx_2', name: 'LTX 2 19B', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/ltx-2-19b/image-to-video',
    editEndpoint: null,
    capabilities: ['image-to-video'],
    strengths: ['image-to-video', 'good temporal consistency', 'audio generation'],
    weaknesses: ['video only'],
    bestFor: ['animating hero frames', 'extending stills into motion'],
    worstFor: ['text-to-video from scratch'],
    kbPath: 'models/ltx_2', active: true,
    defaultParams: { aspect_ratio: '16:9' },
  },

  wan_2_6: {
    id: 'wan_2_6', name: 'Wan 2.6', type: 'video', provider: 'fal',
    endpoint: 'wan/v2.6/reference-to-video/flash',
    editEndpoint: null,
    capabilities: ['image-to-video', 'text-to-video'],
    strengths: ['high quality video', 'good motion dynamics', 'reference-to-video'],
    weaknesses: ['can struggle with complex multi-character scenes'],
    bestFor: ['dynamic video scenes', 'motion sequences', 'cinematic video'],
    worstFor: ['static images', 'precise text rendering'],
    kbPath: 'models/wan_2_6', active: true,
    defaultParams: { aspect_ratio: '16:9' },
  },

  vidu_q3: {
    id: 'vidu_q3', name: 'Vidu Q3', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/vidu/q3/image-to-video',
    editEndpoint: null,
    capabilities: ['image-to-video', 'text-to-video'],
    strengths: ['high quality generation', 'good temporal consistency'],
    weaknesses: ['newer model'],
    bestFor: ['narrative video', 'cinematic text-to-video', 'scene generation'],
    worstFor: ['quick iterations'],
    kbPath: 'models/vidu_q3', active: true,
    defaultParams: { aspect_ratio: '16:9' },
    variants: {
      t2v: { endpoint: 'fal-ai/vidu/q3/text-to-video', description: 'Text-to-video' },
      turbo: { endpoint: 'fal-ai/vidu/q3/image-to-video/turbo', description: 'Faster generation' },
    },
  },

  pixverse_v5_6: {
    id: 'pixverse_v5_6', name: 'PixVerse v5.6', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/pixverse/v5.6/image-to-video',
    editEndpoint: null,
    capabilities: ['image-to-video', 'text-to-video'],
    strengths: ['strong motion', 'cinematic output', 'good prompt adherence'],
    weaknesses: ['newer model'],
    bestFor: ['dynamic video from stills', 'cinematic scenes', 'creative video'],
    worstFor: ['precise frame control'],
    kbPath: 'models/pixverse_v5_6', active: true,
    defaultParams: { aspect_ratio: '16:9' },
    variants: {
      t2v: { endpoint: 'fal-ai/pixverse/v5.6/text-to-video', description: 'Text-to-video' },
    },
  },

  minimax_hailuo_02: {
    id: 'minimax_hailuo_02', name: 'Minimax Hailuo 02', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/minimax/hailuo-02',
    editEndpoint: null,
    capabilities: ['image-to-video', 'text-to-video'],
    strengths: ['high quality video', 'strong motion understanding', 'good character animation'],
    weaknesses: ['longer generation times'],
    bestFor: ['character-driven video', 'dynamic scenes', 'cinematic motion'],
    worstFor: ['fast iteration'],
    kbPath: 'models/minimax_hailuo_02', active: true,
    defaultParams: { duration: '6s', aspect_ratio: '16:9' },
  },

  seedance_1_5_pro: {
    id: 'seedance_1_5_pro', name: 'Seedance 1.5 Pro', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/bytedance/seedance/v1.5/pro',
    editEndpoint: null,
    capabilities: ['image-to-video', 'text-to-video'],
    strengths: ['dance/motion generation', 'character animation', 'good temporal consistency'],
    weaknesses: ['specialized for motion'],
    bestFor: ['character motion', 'dance sequences', 'action video'],
    worstFor: ['static scenes', 'landscape-only shots'],
    kbPath: 'models/seedance_1_5_pro', active: true,
    defaultParams: { duration: '5s', aspect_ratio: '16:9' },
  },

  sora_2: {
    id: 'sora_2', name: 'Sora 2', type: 'video', provider: 'fal',
    endpoint: 'fal-ai/sora-2/remix',
    editEndpoint: null,
    capabilities: ['image-to-video', 'text-to-video'],
    strengths: ['cinematic video', 'strong narrative understanding', 'long-form video', 'OpenAI quality'],
    weaknesses: ['expensive', 'queue-based'],
    bestFor: ['narrative video', 'cinematic scenes', 'story-driven video'],
    worstFor: ['quick iterations'],
    kbPath: 'models/sora_2', active: true,
    defaultParams: { duration: '10s', aspect_ratio: '16:9' },
  },

  grok_imagine_video: {
    id: 'grok_imagine_video', name: 'Grok Imagine Video', type: 'video', provider: 'fal',
    endpoint: 'xai/grok-imagine-video/text-to-video',
    editEndpoint: null,
    capabilities: ['text-to-video', 'image-to-video'],
    strengths: ['audio generation', 'creative interpretation'],
    weaknesses: ['newer model'],
    bestFor: ['creative video with audio', 'text-to-video'],
    worstFor: ['precise frame control'],
    kbPath: 'models/grok_imagine', active: true,
    defaultParams: { aspect_ratio: '16:9' },
    variants: {
      i2v: { endpoint: 'xai/grok-imagine-video/image-to-video', description: 'Image-to-video' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // VIDEO UTILITY MODELS (fal.ai)
  // ═══════════════════════════════════════════════════════════════════

  topaz_video: {
    id: 'topaz_video', name: 'Topaz Video Upscale', type: 'utility', provider: 'fal',
    endpoint: 'fal-ai/topaz/upscale/video',
    capabilities: ['upscale'],
    strengths: ['professional video upscaling'],
    bestFor: ['final video upscaling'],
    kbPath: 'models/topaz', active: true,
    useFalSdk: true,
  },

  trim_video: {
    id: 'trim_video', name: 'Trim Video', type: 'utility', provider: 'fal',
    endpoint: 'fal-ai/workflow-utilities/trim-video',
    capabilities: ['trim'],
    bestFor: ['cutting video clips'],
    active: true,
  },

  reverse_video: {
    id: 'reverse_video', name: 'Reverse Video', type: 'utility', provider: 'fal',
    endpoint: 'fal-ai/workflow-utilities/reverse-video',
    capabilities: ['reverse'],
    bestFor: ['reversing video clips'],
    active: true,
  },

  // ═══════════════════════════════════════════════════════════════════
  // EXTERNAL-ONLY MODELS (prompt generation only, no API in ShotPilot)
  // ═══════════════════════════════════════════════════════════════════

  midjourney: {
    id: 'midjourney', name: 'Midjourney', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['artistic aesthetics', 'stylized imagery', 'V7 personalization', '--oref character consistency', 'draft mode'],
    weaknesses: ['no public API', 'text rendering unreliable', 'can be too stylized for photorealism'],
    bestFor: ['concept art', 'stylized hero stills', 'mood boards', 'artistic portraits'],
    worstFor: ['precise text rendering', 'exact technical specifications', 'photorealistic product shots'],
    kbPath: 'models/midjourney', active: false,
    description: 'Use in Midjourney Discord/web interface',
  },

  higgsfield_cinema_studio_v1_5: {
    id: 'higgsfield_cinema_studio_v1_5', name: 'Higgsfield Cinema Studio', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    strengths: ['camera rig language', 'precise cinematic control', 'photorealistic humans', 'natural lighting'],
    weaknesses: ['no fal.ai API'],
    bestFor: ['character close-ups', 'realistic portraits', 'natural expressions', 'cinema-grade stills'],
    worstFor: ['highly abstract concepts', 'non-photorealistic styles'],
    kbPath: 'models/higgsfield_cinema_studio_v1_5', active: false,
    description: 'Use on Higgsfield platform',
  },

  higgsfield_dop: {
    id: 'higgsfield_dop', name: 'Higgsfield DOP', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['image-to-video'],
    strengths: ['cinematographic control', 'DP-style camera directions'],
    kbPath: 'models/higgsfield_dop', active: false,
    description: 'Use on Higgsfield platform',
  },

  runway_gen4_5: {
    id: 'runway_gen4_5', name: 'Runway Gen4.5', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['image-to-video', 'text-to-video'],
    strengths: ['cinematic video', 'long-form capability', 'professional toolset'],
    kbPath: 'models/runway_gen4_5', active: false,
    description: 'Use on Runway platform',
  },

  kling_2_6: {
    id: 'kling_2_6', name: 'Kling 2.6', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['image-to-video', 'text-to-video'],
    strengths: ['fast iteration', 'scene consistency', 'reliable output', 'good motion', 'lip-sync'],
    weaknesses: ['less cinematic than 3.0'],
    bestFor: ['quick drafts', 'scene consistency tests', 'action sequences'],
    worstFor: ['multi-character dialogue', 'complex narrative sequences'],
    kbPath: 'models/kling_2_6', active: false,
    description: 'Older version — use Kling 3.0 on fal.ai instead',
  },

  kling_avatars_2_0: {
    id: 'kling_avatars_2_0', name: 'Kling Avatars 2.0', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['avatar-generation'],
    kbPath: 'models/kling_avatars_2_0', active: false,
  },

  kling_motion_control: {
    id: 'kling_motion_control', name: 'Kling Motion Control', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['motion-control'],
    kbPath: 'models/kling_motion_control', active: false,
  },

  kling_o1_edit: {
    id: 'kling_o1_edit', name: 'Kling O1 Edit', type: 'video', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['video-editing'],
    kbPath: 'models/kling_o1_edit', active: false,
  },

  wan_2_2_image: {
    id: 'wan_2_2_image', name: 'Wan 2.2 Image', type: 'image', provider: 'external',
    endpoint: null, editEndpoint: null,
    capabilities: ['generate'],
    kbPath: 'models/wan_2_2_image', active: false,
  },
};


// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

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

export function getUtilityModels() {
  return Object.values(MODELS).filter(m => m.type === 'utility');
}

export function getActiveImageModels() {
  return Object.values(MODELS).filter(m => m.type === 'image' && m.active);
}

export function getActiveVideoModels() {
  return Object.values(MODELS).filter(m => m.type === 'video' && m.active);
}

/**
 * Get models that match specific capabilities
 * @param {string[]} requiredCapabilities - e.g. ['edit', 'img2img']
 * @returns {Array} Models that have ALL required capabilities
 */
export function getModelsByCapability(...requiredCapabilities) {
  return Object.values(MODELS).filter(m => 
    m.active && requiredCapabilities.every(cap => m.capabilities?.includes(cap))
  );
}

/**
 * Get models sorted by relevance to specific strengths
 * @param {string[]} neededStrengths - e.g. ['photorealistic', 'characters']
 * @returns {Array} Models sorted by strength match count (descending)
 */
export function getModelsByStrength(...neededStrengths) {
  return Object.values(MODELS)
    .filter(m => m.active)
    .map(m => ({
      ...m,
      matchScore: neededStrengths.filter(s => m.strengths?.includes(s)).length,
    }))
    .filter(m => m.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}
