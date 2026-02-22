/**
 * Generate Route — POST /api/generate
 * Unified generation endpoint — routes to the right model
 * ShotPilot v2
 */
import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getModelById } from '../services/modelRegistry.js';
import {
  generateFlux2, generateGptImage, generateNanoBanana,
  editNanoBanana, upscaleTopaz, getRealismLockBlock,
} from '../services/generation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads/images');

// Lazy-load API key for fal.ai raw fetch calls
let FAL_API_KEY = null;
function getFalKey() {
  if (FAL_API_KEY) return FAL_API_KEY;
  FAL_API_KEY = process.env.FALAI_API_KEY;
  if (!FAL_API_KEY) {
    try {
      const envPath = path.join(__dirname, '../../../compiler/.env');
      const envFile = fs.readFileSync(envPath, 'utf-8');
      const m = envFile.match(/FALAI_API_KEY=(.+)/);
      if (m) FAL_API_KEY = m[1].trim();
    } catch {}
  }
  return FAL_API_KEY;
}

/**
 * Generic fal.ai submit + poll (same pattern as generation.js)
 */
async function submitToFal(endpoint, body) {
  const key = getFalKey();
  if (!key) throw new Error('FALAI_API_KEY not configured');

  const submitRes = await fetch(`https://queue.fal.run/${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`fal.ai submit failed (${endpoint}): ${submitRes.status} ${err}`);
  }
  const { request_id } = await submitRes.json();

  // Poll (max 3 min)
  const start = Date.now();
  while (Date.now() - start < 180000) {
    await new Promise(r => setTimeout(r, 3000));
    const statusRes = await fetch(
      `https://queue.fal.run/${endpoint}/requests/${request_id}/status`,
      { headers: { 'Authorization': `Key ${key}` } }
    );
    let status;
    try { status = await statusRes.json(); } catch { continue; }
    if (status.status === 'COMPLETED') {
      const resultRes = await fetch(
        `https://queue.fal.run/${endpoint}/requests/${request_id}`,
        { headers: { 'Authorization': `Key ${key}` } }
      );
      return await resultRes.json();
    }
    if (status.status === 'FAILED') throw new Error(`Generation failed: ${JSON.stringify(status)}`);
  }
  throw new Error('Generation timed out (3 min)');
}

/**
 * Download image URL to local uploads dir, return local path info
 */
async function downloadImage(url, prefix = 'gen') {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filename = `${prefix}_${Date.now()}.jpg`;
  const localPath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(localPath, buffer);
  return { url: `/uploads/images/${filename}`, localPath, filename, size: buffer.length };
}

/**
 * Prepare source image as data URI from base64, URL, or local path
 */
function resolveSourceImage(sourceImage) {
  if (!sourceImage) return null;
  // Already a data URI
  if (sourceImage.startsWith('data:')) return sourceImage;
  // URL
  if (sourceImage.startsWith('http')) return sourceImage;
  // Local path (relative to project root)
  const fullPath = path.join(__dirname, '../../', sourceImage);
  if (fs.existsSync(fullPath)) {
    const buf = fs.readFileSync(fullPath);
    return `data:image/jpeg;base64,${buf.toString('base64')}`;
  }
  // Assume it's raw base64
  return `data:image/jpeg;base64,${sourceImage}`;
}

const router = Router();

router.post('/api/generate', async (req, res) => {
  try {
    const { modelId, prompt, strategy = 'regenerate', sourceImage, options = {} } = req.body;

    if (!modelId) return res.status(400).json({ error: 'modelId required' });
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const model = getModelById(modelId);
    if (!model) return res.status(400).json({ error: `Unknown model: ${modelId}` });
    if (!model.active) {
      return res.json({
        apiAvailable: false,
        model: model.id,
        modelName: model.name,
        prompt,
        message: `${model.name} is external-only. Use this prompt in the ${model.name} interface.`,
      });
    }

    const imageDataUri = resolveSourceImage(sourceImage);
    const isEdit = strategy === 'edit' && imageDataUri;

    // Route to existing functions for models we already support
    switch (modelId) {
      case 'flux_2': {
        const params = {
          prompt, numImages: options.numImages || 1,
          imageSize: options.imageSize || 'landscape_16_9',
          numSteps: options.numSteps || 28,
          guidanceScale: options.guidanceScale || 3.5,
        };
        if (isEdit) {
          params.useReference = true;
          params.referenceImages = [{ image_url: imageDataUri, role: 'reference' }];
        }
        const result = await generateFlux2(params);
        return res.json({ success: true, images: result.images, requestId: result.requestId });
      }

      case 'gpt_image_1_5': {
        const params = {
          prompt, numImages: options.numImages || 1,
          imageSize: options.imageSize || 'landscape_16_9',
        };
        if (isEdit) {
          params.useReference = true;
          params.editPrompt = prompt;
          // Save temp file for GPT edit
          const tmpPath = path.join(UPLOAD_DIR, `tmp_edit_${Date.now()}.jpg`);
          if (sourceImage && !sourceImage.startsWith('data:') && !sourceImage.startsWith('http')) {
            params.referenceImagePath = sourceImage;
          }
        }
        const result = await generateGptImage(params);
        return res.json({ success: true, images: result.images, requestId: result.requestId });
      }

      case 'nano_banana_pro': {
        if (isEdit && sourceImage) {
          const result = await editNanoBanana({ prompt, imagePath: sourceImage, numImages: options.numImages || 1 });
          return res.json({ success: true, images: result.images, requestId: result.requestId });
        }
        const result = await generateNanoBanana({ prompt, numImages: options.numImages || 1, imageSize: options.imageSize || 'landscape_16_9' });
        return res.json({ success: true, images: result.images, requestId: result.requestId });
      }

      default: {
        // Generic fal.ai model — use endpoint from registry
        const endpoint = isEdit
          ? (model.editEndpoint || model.img2imgEndpoint || model.endpoint)
          : model.endpoint;

        if (!endpoint) {
          return res.status(400).json({ error: `No endpoint for ${modelId} (strategy: ${strategy})` });
        }

        const body = { prompt, ...options };
        if (isEdit && imageDataUri) {
          // Common fal.ai patterns for source image
          body.image_url = imageDataUri;
          body.image = imageDataUri;
        }
        if (options.imageSize) body.image_size = options.imageSize;
        if (!body.num_images) body.num_images = options.numImages || 1;

        const result = await submitToFal(endpoint, body);

        // Extract images from various response shapes
        const imageUrls = [];
        if (result.images) {
          for (const img of result.images) imageUrls.push(img.url || img);
        } else if (result.image?.url) {
          imageUrls.push(result.image.url);
        } else if (result.output?.url) {
          imageUrls.push(result.output.url);
        }

        if (imageUrls.length === 0) {
          return res.json({ success: true, raw: result, message: 'Generation complete but no standard image URL found in response' });
        }

        const images = [];
        for (const url of imageUrls) {
          images.push(await downloadImage(url, modelId));
        }

        return res.json({ success: true, images, model: modelId });
      }
    }
  } catch (error) {
    console.error('[generate] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
