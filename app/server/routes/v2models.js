/**
 * Models Route — GET /api/v2/models
 * Returns model registry with rich profiles for frontend
 */
import { Router } from 'express';
import { getAllModels, getActiveModels, getImageModels, getVideoModels, getUtilityModels } from '../services/modelRegistry.js';

const router = Router();

router.get('/api/v2/models', (req, res) => {
  const { active, type } = req.query;
  
  let models;
  if (type === 'image') models = getImageModels();
  else if (type === 'video') models = getVideoModels();
  else if (type === 'utility') models = getUtilityModels();
  else if (active === 'true') models = getActiveModels();
  else models = getAllModels();

  // Map to frontend-friendly shape with full profiles
  const result = models.map(m => ({
    id: m.id,
    name: m.name,
    type: m.type,
    provider: m.provider,
    capabilities: m.capabilities || [],
    strengths: m.strengths || [],
    weaknesses: m.weaknesses || [],
    bestFor: m.bestFor || [],
    worstFor: m.worstFor || [],
    active: m.active,
    description: m.description || '',
    hasEdit: !!(m.editEndpoint || m.img2imgEndpoint),
    hasVariants: !!(m.variants && Object.keys(m.variants).length > 0),
    variants: m.variants ? Object.entries(m.variants).map(([k, v]) => ({ id: k, ...v })) : [],
  }));

  res.json(result);
});

// GET /api/v2/models/:id — Single model detail
router.get('/api/v2/models/:id', (req, res) => {
  const models = getAllModels();
  const model = models.find(m => m.id === req.params.id);
  if (!model) return res.status(404).json({ error: `Model not found: ${req.params.id}` });
  
  res.json({
    ...model,
    hasEdit: !!(model.editEndpoint || model.img2imgEndpoint),
    variants: model.variants ? Object.entries(model.variants).map(([k, v]) => ({ id: k, ...v })) : [],
  });
});

export default router;
