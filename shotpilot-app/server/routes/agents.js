import express from 'express';
import { generateShot, generateScene, auditGeneratedImage, screenReferenceImage, improveImage, generateAndIterate, analyzeAndRecommend, executeImprovement, generateWithAudit, importImage } from '../services/agents/orchestrator.js';
import { getModelRegistry } from '../services/agents/creativeDirector.js';
import { listStyleProfiles } from '../services/agents/styleProfile.js';
import { loadProject, listProjects } from '../services/agents/projectContext.js';
import { checkContinuity, buildCharacterBible } from '../services/agents/continuityTracker.js';

export default function createAgentRoutes() {
  const router = express.Router();

  /**
   * GET /api/agents/models — list available models with capabilities
   */
  router.get('/api/agents/models', (req, res) => {
    const registry = getModelRegistry();
    const models = Object.entries(registry).map(([id, m]) => ({
      id,
      name: m.name,
      description: m.description,
      strengths: m.strengths,
      weaknesses: m.weaknesses,
      hasAPI: m.hasAPI,
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
  router.post('/api/agents/analyze', async (req, res) => {
    try {
      const { image, shot_context, project_id } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'image (base64) is required' });
      }
      const result = await analyzeAndRecommend(image, shot_context || '', project_id);
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

  return router;
}
