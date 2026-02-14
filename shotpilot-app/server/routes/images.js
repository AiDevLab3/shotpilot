import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function createImageRoutes({
    db, requireAuth, checkCredits, upload,
    holisticImageAudit, loadKBForModel, readKBFile,
    deductCredit, logAIFeatureUsage,
}) {
    const router = Router();

    // Upload Endpoint
    router.post('/api/upload', upload.single('image'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const relativePath = `/uploads/images/${req.file.filename}`;
        res.json({ url: relativePath });
    });

    // Upload image to an existing variant
    router.post('/api/variants/:variantId/upload-image', requireAuth, upload.single('image'), async (req, res) => {
        try {
            const { variantId } = req.params;
            const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
            if (!variant) return res.status(404).json({ error: 'Variant not found' });

            if (!req.file) return res.status(400).json({ error: 'No image file provided' });

            const relativePath = `/uploads/images/${req.file.filename}`;
            db.prepare('UPDATE image_variants SET image_url = ? WHERE id = ?').run(relativePath, variantId);

            res.json({ image_url: relativePath, variant_id: variantId });
        } catch (error) {
            console.error('Variant image upload error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Run holistic image audit on a variant (costs 1 credit)
    router.post('/api/variants/:variantId/audit', requireAuth, checkCredits(db), async (req, res) => {
        try {
            const { variantId } = req.params;
            const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
            if (!variant) return res.status(404).json({ error: 'Variant not found' });
            if (!variant.image_url) return res.status(400).json({ error: 'No image uploaded for this variant. Upload an image first.' });

            const imagePath = variant.image_url.startsWith('/')
                ? path.join(__dirname, '../..', variant.image_url)
                : variant.image_url;

            if (!fs.existsSync(imagePath)) {
                return res.status(404).json({ error: 'Image file not found on disk' });
            }

            const imageBuffer = fs.readFileSync(imagePath);

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

            const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(variant.shot_id);
            const scene = shot ? db.prepare('SELECT * FROM scenes WHERE id = ?').get(shot.scene_id) : null;
            const project = scene ? db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id) : null;
            const characters = project ? db.prepare('SELECT * FROM characters WHERE project_id = ?').all(project.id) : [];
            const objects = project ? db.prepare('SELECT * FROM objects WHERE project_id = ?').all(project.id) : [];

            let kbContent = '';
            try {
                const qualityKB = readKBFile('03_Pack_Image_Quality_Control.md');
                const coreKB = readKBFile('01_Core_Realism_Principles.md');
                let modelKB = null;
                if (variant.model_used) {
                    try {
                        modelKB = loadKBForModel(variant.model_used);
                    } catch (e) {
                        console.warn(`[audit] Could not load model KB for ${variant.model_used}:`, e.message);
                    }
                }
                kbContent = [qualityKB, coreKB, modelKB].filter(Boolean).join('\n\n');
            } catch (err) {
                console.warn('[audit] Could not load KB:', err.message);
            }

            const auditResult = await holisticImageAudit({
                imageBuffer,
                mimeType,
                project,
                scene,
                shot,
                characters,
                objects,
                kbContent,
            });

            db.prepare(`
                UPDATE image_variants
                SET audit_score = ?, audit_recommendation = ?, audit_data = ?
                WHERE id = ?
            `).run(
                auditResult.overall_score,
                auditResult.recommendation,
                JSON.stringify(auditResult),
                variantId
            );

            deductCredit(db, req.session.userId, 'image_audit', variant.shot_id);
            logAIFeatureUsage(db, req.session.userId, 'holistic_image_audit', variant.shot_id);

            res.json(auditResult);
        } catch (error) {
            console.error('Holistic image audit error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Get stored audit results
    router.get('/api/variants/:variantId/audit', requireAuth, (req, res) => {
        try {
            const { variantId } = req.params;
            const variant = db.prepare('SELECT audit_score, audit_recommendation, audit_data FROM image_variants WHERE id = ?').get(variantId);
            if (!variant) return res.status(404).json({ error: 'Variant not found' });

            if (!variant.audit_data) {
                return res.json({ audited: false });
            }

            const auditResult = JSON.parse(variant.audit_data);
            res.json({ audited: true, ...auditResult });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Audit a standalone image (costs 1 credit)
    router.post('/api/audit-image', requireAuth, checkCredits(db), upload.single('image'), async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ error: 'No image file provided' });

            const { projectId } = req.body;

            const imagePath = req.file.path;
            const imageBuffer = fs.readFileSync(imagePath);

            let mimeType = 'image/jpeg';
            if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) mimeType = 'image/png';
            else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) mimeType = 'image/gif';
            else if (imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49) mimeType = 'image/webp';

            let project = null, characters = [], objects = [];
            if (projectId) {
                project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
                if (project) {
                    characters = db.prepare('SELECT * FROM characters WHERE project_id = ?').all(projectId);
                    objects = db.prepare('SELECT * FROM objects WHERE project_id = ?').all(projectId);
                }
            }

            let kbContent = '';
            try {
                const qualityKB = readKBFile('03_Pack_Image_Quality_Control.md');
                const coreKB = readKBFile('01_Core_Realism_Principles.md');
                kbContent = [qualityKB, coreKB].filter(Boolean).join('\n\n');
            } catch (err) {
                console.warn('[audit-image] Could not load KB:', err.message);
            }

            const auditResult = await holisticImageAudit({
                imageBuffer,
                mimeType,
                project,
                scene: null,
                shot: null,
                characters,
                objects,
                kbContent,
            });

            deductCredit(db, req.session.userId, 'image_audit');
            logAIFeatureUsage(db, req.session.userId, 'holistic_image_audit_standalone');

            res.json(auditResult);
        } catch (error) {
            console.error('Standalone image audit error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Image Variants (basic CRUD)
    router.get('/api/shots/:id/images', (req, res) => {
        const { id } = req.params;
        const stmt = db.prepare('SELECT * FROM image_variants WHERE shot_id = ? ORDER BY created_at DESC');
        const images = stmt.all(id);
        res.json(images);
    });

    router.post('/api/shots/:id/images', (req, res) => {
        const { id } = req.params;
        const data = req.body;
        const stmt = db.prepare(`
            INSERT INTO image_variants (shot_id, image_url, prompt_used, status)
            VALUES (@shotId, @image_url, @prompt_used, @status)
        `);
        const sanitize = (val) => val === undefined ? null : val;
        const info = stmt.run({
            shotId: id,
            image_url: sanitize(data.image_url),
            prompt_used: sanitize(data.prompt_used),
            status: 'generated'
        });
        res.json({ id: info.lastInsertRowid });
    });

    router.delete('/api/images/:id', (req, res) => {
        const { id } = req.params;
        db.prepare('DELETE FROM image_variants WHERE id = ?').run(id);
        res.json({ success: true });
    });

    return router;
}
