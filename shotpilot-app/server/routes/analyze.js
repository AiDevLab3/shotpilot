/**
 * Analyze Route — POST /api/analyze
 * Upload image → get grade + diagnosis + model recommendation
 * ShotPilot v2
 */
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { holisticImageAudit } from '../services/ai/imageAudit.js';
import { recommendFix } from '../services/modelRecommender.js';
import { readKBFile } from '../services/kbLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  dest: path.join(__dirname, '../../uploads/images'),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();

router.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const fs = await import('fs');
    const pathMod = await import('path');
    let imageBuffer, mimeType;

    if (req.file) {
      imageBuffer = fs.readFileSync(req.file.path);
      mimeType = req.file.mimetype || 'image/jpeg';
    } else if (req.body?.imageUrl) {
      // Re-analyze from local path (e.g. /uploads/images/xxx.jpg)
      const localPath = pathMod.join(__dirname, '../../', req.body.imageUrl.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        imageBuffer = fs.readFileSync(localPath);
        mimeType = 'image/jpeg';
      } else {
        // Try fetching from URL
        const imgRes = await fetch(req.body.imageUrl);
        imageBuffer = Buffer.from(await imgRes.arrayBuffer());
        mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
      }
    } else {
      return res.status(400).json({ error: 'No image provided — upload a file or pass imageUrl' });
    }

    // Optional context from request body
    const { projectStyle, projectName } = req.body || {};

    // Load core KB for audit context
    const kbContent = readKBFile('01_Core_Realism_Principles.md') || '';

    // Build minimal project context
    const project = projectName
      ? { name: projectName, visual_style: projectStyle || '' }
      : null;

    // Run the holistic audit
    const auditResult = await holisticImageAudit({
      imageBuffer,
      mimeType,
      project,
      scene: null,
      shot: null,
      characters: [],
      objects: [],
      kbContent,
    });

    // Map audit verdict to v2 3-tier
    let verdict;
    if (auditResult.recommendation === 'LOCK IT IN') verdict = 'LOCK_IT_IN';
    else if (auditResult.recommendation === 'REFINE') verdict = 'REFINE';
    else verdict = 'REGENERATE';

    // Get model recommendation
    const recommendation = recommendFix(auditResult, projectStyle ? { visual_style: projectStyle } : null);

    // Build simplified diagnosis
    const diagnosisParts = [];
    if (auditResult.summary) diagnosisParts.push(auditResult.summary);
    if (auditResult.realism_diagnosis?.length > 0) {
      diagnosisParts.push(
        auditResult.realism_diagnosis.map(d => `${d.pattern}: ${d.details}`).join('. ')
      );
    }

    res.json({
      verdict,
      score: auditResult.overall_score,
      diagnosis: diagnosisParts.join(' ') || 'Analysis complete.',
      issues: auditResult.issues || [],
      dimensions: auditResult.dimensions,
      promptAdjustments: auditResult.prompt_adjustments || [],
      styleMatch: ((auditResult.dimensions?.style_consistency?.score || 0)),
      realism: ((auditResult.dimensions?.physics?.score || 0) + (auditResult.dimensions?.clarity?.score || 0)) / 2,
      fixes: auditResult.prompt_adjustments || [],
      recommendation: {
        modelId: recommendation.topRecommendation.model,
        modelName: recommendation.topRecommendation.modelName,
        strategy: recommendation.strategy,
        reasoning: recommendation.reasoning,
        alternatives: (recommendation.alternatives || []).map(a => ({
          modelId: a.model,
          modelName: a.modelName,
          strategy: a.strategy || recommendation.strategy,
          reasoning: a.reasoning || '',
        })),
      },
    });
  } catch (error) {
    console.error('[analyze] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
