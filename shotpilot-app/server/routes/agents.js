import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateShot, generateScene, auditGeneratedImage, screenReferenceImage, improveImage, generateAndIterate, analyzeAndRecommend, executeImprovement, generateWithAudit, importImage } from '../services/agents/orchestrator.js';
import { getModelRegistry, suggestPlacements, analyzeGaps, checkCohesion } from '../services/agents/creativeDirector.js';
import { db } from '../database.js';
import { listStyleProfiles } from '../services/agents/styleProfile.js';
import { loadProject, listProjects } from '../services/agents/projectContext.js';
import { checkContinuity, buildCharacterBible } from '../services/agents/continuityTracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({
  dest: path.join(__dirname, '../../uploads/images'),
  limits: { fileSize: 25 * 1024 * 1024 },
});

export default function createAgentRoutes() {
  const router = express.Router();

  /**
   * GET /api/agents/models — list available models with capabilities
   */
  router.get('/api/agents/models', (req, res) => {
    const registry = getModelRegistry();
    
    // Hardcoded edit capability map (Bug 3 fix)
    const editModels = new Set(['flux-kontext', 'gpt-image-1.5', 'nano-banana-pro', 'reve']);
    
    // Infer model type from characteristics
    const inferType = (m) => {
      if (m.name.toLowerCase().includes('topaz')) return 'utility';
      if (m.strengths?.some(s => s.toLowerCase().includes('video'))) return 'video';
      return 'image';
    };
    
    // Infer capabilities from strengths
    const inferCapabilities = (m) => {
      const caps = [];
      if (m.hasAPI) caps.push('generate');
      if (m.strengths?.some(s => /edit|inpaint|surgical/.test(s.toLowerCase()))) caps.push('edit');
      if (m.strengths?.some(s => /reference|consistency|img2img/.test(s.toLowerCase()))) caps.push('img2img');
      if (m.strengths?.some(s => /upscal/.test(s.toLowerCase()))) caps.push('upscale');
      if (m.strengths?.some(s => /text render|typography/.test(s.toLowerCase()))) caps.push('text');
      if (m.strengths?.some(s => /character|face|identity/.test(s.toLowerCase()))) caps.push('character-consistency');
      if (m.strengths?.some(s => /style.?transfer|remix/.test(s.toLowerCase()))) caps.push('style-transfer');
      return caps;
    };
    
    const models = Object.entries(registry).map(([id, m]) => ({
      id,
      name: m.name,
      description: m.description,
      strengths: m.strengths || [],
      weaknesses: m.weaknesses || [],
      hasAPI: m.hasAPI,
      active: m.hasAPI,
      type: inferType(m),
      provider: id.includes('gpt') ? 'openai' : id.includes('midjourney') ? 'external' : 'fal',
      capabilities: inferCapabilities(m),
      hasEdit: editModels.has(id),
    }));
    res.json({ models, profiles: listStyleProfiles() });
  });

  /**
   * POST /api/agents/generate-shot
   * Body: { description, model_preference?, project_id? }
   */
  router.post('/api/agents/generate-shot', async (req, res) => {
    try {
      const { description, model_preference, project_id, scene_id } = req.body;
      if (!description && !scene_id) {
        return res.status(400).json({ error: 'description or scene_id is required' });
      }
      const result = await generateShot({
        description,
        modelPreference: model_preference,
        projectId: project_id,
        sceneId: scene_id,
      });
      res.json(result);
    } catch (err) {
      console.error('[agents/generate-shot] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/audit-image
   * Body: { image (base64), shot_context, project_id? }
   */
  router.post('/api/agents/audit-image', async (req, res) => {
    try {
      const { image, shot_context, project_id } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'image (base64) is required' });
      }
      const result = await auditGeneratedImage(image, shot_context || '', project_id);
      res.json(result);
    } catch (err) {
      console.error('[agents/audit-image] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/screen-reference
   * Body: { image (base64) }
   */
  router.post('/api/agents/screen-reference', async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'image (base64) is required' });
      }
      const result = await screenReferenceImage(image);
      res.json(result);
    } catch (err) {
      console.error('[agents/screen-reference] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/check-continuity
   * Body: { image (base64), shot_context, approved_shots: [{shot_id, image, description}] }
   */
  router.post('/api/agents/check-continuity', async (req, res) => {
    try {
      const { image, shot_context, approved_shots } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'image (base64) is required' });
      }
      const normalizedShots = (approved_shots || []).map(s => ({
        shotId: s.shot_id,
        imageBase64: s.image,
        description: s.description,
      }));
      const result = await checkContinuity(image, shot_context || '', normalizedShots);
      res.json(result);
    } catch (err) {
      console.error('[agents/check-continuity] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/build-character-bible
   * Body: { images: [base64], character_name }
   */
  router.post('/api/agents/build-character-bible', async (req, res) => {
    try {
      const { images, character_name } = req.body;
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: 'images (array of base64) is required' });
      }
      if (!character_name) {
        return res.status(400).json({ error: 'character_name is required' });
      }
      const result = await buildCharacterBible(images, character_name);
      res.json(result);
    } catch (err) {
      console.error('[agents/build-character-bible] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/agents/projects — list all available projects
   */
  router.get('/api/agents/projects', (req, res) => {
    res.json({ projects: listProjects() });
  });

  /**
   * GET /api/agents/projects/:id — project info + scene list
   */
  router.get('/api/agents/projects/:id', (req, res) => {
    try {
      const ctx = loadProject(req.params.id);
      res.json({
        project: ctx.project,
        style_profile: { id: ctx.styleProfile.id, name: ctx.styleProfile.name },
        scenes: ctx.scenes.map(s => ({ id: s.id, number: s.number, name: s.name })),
      });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  /**
   * GET /api/agents/projects/:id/scenes — all scenes with full details
   */
  router.get('/api/agents/projects/:id/scenes', (req, res) => {
    try {
      const ctx = loadProject(req.params.id);
      res.json({ project_id: req.params.id, scenes: ctx.scenes });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/generate-scene
   * Body: { project_id, scene_id, overrides?, model_preference? }
   */
  router.post('/api/agents/generate-scene', async (req, res) => {
    try {
      const { project_id, scene_id, overrides, model_preference } = req.body;
      if (!scene_id) {
        return res.status(400).json({ error: 'scene_id is required' });
      }
      const result = await generateScene({
        projectId: project_id || 'tcpw-dark-knight',
        sceneId: scene_id,
        overrides,
        modelPreference: model_preference,
      });
      res.json(result);
    } catch (err) {
      console.error('[agents/generate-scene] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/improve-image
   * Body: { image (base64), shot_context, project_id?, max_iterations? }
   * One-button "make this better"
   */
  router.post('/api/agents/improve-image', async (req, res) => {
    try {
      const { image, shot_context, project_id, max_iterations } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'image (base64) is required' });
      }
      const result = await improveImage({
        imageBase64: image,
        shotContext: shot_context || '',
        projectId: project_id,
        maxIterations: max_iterations || 3,
      });
      res.json(result);
    } catch (err) {
      console.error('[agents/improve-image] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/generate-and-iterate
   * Body: { description, model_preference?, project_id?, scene_id?, max_iterations? }
   * DEPRECATED: Full pipeline: generate + QG loop (kept for backward compatibility)
   */
  router.post('/api/agents/generate-and-iterate', async (req, res) => {
    try {
      const { description, model_preference, project_id, scene_id, max_iterations } = req.body;
      if (!description && !scene_id) {
        return res.status(400).json({ error: 'description or scene_id is required' });
      }
      const result = await generateAndIterate({
        description,
        modelPreference: model_preference,
        projectId: project_id,
        sceneId: scene_id,
        maxIterations: max_iterations || 3,
      });
      res.json(result);
    } catch (err) {
      console.error('[agents/generate-and-iterate] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ========================================
  // NEW USER-IN-THE-LOOP WORKFLOW ENDPOINTS
  // ========================================

  /**
   * POST /api/agents/analyze
   * Body: { image (base64), shot_context, project_id? }
   * Returns audit + recommendations (no execution)
   */
  router.post('/api/agents/analyze', upload.single('image'), async (req, res) => {
    try {
      let imageBase64;
      
      if (req.file) {
        // File upload via FormData
        const buffer = fs.readFileSync(req.file.path);
        imageBase64 = buffer.toString('base64');
        // Clean up temp file
        try { fs.unlinkSync(req.file.path); } catch {}
      } else if (req.body?.image) {
        // Base64 in JSON body
        imageBase64 = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      } else {
        return res.status(400).json({ error: 'image is required (file upload or base64)' });
      }
      
      const shot_context = req.body?.shot_context || '';
      const project_id = req.body?.project_id;
      
      const result = await analyzeAndRecommend(imageBase64, shot_context, project_id);
      res.json(result);
    } catch (err) {
      console.error('[agents/analyze] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/execute-improvement
   * Body: { image (base64), model_id, instruction?, shot_context, project_id? }
   * Executes one improvement step, returns result + new audit
   */
  router.post('/api/agents/execute-improvement', async (req, res) => {
    try {
      const { image, model_id, instruction, shot_context, project_id } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'image (base64) is required' });
      }
      if (!model_id) {
        return res.status(400).json({ error: 'model_id is required' });
      }
      const result = await executeImprovement(
        image, 
        model_id, 
        instruction, 
        shot_context || '', 
        project_id
      );
      res.json(result);
    } catch (err) {
      console.error('[agents/execute-improvement] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/generate-with-audit
   * Body: { description, model_preference?, project_id?, scene_id? }
   * Generates one image, audits it, returns result + recommendation
   */
  router.post('/api/agents/generate-with-audit', async (req, res) => {
    try {
      const { description, model_preference, project_id, scene_id } = req.body;
      if (!description && !scene_id) {
        return res.status(400).json({ error: 'description or scene_id is required' });
      }
      const result = await generateWithAudit({
        description,
        modelPreference: model_preference,
        projectId: project_id,
        sceneId: scene_id,
      });
      res.json(result);
    } catch (err) {
      console.error('[agents/generate-with-audit] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/import-image
   * Body: { image (base64), source_model?, source_prompt?, shot_context?, project_id? }
   * Saves the image, logs metadata (model, prompt), runs QG audit, returns audit + recommendations
   */
  router.post('/api/agents/import-image', async (req, res) => {
    try {
      const { image, source_model, source_prompt, shot_context, project_id } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'image (base64) is required' });
      }
      const result = await importImage({
        imageBase64: image,
        sourceModel: source_model,
        sourcePrompt: source_prompt,
        shotContext: shot_context,
        projectId: project_id,
      });
      res.json(result);
    } catch (err) {
      console.error('[agents/import-image] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/generate-prompt
   * Body: { model_id, shot_context, analysis (the current GradeCard analysis), strategy }
   * Returns: { prompt, notes }
   */
  router.post('/api/agents/generate-prompt', async (req, res) => {
    try {
      const { model_id, shot_context, analysis, strategy } = req.body;
      if (!model_id) {
        return res.status(400).json({ error: 'model_id is required' });
      }
      if (!analysis) {
        return res.status(400).json({ error: 'analysis is required' });
      }
      
      // Get model info from registry
      const registry = getModelRegistry();
      const modelInfo = registry[model_id];
      if (!modelInfo) {
        return res.status(400).json({ error: `Unknown model: ${model_id}` });
      }
      
      // Route to appropriate specialist based on modelId
      let prompt = '';
      let notes = '';
      
      if (modelInfo.specialistModule) {
        try {
          // Get the specialist and generate prompt
          const mod = await import(`../services/agents/specialists/${modelInfo.specialistModule}.js`);
          const specialist = mod.generatePrompt;
          
          // Create a brief from the shot context and analysis
          const brief = shot_context || 'Improve image quality';
          const styleProfile = null; // Could load from project if needed
          const projectContext = null; // Could load from project if needed
          
          const specialistResult = await specialist(brief, styleProfile, projectContext);
          prompt = specialistResult.final_prompt || specialistResult.prompt || brief;
          
          // Generate notes about the model and strategy
          notes = `Generated for ${modelInfo.name} using ${modelInfo.specialistModule} specialist. `;
          if (strategy) {
            notes += `Strategy: ${strategy}. `;
          }
          if (modelInfo.strengths) {
            notes += `Model strengths: ${modelInfo.strengths.join(', ')}.`;
          }
          
        } catch (specialistError) {
          console.warn(`[agents/generate-prompt] Specialist error for ${model_id}:`, specialistError.message);
          // Fallback to basic prompt
          prompt = shot_context || 'Improve image quality and composition';
          notes = `Fallback prompt generated (specialist ${modelInfo.specialistModule} failed). Model: ${modelInfo.name}.`;
        }
      } else {
        // No specialist module - generate basic prompt
        prompt = shot_context || 'Improve image quality and composition';
        notes = `Basic prompt generated for ${modelInfo.name}. No specialist module available.`;
      }
      
      res.json({ prompt, notes });
    } catch (err) {
      console.error('[agents/generate-prompt] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ========================================
  // SCENE WORKSHOP: SUGGESTIONS + GAP ANALYSIS
  // ========================================

  /**
   * POST /api/agents/suggest-placements
   * Body: { scene_id, project_id? }
   * CD analyzes staged images against planned shots, returns placement suggestions
   */
  router.post('/api/agents/suggest-placements', async (req, res) => {
    try {
      const { scene_id, project_id } = req.body;
      if (!scene_id) return res.status(400).json({ error: 'scene_id is required' });

      const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(scene_id);
      if (!scene) return res.status(404).json({ error: 'Scene not found' });

      // Get planned shots for this scene
      const shots = db.prepare('SELECT * FROM shots WHERE scene_id = ? ORDER BY order_index ASC').all(scene_id);
      if (!shots.length) return res.json({ suggestions: [], message: 'No planned shots to match against' });

      // Get staged images (assigned to scene but not linked to shots)
      const linkedUrls = db.prepare(`
        SELECT DISTINCT iv.image_url FROM image_variants iv
        JOIN shots s ON iv.shot_id = s.id WHERE s.scene_id = ?
      `).all(scene_id).map(r => r.image_url);

      const allSceneImages = db.prepare('SELECT * FROM project_images WHERE scene_id = ?').all(scene_id);
      const stagedImages = allSceneImages.filter(img => !linkedUrls.includes(img.image_url));

      if (!stagedImages.length) return res.json({ suggestions: [], message: 'No staged images to place' });

      // Build scene context
      const sceneContext = [
        `Scene: ${scene.name}`,
        scene.description ? `Description: ${scene.description}` : '',
        scene.location_setting ? `Location: ${scene.location_setting}` : '',
        scene.time_of_day ? `Time: ${scene.time_of_day}` : '',
        scene.mood_tone ? `Mood: ${scene.mood_tone}` : '',
      ].filter(Boolean).join('\n');

      const suggestions = await suggestPlacements(shots, stagedImages, sceneContext);
      res.json({ suggestions, staged_count: stagedImages.length, shot_count: shots.length });
    } catch (err) {
      console.error('[agents/suggest-placements] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/gap-analysis
   * Body: { scene_id, project_id? }
   * CD compares planned vs filled shots, identifies gaps, suggests generation plan
   */
  router.post('/api/agents/gap-analysis', async (req, res) => {
    try {
      const { scene_id, project_id } = req.body;
      if (!scene_id) return res.status(400).json({ error: 'scene_id is required' });

      const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(scene_id);
      if (!scene) return res.status(404).json({ error: 'Scene not found' });

      const shots = db.prepare('SELECT * FROM shots WHERE scene_id = ? ORDER BY order_index ASC').all(scene_id);
      if (!shots.length) return res.json({ error: 'No shots planned for this scene. Use "Design Shots" first.' });

      // Build shot → images map
      const shotImages = {};
      for (const shot of shots) {
        shotImages[shot.id] = db.prepare('SELECT * FROM image_variants WHERE shot_id = ?').all(shot.id);
      }

      const sceneContext = [
        `Scene: ${scene.name}`,
        scene.description ? `Description: ${scene.description}` : '',
        scene.location_setting ? `Location: ${scene.location_setting}` : '',
        scene.time_of_day ? `Time: ${scene.time_of_day}` : '',
        scene.mood_tone ? `Mood: ${scene.mood_tone}` : '',
      ].filter(Boolean).join('\n');

      const analysis = await analyzeGaps(shots, shotImages, sceneContext);
      res.json(analysis);
    } catch (err) {
      console.error('[agents/gap-analysis] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/agents/cohesion-check
   * Body: { scene_id, project_id? }
   * CD evaluates filled shots as a sequence for visual continuity
   */
  router.post('/api/agents/cohesion-check', async (req, res) => {
    try {
      const { scene_id, project_id } = req.body;
      if (!scene_id) return res.status(400).json({ error: 'scene_id is required' });

      const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(scene_id);
      if (!scene) return res.status(404).json({ error: 'Scene not found' });

      const shots = db.prepare('SELECT * FROM shots WHERE scene_id = ? ORDER BY order_index ASC').all(scene_id);
      if (!shots.length) return res.json({ cohesion_score: 0, issues: [], summary: 'No shots in this scene.', recommendations: [] });

      const shotImages = {};
      for (const shot of shots) {
        shotImages[shot.id] = db.prepare('SELECT * FROM image_variants WHERE shot_id = ?').all(shot.id);
      }

      const sceneContext = [
        `Scene: ${scene.name}`,
        scene.description ? `Description: ${scene.description}` : '',
        scene.location_setting ? `Location: ${scene.location_setting}` : '',
        scene.time_of_day ? `Time: ${scene.time_of_day}` : '',
        scene.mood_tone ? `Mood: ${scene.mood_tone}` : '',
      ].filter(Boolean).join('\n');

      const result = await checkCohesion(shots, shotImages, sceneContext);
      res.json(result);
    } catch (err) {
      console.error('[agents/cohesion-check] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
