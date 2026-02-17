import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function createGenerationRoutes({ db, sanitize, analyzeEntityImage, loadKBForModel, readKBFile }) {
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

        // Auto-sync: keep the entity record's reference_image_url in sync with
        // the reference image stored here (handles pre-existing uploads)
        const table = entityType === 'character' ? 'characters' : entityType === 'object' ? 'objects' : null;
        if (table) {
            const refImage = rows.find(r => r.image_type === 'reference');
            const refUrl = refImage ? refImage.image_url : null;
            try {
                db.prepare(`UPDATE ${table} SET reference_image_url = ? WHERE id = ?`).run(refUrl, entityId);
            } catch (e) { /* non-critical */ }
        }

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
                'UPDATE entity_reference_images SET image_url = ?, label = ?, prompt = ?, analysis_json = NULL WHERE id = ?'
            ).run(image_url, label || null, prompt || null, existing.id);
            res.json({ id: existing.id, updated: true });
        } else {
            const info = db.prepare(
                'INSERT INTO entity_reference_images (entity_type, entity_id, image_type, image_url, label, prompt) VALUES (?, ?, ?, ?, ?, ?)'
            ).run(entity_type, entity_id, image_type, image_url, label || null, prompt || null);
            res.json({ id: info.lastInsertRowid });
        }

        // Auto-sync: when uploading a 'reference' image, also set it on the entity record
        // so it shows on the character/object card in the grid
        if (image_type === 'reference') {
            const table = entity_type === 'character' ? 'characters' : entity_type === 'object' ? 'objects' : null;
            if (table) {
                try {
                    db.prepare(`UPDATE ${table} SET reference_image_url = ? WHERE id = ?`).run(image_url, entity_id);
                } catch (e) { /* non-critical */ }
            }
        }
    });

    // ── Analyze an uploaded entity image against its prompt ────────
    router.post('/api/entity-images/:id/analyze', async (req, res) => {
        try {
            const { id } = req.params;
            const entityImg = db.prepare('SELECT * FROM entity_reference_images WHERE id = ?').get(id);
            if (!entityImg) return res.status(404).json({ error: 'Entity image not found' });
            if (!entityImg.image_url) return res.status(400).json({ error: 'No image uploaded' });
            if (!entityImg.prompt) return res.status(400).json({ error: 'No prompt associated with this image — analysis needs the original prompt to compare against' });

            // Resolve image path on disk
            const imagePath = entityImg.image_url.startsWith('/')
                ? path.join(__dirname, '../..', entityImg.image_url)
                : entityImg.image_url;

            if (!fs.existsSync(imagePath)) {
                return res.status(404).json({ error: 'Image file not found on disk' });
            }

            const imageBuffer = fs.readFileSync(imagePath);

            // Detect mime type
            let mimeType = 'image/jpeg';
            const ext = path.extname(imagePath).toLowerCase();
            if (ext) {
                const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
                mimeType = mimeMap[ext] || 'image/jpeg';
            } else {
                if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) mimeType = 'image/png';
                else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) mimeType = 'image/gif';
                else if (imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49) mimeType = 'image/webp';
            }

            // Look up entity details for context
            let entityName = entityImg.label || '';
            let entityDescription = '';
            let project = null;

            if (entityImg.entity_type === 'character') {
                const char = db.prepare('SELECT * FROM characters WHERE id = ?').get(entityImg.entity_id);
                if (char) {
                    entityName = char.name || entityName;
                    entityDescription = char.description || '';
                    project = db.prepare('SELECT * FROM projects WHERE id = ?').get(char.project_id);
                }
            } else if (entityImg.entity_type === 'object') {
                const obj = db.prepare('SELECT * FROM objects WHERE id = ?').get(entityImg.entity_id);
                if (obj) {
                    entityName = obj.name || entityName;
                    entityDescription = obj.description || '';
                    project = db.prepare('SELECT * FROM projects WHERE id = ?').get(obj.project_id);
                }
            }

            // Load KB for quality evaluation
            let kbContent = '';
            try {
                const qualityKB = readKBFile('03_Pack_Image_Quality_Control.md');
                const coreKB = readKBFile('01_Core_Realism_Principles.md');
                kbContent = [qualityKB, coreKB].filter(Boolean).join('\n\n');
            } catch (err) {
                console.warn('[entity-analyze] Could not load KB:', err.message);
            }

            // For turnaround sheets, load the reference image for comparison
            let referenceImageBuffer = null;
            let referenceImageMimeType = null;
            if (entityImg.image_type === 'turnaround') {
                const refImg = db.prepare(
                    'SELECT image_url FROM entity_reference_images WHERE entity_type = ? AND entity_id = ? AND image_type = ?'
                ).get(entityImg.entity_type, entityImg.entity_id, 'reference');
                if (refImg && refImg.image_url) {
                    try {
                        const refPath = refImg.image_url.startsWith('/')
                            ? path.join(__dirname, '../..', refImg.image_url)
                            : refImg.image_url;
                        if (fs.existsSync(refPath)) {
                            referenceImageBuffer = fs.readFileSync(refPath);
                            const refExt = path.extname(refPath).toLowerCase();
                            const refMimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
                            referenceImageMimeType = refMimeMap[refExt] || 'image/jpeg';
                        }
                    } catch (e) {
                        console.warn('[entity-analyze] Could not load reference image for comparison:', e.message);
                    }
                }
            }

            const analysis = await analyzeEntityImage({
                imageBuffer,
                mimeType,
                originalPrompt: entityImg.prompt,
                entityType: entityImg.entity_type,
                entityName,
                entityDescription,
                project,
                kbContent,
                referenceImageBuffer,
                referenceImageMimeType,
                isTurnaround: entityImg.image_type === 'turnaround',
            });

            // Store analysis results on the entity image record
            db.prepare('UPDATE entity_reference_images SET analysis_json = ? WHERE id = ?')
                .run(JSON.stringify(analysis), id);

            res.json(analysis);
        } catch (error) {
            console.error('Entity image analysis error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Get stored analysis results for an entity image
    router.get('/api/entity-images/:id/analysis', (req, res) => {
        try {
            const { id } = req.params;
            const row = db.prepare('SELECT analysis_json FROM entity_reference_images WHERE id = ?').get(id);
            if (!row) return res.status(404).json({ error: 'Entity image not found' });
            if (!row.analysis_json) return res.json({ analyzed: false });
            res.json({ analyzed: true, ...JSON.parse(row.analysis_json) });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Delete a specific entity image
    router.delete('/api/entity-images/:id', (req, res) => {
        // Look up the image before deleting so we can clear the entity's reference_image_url if needed
        const img = db.prepare('SELECT entity_type, entity_id, image_type FROM entity_reference_images WHERE id = ?').get(req.params.id);
        db.prepare('DELETE FROM entity_reference_images WHERE id = ?').run(req.params.id);
        // If this was the reference image, clear it from the entity record
        if (img && img.image_type === 'reference') {
            const table = img.entity_type === 'character' ? 'characters' : img.entity_type === 'object' ? 'objects' : null;
            if (table) {
                try {
                    db.prepare(`UPDATE ${table} SET reference_image_url = NULL WHERE id = ?`).run(img.entity_id);
                } catch (e) { /* non-critical */ }
            }
        }
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
