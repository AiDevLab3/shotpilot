/**
 * Multi-Model Image Generation Service
 * Supports Flux 2, GPT Image 1.5, Topaz Upscaling, and GenFocus DOF
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fal } from '@fal-ai/client';
import { logApiCall } from './costTracker.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load API keys from compiler/.env or process.env
function loadEnvKeys() {
  const keys = { fal: null, openai: null };
  if (process.env.FALAI_API_KEY) keys.fal = process.env.FALAI_API_KEY;
  if (process.env.OPENAI_API_KEY) keys.openai = process.env.OPENAI_API_KEY;
  try {
    const envPath = path.join(__dirname, '../../../compiler/.env');
    const envFile = fs.readFileSync(envPath, 'utf-8');
    if (!keys.fal) {
      const m = envFile.match(/FALAI_API_KEY=(.+)/);
      if (m) keys.fal = m[1].trim();
    }
    if (!keys.openai) {
      const m = envFile.match(/OPENAI_API_KEY=(.+)/);
      if (m) keys.openai = m[1].trim();
    }
  } catch {}
  if (!keys.fal) throw new Error('FALAI_API_KEY not found');
  if (!keys.openai) console.warn('[generation] OPENAI_API_KEY not found — GPT Image will be unavailable');
  return keys;
}

const { fal: FAL_API_KEY, openai: OPENAI_API_KEY } = loadEnvKeys();

// Configure fal.ai SDK (needed for Topaz which uses non-standard queue protocol)
fal.config({ credentials: FAL_API_KEY });
const UPLOAD_DIR = path.join(__dirname, '../../uploads/images');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Get the realism lock block to inject into prompts
 */
export function getRealismLockBlock() {
  return `cinematic still frame, raw photographed realism, captured through a physical lens
natural depth of field, realistic highlight rolloff, subtle filmic grain
physically plausible lighting and shadows, realistic skin texture (no plastic)
imperfect real-world entropy: mild wear, micro-scratches, natural variation
avoid AI sheen, avoid HDR/glow, avoid sterile symmetry`;
}

/**
 * Common fal.ai submission and polling logic
 */
async function submitToFal(endpoint, body) {
  console.log(`[generation] Submitting to ${endpoint}`);
  
  const submitRes = await fetch(`https://queue.fal.run/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`fal.ai submit failed: ${submitRes.status} ${err}`);
  }

  const { request_id } = await submitRes.json();
  console.log(`[generation] Queued: ${request_id}`);

  // Poll for completion (max 3 minutes)
  const startTime = Date.now();
  while (Date.now() - startTime < 180000) {
    await new Promise(r => setTimeout(r, 3000));

    const statusRes = await fetch(
      `https://queue.fal.run/${endpoint}/requests/${request_id}/status`,
      { headers: { 'Authorization': `Key ${FAL_API_KEY}` } }
    );
    
    let status;
    try {
      status = await statusRes.json();
    } catch {
      continue;
    }

    if (status.status === 'COMPLETED') {
      const resultRes = await fetch(
        `https://queue.fal.run/${endpoint}/requests/${request_id}`,
        { headers: { 'Authorization': `Key ${FAL_API_KEY}` } }
      );
      const result = await resultRes.json();
      return { result, requestId: request_id };
    } else if (status.status === 'FAILED') {
      throw new Error(`Generation failed: ${JSON.stringify(status)}`);
    }
    // else IN_QUEUE or IN_PROGRESS — keep polling
  }

  throw new Error('Generation timed out after 3 minutes');
}

/**
 * Download and save images from URLs
 */
async function downloadImages(imageUrls, prefix) {
  const images = [];
  for (let i = 0; i < imageUrls.length; i++) {
    const imgUrl = imageUrls[i];
    const imgRes = await fetch(imgUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    
    // Generate unique filename
    const filename = `${prefix}_${Date.now()}_${i}.jpg`;
    const localPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(localPath, buffer);
    
    images.push({
      url: `/uploads/images/${filename}`,
      localPath,
      filename,
      size: buffer.length,
    });
    console.log(`[generation] Saved: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`);
  }
  return images;
}

/**
 * Generate images via Flux 2 Flex
 * @param {Object} params
 * @param {string} params.prompt - The generation prompt
 * @param {boolean} [params.useReference] - Whether to include a reference image
 * @param {string} [params.referenceImagePath] - Path to the reference image file (server-side)
 * @param {Array} [params.referenceImages] - Array of reference images {image_url, role}
 * @param {number} [params.numImages=4] - Number of variations to generate
 * @param {string} [params.imageSize='landscape_16_9'] - Image size preset
 * @param {number} [params.numSteps=28] - Inference steps
 * @param {number} [params.guidanceScale=3.5] - Guidance scale
 * @param {number} [params.seed] - Optional seed for reproducibility
 * @returns {Promise<{images: Array<{url: string, localPath: string, filename: string}>, requestId: string}>}
 */
export async function generateFlux2(params) {
  const {
    prompt,
    useReference = false,
    referenceImagePath,
    referenceImages = [],
    numImages = 4,
    imageSize = 'landscape_16_9',
    numSteps = 28,
    guidanceScale = 3.5,
    seed,
    meta,
  } = params;

  console.log(`[generation:flux2] Starting: ${numImages} images, ref=${useReference}, steps=${numSteps}`);

  const body = {
    prompt,
    num_images: numImages,
    image_size: imageSize,
    num_inference_steps: numSteps,
    guidance_scale: guidanceScale,
    output_format: 'jpeg',
  };

  if (seed != null) body.seed = seed;

  // Handle multiple reference images
  const allReferenceImages = [];
  
  // Legacy single reference support (useReference + referenceImagePath)
  if (useReference && referenceImagePath) {
    const fullPath = path.join(__dirname, '../../', referenceImagePath);
    if (fs.existsSync(fullPath)) {
      const imageBuffer = fs.readFileSync(fullPath);
      const base64 = imageBuffer.toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64}`;
      allReferenceImages.push({ url: dataUri });
      console.log(`[generation:flux2] Legacy reference image attached (${(imageBuffer.length / 1024).toFixed(0)}KB)`);
    } else {
      console.warn(`[generation:flux2] Legacy reference image not found: ${fullPath}`);
    }
  }
  
  // New multiple reference images support
  if (referenceImages && referenceImages.length > 0) {
    for (let i = 0; i < referenceImages.length; i++) {
      const ref = referenceImages[i];
      const fullPath = path.join(__dirname, '../../', ref.image_url);
      if (fs.existsSync(fullPath)) {
        const imageBuffer = fs.readFileSync(fullPath);
        const base64 = imageBuffer.toString('base64');
        const dataUri = `data:image/jpeg;base64,${base64}`;
        allReferenceImages.push({ url: dataUri });
        console.log(`[refs] Reference #${i + 1} (${ref.role}) attached (${(imageBuffer.length / 1024).toFixed(0)}KB)`);
      } else {
        console.warn(`[refs] Reference image not found: ${fullPath}`);
      }
    }
  }
  
  // Set reference_images if we have any
  if (allReferenceImages.length > 0) {
    body.reference_images = allReferenceImages;
    
    // If prompt doesn't already reference @image, and we only have legacy reference, add it
    if (useReference && referenceImagePath && !referenceImages.length && !body.prompt.includes('@')) {
      body.prompt = `Using @image1 as reference: ${body.prompt}`;
    }
    
    console.log(`[generation:flux2] Total reference images: ${allReferenceImages.length}`);
  }

  const startTime = Date.now();
  const { result, requestId } = await submitToFal('fal-ai/flux-2-flex', body);
  const durationMs = Date.now() - startTime;
  const images = await downloadImages(result.images?.map(img => img.url) || [], 'flux2');
  
  // Log cost
  setImmediate(() => {
    try {
      logApiCall({
        provider: 'fal.ai',
        model: 'fal-ai/flux-2-flex',
        action: meta?.action || 'generate',
        projectId: meta?.projectId,
        assetId: meta?.assetId,
        inputTokens: 0,
        outputTokens: 0,
        imageCount: images.length,
        durationMs,
        requestMeta: { prompt, numImages, imageSize, numSteps, guidanceScale, useReference },
        responseMeta: { requestId, imageCount: images.length },
        error: null
      });
    } catch (err) {
      console.warn('[costs] Failed to log Flux2 call:', err.message);
    }
  });
  
  return { images, requestId };
}

/**
 * Generate images via GPT Image 1.5
 * @param {Object} params
 * @param {string} params.prompt - The generation prompt
 * @param {boolean} [params.useReference] - Whether to include a reference image for editing
 * @param {string} [params.referenceImagePath] - Path to the reference image file (server-side)
 * @param {Array} [params.referenceImages] - Array of reference images {image_url, role}
 * @param {number} [params.numImages=4] - Number of variations to generate
 * @param {string} [params.imageSize='landscape_16_9'] - Image size preset
 * @param {string} [params.editPrompt] - If useReference=true, this becomes the edit instruction
 * @returns {Promise<{images: Array<{url: string, localPath: string, filename: string}>, requestId: string}>}
 */
export async function generateGptImage(params) {
  const {
    prompt,
    useReference = false,
    referenceImagePath,
    referenceImages = [],
    numImages = 4,
    imageSize = 'landscape_16_9',
    editPrompt,
    meta,
  } = params;

  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

  console.log(`[generation:gpt-image] Starting via OpenAI API: ${numImages} images, ref=${useReference}`);

  // Map our size presets to OpenAI sizes
  const sizeMap = {
    'landscape_16_9': '1536x1024',
    'landscape_4_3': '1536x1024',
    'portrait_9_16': '1024x1536',
    'portrait_4_3': '1024x1536',
    'square': '1024x1024',
    'square_hd': '1024x1024',
  };
  const openaiSize = sizeMap[imageSize] || '1536x1024';

  let finalPrompt = useReference && editPrompt ? editPrompt : prompt;

  // Enrich prompt with reference role descriptions
  if (referenceImages && referenceImages.length > 0) {
    const refPrompts = referenceImages.map((ref, i) =>
      `Apply Image ${i + 1}'s ${ref.role} characteristics`
    );
    finalPrompt = `${refPrompts.join(', ')}: ${finalPrompt}`;
    console.log(`[refs] Added ${referenceImages.length} reference descriptions to GPT prompt`);
  }

  const startTime = Date.now();

  try {
    // Generate images sequentially (OpenAI gpt-image-1 supports n but we'll do 1 at a time for reliability)
    const allImageUrls = [];
    const batchSize = Math.min(numImages, 4); // OpenAI supports up to n=4 per call

    const body = {
      model: 'gpt-image-1',
      prompt: finalPrompt,
      n: batchSize,
      size: openaiSize,
      quality: 'high',
    };

    // If we have a reference image for editing, use the edit endpoint
    if (useReference && referenceImagePath) {
      const fullPath = path.join(__dirname, '../../', referenceImagePath);
      if (fs.existsSync(fullPath)) {
        console.log(`[generation:gpt-image] Edit mode with reference image`);
        // For edits, we need multipart form data
        const imageBuffer = fs.readFileSync(fullPath);
        const blob = new Blob([imageBuffer], { type: 'image/png' });
        const formData = new FormData();
        formData.append('model', 'gpt-image-1');
        formData.append('image[]', blob, 'reference.png');
        formData.append('prompt', finalPrompt);
        formData.append('n', String(batchSize));
        formData.append('size', openaiSize);
        formData.append('quality', 'high');

        const res = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
          body: formData,
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`OpenAI edit failed: ${res.status} ${err}`);
        }

        const result = await res.json();
        for (const img of result.data) {
          if (img.url) allImageUrls.push(img.url);
          else if (img.b64_json) {
            // Save base64 directly
            const buf = Buffer.from(img.b64_json, 'base64');
            const filename = `gpt_${Date.now()}_${allImageUrls.length}.png`;
            const localPath = path.join(UPLOAD_DIR, filename);
            fs.writeFileSync(localPath, buf);
            allImageUrls.push(`LOCAL:${filename}`);
          }
        }
      }
    }

    // If no edit was done (or no reference), use generations endpoint
    if (allImageUrls.length === 0) {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI generation failed: ${res.status} ${err}`);
      }

      const result = await res.json();
      for (const img of result.data) {
        if (img.url) allImageUrls.push(img.url);
        else if (img.b64_json) {
          const buf = Buffer.from(img.b64_json, 'base64');
          const filename = `gpt_${Date.now()}_${allImageUrls.length}.png`;
          const localPath = path.join(UPLOAD_DIR, filename);
          fs.writeFileSync(localPath, buf);
          allImageUrls.push(`LOCAL:${filename}`);
        }
      }
    }

    // Download remote URLs, skip already-saved locals
    const images = [];
    for (let i = 0; i < allImageUrls.length; i++) {
      const u = allImageUrls[i];
      if (u.startsWith('LOCAL:')) {
        const filename = u.replace('LOCAL:', '');
        const localPath = path.join(UPLOAD_DIR, filename);
        const size = fs.statSync(localPath).size;
        images.push({ url: `/uploads/images/${filename}`, localPath, filename, size });
        console.log(`[generation:gpt-image] Saved (b64): ${filename} (${(size / 1024).toFixed(0)}KB)`);
      } else {
        const dl = await downloadImages([u], 'gpt');
        images.push(...dl);
      }
    }

    const durationMs = Date.now() - startTime;
    console.log(`[generation:gpt-image] Done: ${images.length} images in ${(durationMs / 1000).toFixed(1)}s`);

    // Log cost
    setImmediate(() => {
      try {
        logApiCall({
          provider: 'openai',
          model: 'gpt-image-1',
          action: meta?.action || 'generate',
          projectId: meta?.projectId,
          assetId: meta?.assetId,
          inputTokens: 0,
          outputTokens: 0,
          imageCount: images.length,
          durationMs,
          requestMeta: { prompt: finalPrompt, numImages: batchSize, size: openaiSize, useReference },
          responseMeta: { imageCount: images.length },
          error: null
        });
      } catch (err) {
        console.warn('[costs] Failed to log GPT Image call:', err.message);
      }
    });

    return { images, requestId: `openai-${Date.now()}` };
  } catch (error) {
    const durationMs = Date.now() - startTime;

    setImmediate(() => {
      try {
        logApiCall({
          provider: 'openai',
          model: 'gpt-image-1',
          action: meta?.action || 'generate',
          projectId: meta?.projectId,
          assetId: meta?.assetId,
          inputTokens: 0,
          outputTokens: 0,
          imageCount: 0,
          durationMs,
          requestMeta: { prompt: finalPrompt, numImages, useReference },
          responseMeta: null,
          error: error.message
        });
      } catch (err) {
        console.warn('[costs] Failed to log GPT Image error:', err.message);
      }
    });

    console.error(`[generation:gpt-image] Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Upscale an image using Aura SR (fal.ai) — replaces broken Topaz endpoint
 * @param {Object} params
 * @param {string} params.imagePath - Path to the image file to upscale
 * @param {number} [params.scale=2] - Upscaling factor
 * @returns {Promise<{images: Array<{url: string, localPath: string, filename: string}>, requestId: string}>}
 */
export async function upscaleTopaz(params) {
  const { imagePath, scale = 2, meta } = params;

  console.log(`[generation:topaz] Upscaling with ${scale}x scale`);

  const fullPath = path.join(__dirname, '../../', imagePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Image file not found: ${fullPath}`);
  }

  const imageBuffer = fs.readFileSync(fullPath);
  const base64 = imageBuffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64}`;

  const startTime = Date.now();
  const endpoint = 'fal-ai/topaz/upscale/image';

  try {
    console.log(`[generation:topaz] Upscaling via Topaz SDK (${scale}x, Standard V2)`);
    
    const result = await fal.subscribe(endpoint, {
      input: {
        image_url: dataUri,
        upscale_factor: scale,
        model: 'Standard V2',
        output_format: 'jpeg',
      },
      logs: true,
      onQueueUpdate: (u) => {
        if (u.status === 'IN_PROGRESS') console.log(`[generation:topaz] Processing...`);
      },
    });

    const durationMs = Date.now() - startTime;
    const outputUrl = result.data?.image?.url;
    if (!outputUrl) throw new Error('No output image URL from Topaz: ' + JSON.stringify(Object.keys(result.data || {})));
    const images = await downloadImages([outputUrl], 'upscaled');

    console.log(`[generation:topaz] Done in ${(durationMs / 1000).toFixed(1)}s`);

    setImmediate(() => {
      try {
        logApiCall({
          provider: 'fal.ai',
          model: endpoint,
          action: meta?.action || 'upscale',
          projectId: meta?.projectId,
          assetId: meta?.assetId,
          inputTokens: 0,
          outputTokens: 0,
          imageCount: images.length,
          durationMs,
          requestMeta: { imagePath, scale, endpoint },
          responseMeta: { requestId: result.requestId, imageCount: images.length },
          error: null
        });
      } catch (err) {
        console.warn('[costs] Failed to log Topaz call:', err.message);
      }
    });

    return { images, requestId: result.requestId };
  } catch (error) {
    const durationMs = Date.now() - startTime;

    setImmediate(() => {
      try {
        logApiCall({
          provider: 'fal.ai',
          model: endpoint,
          action: meta?.action || 'upscale',
          projectId: meta?.projectId,
          assetId: meta?.assetId,
          inputTokens: 0,
          outputTokens: 0,
          imageCount: 0,
          durationMs,
          requestMeta: { imagePath, scale },
          responseMeta: null,
          error: error.message
        });
      } catch (err) {
        console.warn('[costs] Failed to log Topaz error:', err.message);
      }
    });

    console.error(`[generation:topaz] Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Apply GenFocus depth-of-field correction
 * @param {Object} params
 * @param {string} params.imagePath - Path to the image file
 * @param {string} [params.focusPoint] - Focus point description
 * @returns {Promise<{images: Array<{url: string, localPath: string, filename: string}>, requestId: string}>}
 */
export async function applyGenFocus(params) {
  const { imagePath, focusPoint = 'auto', meta } = params;

  console.log(`[generation:genfocus] Applying DOF correction, focus: ${focusPoint}`);

  const fullPath = path.join(__dirname, '../../', imagePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Image file not found: ${fullPath}`);
  }

  const imageBuffer = fs.readFileSync(fullPath);
  const base64 = imageBuffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64}`;

  const body = {
    image: { url: dataUri },
    focus_point: focusPoint
  };

  const startTime = Date.now();
  try {
    const { result, requestId } = await submitToFal('fal-ai/genfocus', body);
    const durationMs = Date.now() - startTime;
    const images = await downloadImages([result.image?.url || result.url], 'genfocus');
    
    // Log cost
    setImmediate(() => {
      try {
        logApiCall({
          provider: 'fal.ai',
          model: 'fal-ai/genfocus',
          action: meta?.action || 'dof',
          projectId: meta?.projectId,
          assetId: meta?.assetId,
          inputTokens: 0,
          outputTokens: 0,
          imageCount: images.length,
          durationMs,
          requestMeta: { imagePath, focusPoint },
          responseMeta: { requestId, imageCount: images.length },
          error: null
        });
      } catch (err) {
        console.warn('[costs] Failed to log GenFocus call:', err.message);
      }
    });
    
    return { images, requestId };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    
    // Log failed request
    setImmediate(() => {
      try {
        logApiCall({
          provider: 'fal.ai',
          model: 'fal-ai/genfocus',
          action: meta?.action || 'dof',
          projectId: meta?.projectId,
          assetId: meta?.assetId,
          inputTokens: 0,
          outputTokens: 0,
          imageCount: 0,
          durationMs,
          requestMeta: { imagePath, focusPoint },
          responseMeta: null,
          error: error.message
        });
      } catch (err) {
        console.warn('[costs] Failed to log GenFocus error:', err.message);
      }
    });
    
    console.warn(`[generation:genfocus] DOF correction failed: ${error.message}`);
    throw new Error(`GenFocus not available: ${error.message}`);
  }
}

/**
 * Legacy generateImage function - now routes to appropriate model
 * @param {Object} params
 * @param {string} [params.model='flux-2'] - Model to use
 * @returns {Promise<{images: Array<{url: string, localPath: string, filename: string}>, requestId: string}>}
 */
/**
 * Generate images via Nano Banana Pro (Google Imagen via fal.ai SDK)
 */
export async function generateNanoBanana(params) {
  const {
    prompt,
    useReference = false,
    referenceImagePath,
    referenceImages = [],
    numImages = 4,
    imageSize = 'landscape_16_9',
    meta,
  } = params;

  console.log(`[generation:nano] Starting: ${numImages} images, ref=${useReference}`);

  const startTime = Date.now();
  try {
    const result = await fal.subscribe('fal-ai/nano-banana-pro', {
      input: {
        prompt,
        num_images: numImages,
        image_size: imageSize,
      },
      onQueueUpdate: (u) => {
        if (u.status === 'IN_PROGRESS') console.log(`[generation:nano] Processing...`);
      },
    });

    const durationMs = Date.now() - startTime;
    const imageUrls = result.data.images?.map(img => img.url) || [];
    if (!imageUrls.length) throw new Error('No images in Nano Banana Pro response');
    const images = await downloadImages(imageUrls, 'nano');
    console.log(`[generation:nano] Done: ${images.length} images in ${(durationMs / 1000).toFixed(1)}s`);

    setImmediate(() => {
      try {
        logApiCall({
          provider: 'fal.ai', model: 'fal-ai/nano-banana-pro', action: meta?.action || 'generate',
          projectId: meta?.projectId, assetId: meta?.assetId,
          inputTokens: 0, outputTokens: 0, imageCount: images.length, durationMs,
          requestMeta: { prompt, numImages, imageSize },
          responseMeta: { requestId: result.requestId, imageCount: images.length }, error: null
        });
      } catch (err) { console.warn('[costs] Failed to log Nano call:', err.message); }
    });

    return { images, requestId: result.requestId };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    setImmediate(() => {
      try {
        logApiCall({
          provider: 'fal.ai', model: 'fal-ai/nano-banana-pro', action: meta?.action || 'generate',
          projectId: meta?.projectId, assetId: meta?.assetId,
          inputTokens: 0, outputTokens: 0, imageCount: 0, durationMs,
          requestMeta: { prompt, numImages }, responseMeta: null, error: error.message
        });
      } catch (err) { console.warn('[costs] Failed to log Nano error:', err.message); }
    });
    console.error(`[generation:nano] Failed: ${error.message}`);
    throw error;
  }
}

/**
 * Edit/refine an image via Nano Banana Pro Edit
 */
export async function editNanoBanana(params) {
  const { prompt, imagePath, numImages = 1, meta } = params;

  console.log(`[generation:nano-edit] Starting edit`);

  const fullPath = path.join(__dirname, '../../', imagePath);
  if (!fs.existsSync(fullPath)) throw new Error(`Image not found: ${fullPath}`);

  const imageBuffer = fs.readFileSync(fullPath);
  const base64 = imageBuffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64}`;

  const startTime = Date.now();
  try {
    const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
      input: {
        prompt,
        image_urls: [dataUri],
        num_images: numImages,
      },
      onQueueUpdate: (u) => {
        if (u.status === 'IN_PROGRESS') console.log(`[generation:nano-edit] Processing...`);
      },
    });

    const durationMs = Date.now() - startTime;
    const imageUrls = result.data.images?.map(img => img.url) || [];
    if (!imageUrls.length) throw new Error('No images in Nano edit response');
    const images = await downloadImages(imageUrls, 'nano-edit');
    console.log(`[generation:nano-edit] Done in ${(durationMs / 1000).toFixed(1)}s`);

    setImmediate(() => {
      try {
        logApiCall({
          provider: 'fal.ai', model: 'fal-ai/nano-banana-pro/edit', action: meta?.action || 'edit',
          projectId: meta?.projectId, assetId: meta?.assetId,
          inputTokens: 0, outputTokens: 0, imageCount: images.length, durationMs,
          requestMeta: { prompt, imagePath },
          responseMeta: { requestId: result.requestId, imageCount: images.length }, error: null
        });
      } catch (err) { console.warn('[costs] Failed to log Nano edit call:', err.message); }
    });

    return { images, requestId: result.requestId };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    setImmediate(() => {
      try {
        logApiCall({
          provider: 'fal.ai', model: 'fal-ai/nano-banana-pro/edit', action: meta?.action || 'edit',
          projectId: meta?.projectId, assetId: meta?.assetId,
          inputTokens: 0, outputTokens: 0, imageCount: 0, durationMs,
          requestMeta: { prompt, imagePath }, responseMeta: null, error: error.message
        });
      } catch (err) { console.warn('[costs] Failed to log Nano edit error:', err.message); }
    });
    console.error(`[generation:nano-edit] Failed: ${error.message}`);
    throw error;
  }
}

export async function generateImage(params) {
  const { model = 'flux-2', meta, ...otherParams } = params;

  console.log(`[generation] Router: using model ${model}`);

  switch (model) {
    case 'flux-2':
    case 'flux2':
      return generateFlux2({ ...otherParams, meta });
    
    case 'gpt-image':
    case 'gpt-image-1.5':
      return generateGptImage({ ...otherParams, meta });
    
    case 'nano-banana-pro':
    case 'nano':
      return generateNanoBanana({ ...otherParams, meta });
    
    case 'midjourney':
    case 'higgsfield':
      return {
        apiAvailable: false,
        prompt: otherParams.prompt,
        parameters: { model, numImages: otherParams.numImages || 4 }
      };
    
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}
