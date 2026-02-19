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

  const input = {
    prompt,
    ...modelConfig.defaultParams,
    ...overrides,
  };

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
  const images = data.images || [];
  if (images.length === 0) throw new Error('No images returned from fal.ai');

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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export { generateFal, generateFlux2, generateRecraftV4, generateKling3, FAL_MODELS };
