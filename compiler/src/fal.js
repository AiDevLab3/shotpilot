/**
 * fal.ai API client — image generation via Flux 2 Flex, Recraft V4, and Kling 3.0.
 * 
 * Uses the fal.ai queue API pattern:
 *   1. POST to https://queue.fal.run/{model-id} to submit
 *   2. Poll https://queue.fal.run/{model-id}/requests/{request_id}/status
 *   3. GET https://queue.fal.run/{model-id}/requests/{request_id} for result
 */
import fetch from 'node-fetch';

const TIMEOUT_MS = 180000; // 3 min for queue-based generation
const POLL_INTERVAL_MS = 2000;

const FAL_MODELS = {
  'flux-2-flex': {
    id: 'fal-ai/flux-2-flex',
    displayName: 'Flux 2 Flex',
    type: 'image',
    defaultParams: {
      num_images: 1,
      image_size: 'landscape_16_9',
      num_inference_steps: 28,
      guidance_scale: 3.5,
      output_format: 'jpeg',
    },
  },
  'recraft-v4': {
    id: 'fal-ai/recraft/v4/pro',
    displayName: 'Recraft V4 Pro',
    type: 'image',
    defaultParams: {
      num_images: 1,
      image_size: 'landscape_16_9',
      output_format: 'jpeg',
    },
  },
  'kling-3': {
    id: 'fal-ai/kling-video/v3/pro',
    displayName: 'Kling 3.0 Pro',
    type: 'video',
    defaultParams: {
      num_images: 1,
      image_size: 'landscape_16_9',
    },
  },
  'grok-imagine': {
    id: 'xai/grok-imagine-image',
    displayName: 'Grok Imagine',
    type: 'image',
    defaultParams: {
      num_images: 1,
      image_size: 'landscape_16_9',
      output_format: 'jpeg',
    },
  },
  'veo-3.1': {
    id: 'fal-ai/veo3.1',
    displayName: 'Veo 3.1',
    type: 'video',
    defaultParams: {
      duration: '8s',
      aspect_ratio: '16:9',
    },
  },
  'wan-2.6': {
    id: 'fal-ai/wan/v2.6/text-to-video',
    displayName: 'Wan 2.6',
    type: 'video',
    defaultParams: {
      duration: '5s',
      aspect_ratio: '16:9',
    },
  },
  'seedream-4.5': {
    id: 'fal-ai/bytedance/seedream/v4.5',
    displayName: 'Seedream 4.5',
    type: 'image',
    defaultParams: {
      num_images: 1,
      image_size: 'landscape_16_9',
      output_format: 'jpeg',
    },
  },
  'z-image': {
    id: 'fal-ai/z-image',
    displayName: 'Z-Image',
    type: 'image',
    defaultParams: {
      num_images: 1,
      image_size: 'landscape_16_9',
      output_format: 'jpeg',
    },
  },
  'minimax-hailuo': {
    id: 'fal-ai/minimax/hailuo-02',
    displayName: 'Minimax Hailuo 02',
    type: 'video',
    defaultParams: {
      duration: '6s',
      aspect_ratio: '16:9',
    },
  },
  'seedance-1.5-pro': {
    id: 'fal-ai/bytedance/seedance/v1.5/pro',
    displayName: 'Seedance 1.5 Pro',
    type: 'video',
    defaultParams: {
      duration: '5s',
      aspect_ratio: '16:9',
    },
  },
  'sora-2': {
    id: 'fal-ai/sora-2/remix',
    displayName: 'Sora 2',
    type: 'video',
    defaultParams: {
      duration: '10s',
      aspect_ratio: '16:9',
    },
  },
  'reve': {
    id: 'fal-ai/reve/text-to-image',
    displayName: 'Reve',
    type: 'image',
    defaultParams: {
      num_images: 1,
      image_size: 'landscape_16_9',
      output_format: 'jpeg',
    },
  },
  'topaz-upscale': {
    id: 'fal-ai/topaz/upscale/image',
    displayName: 'Topaz Upscale (Image)',
    type: 'utility',
    category: 'upscale',
    defaultParams: {},
  },
  'topaz-upscale-video': {
    id: 'fal-ai/topaz/upscale/video',
    displayName: 'Topaz Upscale (Video)',
    type: 'utility',
    category: 'upscale',
    defaultParams: {},
  },
  'seedvr-upscale-image': {
    id: 'fal-ai/seedvr/upscale/image',
    displayName: 'SeedVR2 Upscale (Image)',
    type: 'utility',
    category: 'upscale',
    defaultParams: {},
  },
  'seedvr-upscale-video': {
    id: 'fal-ai/seedvr/upscale/video',
    displayName: 'SeedVR2 Upscale (Video)',
    type: 'utility',
    category: 'upscale',
    defaultParams: {},
  },
  'recraft-upscale-creative': {
    id: 'fal-ai/recraft/upscale/creative',
    displayName: 'Recraft Upscale (Creative)',
    type: 'utility',
    category: 'upscale',
    defaultParams: {},
  },
  'recraft-upscale-crisp': {
    id: 'fal-ai/recraft/upscale/crisp',
    displayName: 'Recraft Upscale (Crisp)',
    type: 'utility',
    category: 'upscale',
    defaultParams: {},
  },
  'bria-bg-remove': {
    id: 'fal-ai/bria/background/remove',
    displayName: 'Bria Background Removal (Image)',
    type: 'utility',
    category: 'background-removal',
    defaultParams: {},
  },
  'bria-bg-remove-video': {
    id: 'bria/video/background-removal',
    displayName: 'Bria Background Removal (Video)',
    type: 'utility',
    category: 'background-removal',
    defaultParams: {},
  },
  'trim-video': {
    id: 'fal-ai/workflow-utilities/trim-video',
    displayName: 'Trim Video',
    type: 'utility',
    category: 'video-utility',
    defaultParams: {},
  },
  'scale-video': {
    id: 'fal-ai/workflow-utilities/scale-video',
    displayName: 'Scale Video',
    type: 'utility',
    category: 'video-utility',
    defaultParams: {},
  },
  'blend-video': {
    id: 'fal-ai/workflow-utilities/blend-video',
    displayName: 'Blend Video',
    type: 'utility',
    category: 'video-utility',
    defaultParams: {},
  },
  'reverse-video': {
    id: 'fal-ai/workflow-utilities/reverse-video',
    displayName: 'Reverse Video',
    type: 'utility',
    category: 'video-utility',
    defaultParams: {},
  },
  'extract-frame': {
    id: 'fal-ai/workflow-utilities/extract-nth-frame',
    displayName: 'Extract Frame',
    type: 'utility',
    category: 'video-utility',
    defaultParams: {},
  },

  // ── New Image Models ───────────────────────────────────────────────

  'flux-kontext-pro': {
    id: 'fal-ai/flux-pro/kontext',
    displayName: 'Flux Kontext Pro',
    type: 'image',
    subtype: 'image-to-image',
    defaultParams: {
      output_format: 'jpeg',
    },
  },
  'flux-kontext-max': {
    id: 'fal-ai/flux-pro/kontext/max',
    displayName: 'Flux Kontext Max',
    type: 'image',
    subtype: 'image-to-image',
    defaultParams: {
      output_format: 'jpeg',
    },
  },
  'flux-kontext-t2i': {
    id: 'fal-ai/flux-pro/kontext/text-to-image',
    displayName: 'Flux Kontext Pro T2I',
    type: 'image',
    defaultParams: {
      num_images: 1,
      output_format: 'jpeg',
    },
  },
  'kling-image-v3': {
    id: 'fal-ai/kling-image/v3/text-to-image',
    displayName: 'Kling Image V3',
    type: 'image',
    defaultParams: {
      num_images: 1,
      image_size: 'landscape_16_9',
    },
  },
  'kling-image-o3': {
    id: 'fal-ai/kling-image/o3/text-to-image',
    displayName: 'Kling Image O3',
    type: 'image',
    defaultParams: {
      num_images: 1,
      image_size: 'landscape_16_9',
    },
  },
  'qwen-image-max': {
    id: 'fal-ai/qwen-image-max/text-to-image',
    displayName: 'Qwen Image Max',
    type: 'image',
    defaultParams: {
      num_images: 1,
      output_format: 'jpeg',
    },
  },
  'ideogram-v3': {
    id: 'fal-ai/ideogram/v3',
    displayName: 'Ideogram V3',
    type: 'image',
    defaultParams: {
      num_images: 1,
    },
  },
  'bria-fibo': {
    id: 'bria/fibo/generate',
    displayName: 'Bria FIBO',
    type: 'image',
    defaultParams: {
      num_images: 1,
    },
  },

  // ── New Video Models ───────────────────────────────────────────────

  'pixverse-v56-t2v': {
    id: 'fal-ai/pixverse/v5.6/text-to-video',
    displayName: 'PixVerse v5.6 T2V',
    type: 'video',
    defaultParams: {
      aspect_ratio: '16:9',
    },
  },
  'pixverse-v56-i2v': {
    id: 'fal-ai/pixverse/v5.6/image-to-video',
    displayName: 'PixVerse v5.6 I2V',
    type: 'video',
    subtype: 'image-to-video',
    defaultParams: {
      aspect_ratio: '16:9',
    },
  },
  'vidu-q3-t2v': {
    id: 'fal-ai/vidu/q3/text-to-video',
    displayName: 'Vidu Q3 T2V',
    type: 'video',
    defaultParams: {
      aspect_ratio: '16:9',
    },
  },
  'vidu-q3-i2v': {
    id: 'fal-ai/vidu/q3/image-to-video',
    displayName: 'Vidu Q3 I2V',
    type: 'video',
    subtype: 'image-to-video',
    defaultParams: {
      aspect_ratio: '16:9',
    },
  },
  'ltx-2-19b': {
    id: 'fal-ai/ltx-2-19b/image-to-video',
    displayName: 'LTX-2 19B',
    type: 'video',
    subtype: 'image-to-video',
    defaultParams: {
      aspect_ratio: '16:9',
    },
  },
};

function getApiKey() {
  const key = process.env.FALAI_API_KEY;
  if (!key) throw new Error('FALAI_API_KEY not set');
  return key;
}

/**
 * Submit a generation request to fal.ai queue and wait for result.
 * 
 * @param {string} modelKey - Key from FAL_MODELS (e.g., 'flux-2-flex')
 * @param {string} prompt - The generation prompt
 * @param {object} overrides - Override default params
 * @returns {{ images: Array<{ url: string, content_type: string }>, buffer: Buffer, mimeType: string }}
 */
async function generateFal(modelKey, prompt, overrides = {}) {
  const modelConfig = FAL_MODELS[modelKey];
  if (!modelConfig) throw new Error(`Unknown fal.ai model: ${modelKey}`);

  const apiKey = getApiKey();
  const baseUrl = `https://queue.fal.run/${modelConfig.id}`;

  // For utility models, prompt is ignored — input comes from overrides
  const input = modelConfig.type === 'utility'
    ? { ...modelConfig.defaultParams, ...overrides }
    : { prompt, ...modelConfig.defaultParams, ...overrides };

  // Step 1: Submit to queue
  const submitRes = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${apiKey}`,
    },
    body: JSON.stringify(input),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text();
    throw new Error(`fal.ai submit failed (${submitRes.status}): ${errText.substring(0, 300)}`);
  }

  const submitData = await submitRes.json();
  const requestId = submitData.request_id;

  if (!requestId) {
    // Synchronous response — some models return immediately
    return processFalResponse(submitData);
  }

  // Step 2: Poll for completion
  const statusUrl = `${baseUrl}/requests/${requestId}/status`;
  const resultUrl = `${baseUrl}/requests/${requestId}`;
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    const statusRes = await fetch(statusUrl, {
      headers: { 'Authorization': `Key ${apiKey}` },
    });
    const statusData = await statusRes.json();

    if (statusData.status === 'COMPLETED') {
      // Fetch result
      const resultRes = await fetch(resultUrl, {
        headers: { 'Authorization': `Key ${apiKey}` },
      });
      if (!resultRes.ok) throw new Error(`fal.ai result fetch failed: ${resultRes.status}`);
      const resultData = await resultRes.json();
      return processFalResponse(resultData);
    }

    if (statusData.status === 'FAILED') {
      throw new Error(`fal.ai generation failed: ${statusData.error || 'Unknown error'}`);
    }

    // IN_QUEUE or IN_PROGRESS — keep polling
  }

  throw new Error('fal.ai generation timed out');
}

/**
 * Process fal.ai response into our standard format.
 */
async function processFalResponse(data) {
  // Handle video responses (video field instead of images)
  if (data.video) {
    const videoUrl = data.video.url || data.video;
    const contentType = data.video.content_type || 'video/mp4';
    const videoRes = await fetch(typeof videoUrl === 'string' ? videoUrl : videoUrl.url);
    if (!videoRes.ok) throw new Error(`Failed to download fal.ai video: ${videoRes.status}`);
    const buffer = Buffer.from(await videoRes.arrayBuffer());
    return { buffer, mimeType: contentType, url: typeof videoUrl === 'string' ? videoUrl : videoUrl.url, textResponse: null };
  }

  // Handle utility responses that return an image field (e.g., background removal, upscale)
  if (data.image) {
    const imgUrl = data.image.url || data.image;
    const contentType = data.image.content_type || 'image/png';
    const imgRes = await fetch(typeof imgUrl === 'string' ? imgUrl : imgUrl.url);
    if (!imgRes.ok) throw new Error(`Failed to download fal.ai result: ${imgRes.status}`);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    return { buffer, mimeType: contentType, url: typeof imgUrl === 'string' ? imgUrl : imgUrl.url, textResponse: null };
  }

  // Handle frame extraction or other outputs that return a generic output_url / file
  if (data.output_url || data.file) {
    const outUrl = data.output_url || data.file.url || data.file;
    const outRes = await fetch(typeof outUrl === 'string' ? outUrl : outUrl.url);
    if (!outRes.ok) throw new Error(`Failed to download fal.ai result: ${outRes.status}`);
    const buffer = Buffer.from(await outRes.arrayBuffer());
    const ct = outRes.headers.get('content-type') || 'application/octet-stream';
    return { buffer, mimeType: ct, url: typeof outUrl === 'string' ? outUrl : outUrl.url, textResponse: null };
  }

  const images = data.images || [];
  if (images.length === 0) {
    // Return raw data for utility responses that don't fit standard shapes
    return { buffer: null, mimeType: null, url: null, textResponse: null, rawResponse: data };
  }

  const firstImage = images[0];
  const imageUrl = firstImage.url;
  const contentType = firstImage.content_type || 'image/jpeg';

  // Download the image to get a buffer
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error(`Failed to download fal.ai image: ${imageRes.status}`);
  const buffer = Buffer.from(await imageRes.arrayBuffer());

  return {
    buffer,
    mimeType: contentType,
    url: imageUrl,
    allImages: images,
    textResponse: null,
  };
}

// Convenience wrappers

async function generateFlux2(prompt, overrides = {}) {
  return generateFal('flux-2-flex', prompt, overrides);
}

async function generateRecraftV4(prompt, overrides = {}) {
  return generateFal('recraft-v4', prompt, overrides);
}

async function generateKling3(prompt, overrides = {}) {
  return generateFal('kling-3', prompt, overrides);
}

async function generateGrokImagine(prompt, overrides = {}) {
  return generateFal('grok-imagine', prompt, overrides);
}

async function generateVeo31(prompt, overrides = {}) {
  return generateFal('veo-3.1', prompt, overrides);
}

async function generateWan26(prompt, overrides = {}) {
  return generateFal('wan-2.6', prompt, overrides);
}

async function generateSeedream45(prompt, overrides = {}) {
  return generateFal('seedream-4.5', prompt, overrides);
}

async function generateZImage(prompt, overrides = {}) {
  return generateFal('z-image', prompt, overrides);
}

async function generateMinimaxHailuo(prompt, overrides = {}) {
  return generateFal('minimax-hailuo', prompt, overrides);
}

async function generateSeedance15Pro(prompt, overrides = {}) {
  return generateFal('seedance-1.5-pro', prompt, overrides);
}

async function generateSora2Fal(prompt, overrides = {}) {
  return generateFal('sora-2', prompt, overrides);
}

async function generateReve(prompt, overrides = {}) {
  return generateFal('reve', prompt, overrides);
}

/**
 * Run a utility model (upscale, background removal, video utility, etc.)
 * Unlike generation, utilities take input media rather than prompts.
 * 
 * @param {string} utilityKey - Key from FAL_MODELS where type === 'utility'
 * @param {object} params - Input parameters (image_url, video_url, etc.)
 * @returns {Promise<object>} Result with buffer, mimeType, url
 */
async function runUtility(utilityKey, params = {}) {
  const modelConfig = FAL_MODELS[utilityKey];
  if (!modelConfig) throw new Error(`Unknown utility: ${utilityKey}`);
  if (modelConfig.type !== 'utility') throw new Error(`${utilityKey} is not a utility model (type: ${modelConfig.type})`);
  return generateFal(utilityKey, null, params);
}

/**
 * List all utility models.
 */
function listUtilities() {
  return Object.entries(FAL_MODELS)
    .filter(([, m]) => m.type === 'utility')
    .map(([key, m]) => ({
      key,
      id: m.id,
      displayName: m.displayName,
      category: m.category,
    }));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export {
  generateFal, generateFlux2, generateRecraftV4, generateKling3,
  generateGrokImagine, generateVeo31, generateWan26, generateSeedream45,
  generateZImage, generateMinimaxHailuo, generateSeedance15Pro, generateSora2Fal,
  generateReve, runUtility, listUtilities, FAL_MODELS,
};
