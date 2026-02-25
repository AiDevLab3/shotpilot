/**
 * Video Route — POST /api/v2/video/recommend + POST /api/v2/video/generate
 * Recommend best video model for a hero frame, then animate it
 * ShotPilot v2
 */
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getModelById } from '../services/modelRegistry.js';
import { recommendVideoModel } from '../services/modelRecommender.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads/videos');

// Ensure video uploads dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Lazy-load fal key
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
  const submitData = await submitRes.json();
  const { request_id } = submitData;
  // Use status_url/response_url from API response (more reliable for nested-path endpoints)
  const statusUrl = submitData.status_url || `https://queue.fal.run/${endpoint}/requests/${request_id}/status`;
  const responseUrl = submitData.response_url || `https://queue.fal.run/${endpoint}/requests/${request_id}`;

  // Poll (max 5 min for video)
  const start = Date.now();
  while (Date.now() - start < 300000) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(statusUrl, { headers: { 'Authorization': `Key ${key}` } });
    let status;
    try { status = await statusRes.json(); } catch { continue; }
    if (status.status === 'COMPLETED') {
      const resultRes = await fetch(responseUrl, { headers: { 'Authorization': `Key ${key}` } });
      return await resultRes.json();
    }
    if (status.status === 'FAILED') throw new Error(`Video generation failed: ${JSON.stringify(status)}`);
  }
  throw new Error('Video generation timed out (5 min)');
}

const router = Router();

// Recommend video model
router.post('/api/v2/video/recommend', (req, res) => {
  try {
    const { heroFrameAnalysis, cameraMove, duration, hasCharacters, hasDialogue, needsAudio } = req.body;
    
    const recommendation = recommendVideoModel(heroFrameAnalysis || {}, {
      cameraMove, duration, hasCharacters, hasDialogue, needsAudio,
    });

    res.json(recommendation);
  } catch (error) {
    console.error('[v2video] Recommend error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Generate video from hero frame
router.post('/api/v2/video/generate', async (req, res) => {
  try {
    const { modelId, prompt, heroFrameUrl, duration, aspectRatio, options = {} } = req.body;

    if (!modelId) return res.status(400).json({ error: 'modelId required' });
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const model = getModelById(modelId);
    if (!model) return res.status(400).json({ error: `Unknown model: ${modelId}` });
    if (model.type !== 'video') return res.status(400).json({ error: `${model.name} is not a video model` });
    if (!model.active) {
      return res.json({
        apiAvailable: false,
        modelId: model.id,
        modelName: model.name,
        prompt,
        message: `${model.name} is external-only. Use this prompt in the ${model.name} interface.`,
      });
    }

    // Determine endpoint (image-to-video if hero frame, else text-to-video)
    let endpoint = model.endpoint;
    if (!heroFrameUrl && model.variants?.t2v) {
      endpoint = model.variants.t2v.endpoint;
    }

    // Build request body
    const body = {
      prompt,
      ...options,
    };

    // Add hero frame if provided
    if (heroFrameUrl) {
      // Resolve local path to data URI or pass URL
      if (heroFrameUrl.startsWith('http')) {
        body.image_url = heroFrameUrl;
      } else {
        const localPath = path.join(__dirname, '../../', heroFrameUrl.replace(/^\//, ''));
        if (fs.existsSync(localPath)) {
          const buf = fs.readFileSync(localPath);
          body.image_url = `data:image/jpeg;base64,${buf.toString('base64')}`;
        }
      }
    }

    if (duration) body.duration = duration;
    if (aspectRatio) body.aspect_ratio = aspectRatio;

    const result = await submitToFal(endpoint, body);

    // Extract video URL from various response shapes
    let videoUrl = null;
    if (result.video?.url) videoUrl = result.video.url;
    else if (result.output?.url) videoUrl = result.output.url;
    else if (result.video_url) videoUrl = result.video_url;

    if (!videoUrl) {
      return res.json({ success: true, raw: result, message: 'Video generated but no standard URL found' });
    }

    // Download video locally
    const videoRes = await fetch(videoUrl);
    const buffer = Buffer.from(await videoRes.arrayBuffer());
    const filename = `${modelId}_${Date.now()}.mp4`;
    const localPath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(localPath, buffer);

    res.json({
      success: true,
      videoUrl: `/uploads/videos/${filename}`,
      localPath,
      modelUsed: modelId,
      duration: duration || 'default',
    });
  } catch (error) {
    console.error('[v2video] Generate error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
