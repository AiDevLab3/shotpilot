/**
 * Upscale Route — POST /api/upscale
 * Topaz upscaling via @fal-ai/client SDK
 * ShotPilot v2
 */
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { upscaleTopaz } from '../services/generation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads/images');

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

router.post('/api/upscale', upload.single('image'), async (req, res) => {
  try {
    let imagePath;

    if (req.file) {
      imagePath = `uploads/images/${path.basename(req.file.path)}`;
    } else if (req.body?.imagePath) {
      imagePath = req.body.imagePath;
    } else if (req.body?.imageUrl) {
      // v2 API: imageUrl (relative like /uploads/images/xxx.jpg)
      imagePath = req.body.imageUrl.replace(/^\//, '');
    } else {
      return res.status(400).json({ error: 'No image provided. Upload a file or pass imageUrl/imagePath.' });
    }

    const scale = parseInt(req.body?.scale) || 2;

    const result = await upscaleTopaz({ imagePath, scale });

    res.json({
      success: true,
      images: result.images,
      requestId: result.requestId,
    });
  } catch (error) {
    console.error('[upscale] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
