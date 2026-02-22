/**
 * Models Route — GET /api/v2/models
 * Returns model registry for frontend
 */
import { Router } from 'express';
import { getAllModels, getActiveModels } from '../services/modelRegistry.js';

const router = Router();

router.get('/api/v2/models', (req, res) => {
  const activeOnly = req.query.active === 'true';
  const models = activeOnly ? getActiveModels() : getAllModels();
  
  // Map to frontend-friendly shape
  const result = models.map(m => ({
    id: m.id,
    name: m.name,
    type: m.type,
    provider: m.provider,
    capabilities: m.capabilities,
    strengths: m.strengths,
    active: m.active,
    description: m.description || '',
  }));

  res.json(result);
});

export default router;
