import { Router } from 'express';

export default function createGenerationRoutes({ db, sanitize }) {
    const router = Router();

    // ── AI Generation History ──────────────────────────────────────

    // List generations for an entity (most recent first)
    router.get('/api/generations/:entityType/:entityId', (req, res) => {
        const { entityType, entityId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const rows = db.prepare(
            'SELECT * FROM ai_generations WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC LIMIT ?'
        ).all(entityType, entityId, limit);
        res.json(rows);
    });

    // Get latest generation for an entity
    router.get('/api/generations/:entityType/:entityId/latest', (req, res) => {
        const { entityType, entityId } = req.params;
        const row = db.prepare(
            'SELECT * FROM ai_generations WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC LIMIT 1'
        ).get(entityType, entityId);
        res.json(row || null);
    });

    // Save a generation
    router.post('/api/generations', (req, res) => {
        const { entity_type, entity_id, model, suggestions } = req.body;
        if (!entity_type || !entity_id || !suggestions) {
            return res.status(400).json({ error: 'entity_type, entity_id, and suggestions are required' });
        }
        const stmt = db.prepare(
            'INSERT INTO ai_generations (entity_type, entity_id, model, suggestions_json) VALUES (?, ?, ?, ?)'
        );
        const info = stmt.run(entity_type, entity_id, model || null, JSON.stringify(suggestions));
        res.json({ id: info.lastInsertRowid });
    });

    // Delete a generation
    router.delete('/api/generations/:id', (req, res) => {
        db.prepare('DELETE FROM ai_generations WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    // Delete all generations for an entity
    router.delete('/api/generations/:entityType/:entityId', (req, res) => {
        const { entityType, entityId } = req.params;
        db.prepare('DELETE FROM ai_generations WHERE entity_type = ? AND entity_id = ?').run(entityType, entityId);
        res.json({ success: true });
    });

    // ── Entity Reference Images ────────────────────────────────────

    // List images for an entity
    router.get('/api/entity-images/:entityType/:entityId', (req, res) => {
        const { entityType, entityId } = req.params;
        const rows = db.prepare(
            'SELECT * FROM entity_reference_images WHERE entity_type = ? AND entity_id = ? ORDER BY created_at ASC'
        ).all(entityType, entityId);
        res.json(rows);
    });

    // Upload/create an entity image
    router.post('/api/entity-images', (req, res) => {
        const { entity_type, entity_id, image_type, image_url, label, prompt } = req.body;
        if (!entity_type || !entity_id || !image_type || !image_url) {
            return res.status(400).json({ error: 'entity_type, entity_id, image_type, and image_url are required' });
        }
        // Upsert: replace existing image of same type for this entity
        const existing = db.prepare(
            'SELECT id FROM entity_reference_images WHERE entity_type = ? AND entity_id = ? AND image_type = ?'
        ).get(entity_type, entity_id, image_type);

        if (existing) {
            db.prepare(
                'UPDATE entity_reference_images SET image_url = ?, label = ?, prompt = ? WHERE id = ?'
            ).run(image_url, label || null, prompt || null, existing.id);
            res.json({ id: existing.id, updated: true });
        } else {
            const info = db.prepare(
                'INSERT INTO entity_reference_images (entity_type, entity_id, image_type, image_url, label, prompt) VALUES (?, ?, ?, ?, ?, ?)'
            ).run(entity_type, entity_id, image_type, image_url, label || null, prompt || null);
            res.json({ id: info.lastInsertRowid });
        }
    });

    // Delete a specific entity image
    router.delete('/api/entity-images/:id', (req, res) => {
        db.prepare('DELETE FROM entity_reference_images WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    // Delete all images for an entity
    router.delete('/api/entity-images/:entityType/:entityId', (req, res) => {
        const { entityType, entityId } = req.params;
        db.prepare('DELETE FROM entity_reference_images WHERE entity_type = ? AND entity_id = ?').run(entityType, entityId);
        res.json({ success: true });
    });

    return router;
}
