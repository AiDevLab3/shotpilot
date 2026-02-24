import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract a 0-100 score from analysis JSON, normalizing 0-10 scales
function extractScoreFromAnalysis(analysisJson) {
    try {
        const parsed = JSON.parse(analysisJson);
        // Check for already-normalized scores first
        if (parsed.overall_score && parsed.overall_score > 10) return parsed.overall_score;
        // These are 0-10 scale — normalize to 0-100
        const rawScore = parsed.overall_score || parsed.pipeline_score || parsed.realism_score || null;
        if (rawScore !== null && rawScore <= 10) return Math.round(rawScore * 10);
        return rawScore;
    } catch { return null; }
}

export default function createImageRoutes({
    db, requireAuth, checkCredits, upload,
    holisticImageAudit, loadKBForModel, loadKBForModelViaRAG, readKBFile,
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
            // Clear stale audit data when image is replaced, reset status to unaudited
            db.prepare(`
                UPDATE image_variants
                SET image_url = ?, audit_score = NULL, audit_recommendation = NULL, audit_data = NULL, status = 'unaudited'
                WHERE id = ?
            `).run(relativePath, variantId);

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
                        const auditContext = `image audit ${shot?.description || ''} ${variant.generated_prompt || ''}`.trim();
                        modelKB = loadKBForModelViaRAG(variant.model_used, auditContext);
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

            // Map audit recommendation to variant status
            const statusMap = {
                'LOCK IT IN': 'locked-in',
                'REFINE': 'needs-refinement',
                'REGENERATE': 'needs-refinement',
            };
            const newStatus = statusMap[auditResult.recommendation] || 'needs-refinement';

            db.prepare(`
                UPDATE image_variants
                SET audit_score = ?, audit_recommendation = ?, audit_data = ?, status = ?
                WHERE id = ?
            `).run(
                auditResult.overall_score,
                auditResult.recommendation,
                JSON.stringify(auditResult),
                newStatus,
                variantId
            );

            deductCredit(db, req.session.userId, 'image_audit', variant.shot_id);
            logAIFeatureUsage(db, req.session.userId, 'holistic_image_audit', variant.shot_id);

            // 3-strike model pivot: check how many low-scoring audits this model has on this shot
            let modelPivotSuggestion = null;
            if (auditResult.recommendation !== 'LOCK IT IN') {
                const lowScoreCount = db.prepare(`
                    SELECT COUNT(*) as count FROM image_variants
                    WHERE shot_id = ? AND model_used = ? AND audit_score IS NOT NULL AND audit_score < 70
                `).get(variant.shot_id, variant.model_used);

                if (lowScoreCount && lowScoreCount.count >= 3) {
                    modelPivotSuggestion = {
                        message: `${variant.model_used} has scored below 70 on ${lowScoreCount.count} attempts for this shot. Consider trying a different model.`,
                        currentModel: variant.model_used,
                        attempts: lowScoreCount.count,
                    };
                }
            }

            res.json({ ...auditResult, model_pivot_suggestion: modelPivotSuggestion });
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

    // Lock in a variant (user approves it as final)
    router.post('/api/variants/:variantId/lock', requireAuth, (req, res) => {
        try {
            const { variantId } = req.params;
            const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
            if (!variant) return res.status(404).json({ error: 'Variant not found' });

            db.prepare('UPDATE image_variants SET status = ? WHERE id = ?').run('locked-in', variantId);

            const updated = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Unlock a variant (user wants to continue iterating)
    router.post('/api/variants/:variantId/unlock', requireAuth, (req, res) => {
        try {
            const { variantId } = req.params;
            const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
            if (!variant) return res.status(404).json({ error: 'Variant not found' });

            const newStatus = variant.audit_data ? 'needs-refinement' : 'unaudited';
            db.prepare('UPDATE image_variants SET status = ? WHERE id = ?').run(newStatus, variantId);

            const updated = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
            res.json(updated);
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
        const sanitize = (val) => val === undefined ? null : val;

        // Explicitly passed audit_score takes priority (e.g. CD suggestion confidence)
        let auditData = sanitize(data.audit_data) || null;
        let auditScore = sanitize(data.audit_score) || null;
        let assetId = sanitize(data.asset_id) || null;
        const hasExplicitScore = auditScore !== null;
        
        // Auto-link to project_image and pull analysis data
        if (assetId && !auditData) {
            const asset = db.prepare('SELECT analysis_json FROM project_images WHERE id = ?').get(assetId);
            if (asset?.analysis_json) {
                auditData = asset.analysis_json;
                if (!hasExplicitScore) {
                    auditScore = extractScoreFromAnalysis(asset.analysis_json);
                }
            }
        } else if (!assetId && data.image_url) {
            const asset = db.prepare('SELECT id, analysis_json FROM project_images WHERE image_url = ?').get(data.image_url);
            if (asset) {
                assetId = asset.id;
                if (asset.analysis_json && !auditData) {
                    auditData = asset.analysis_json;
                    if (!hasExplicitScore) {
                        auditScore = extractScoreFromAnalysis(asset.analysis_json);
                    }
                }
            }
        }

        const stmt = db.prepare(`
            INSERT INTO image_variants (shot_id, image_url, prompt_used, status, asset_id, audit_data, audit_score)
            VALUES (@shotId, @image_url, @prompt_used, @status, @assetId, @auditData, @auditScore)
        `);
        const info = stmt.run({
            shotId: id,
            image_url: sanitize(data.image_url),
            prompt_used: sanitize(data.prompt_used),
            status: 'generated',
            assetId,
            auditData,
            auditScore,
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
