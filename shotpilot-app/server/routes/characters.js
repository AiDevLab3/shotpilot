import { Router } from 'express';

export default function createCharacterRoutes({ db, sanitize }) {
    const router = Router();

    router.get('/api/projects/:id/characters', (req, res) => {
        const { id } = req.params;
        const stmt = db.prepare('SELECT * FROM characters WHERE project_id = ?');
        const chars = stmt.all(id);
        res.json(chars);
    });

    router.post('/api/projects/:id/characters', (req, res) => {
        const { id } = req.params;
        const { name, description, personality, reference_image_url } = req.body;
        const stmt = db.prepare(`
            INSERT INTO characters (project_id, name, description, personality, reference_image_url)
            VALUES (@projectId, @name, @description, @personality, @reference_image_url)
        `);
        const info = stmt.run({
            projectId: id,
            name: sanitize(name),
            description: sanitize(description),
            personality: sanitize(personality),
            reference_image_url: sanitize(reference_image_url)
        });
        res.json({ id: info.lastInsertRowid });
    });

    router.put('/api/characters/:id', (req, res) => {
        const { id } = req.params;
        const data = req.body;
        const stmt = db.prepare(`
            UPDATE characters SET
                name = COALESCE(@name, name),
                description = COALESCE(@description, description),
                personality = COALESCE(@personality, personality),
                reference_image_url = COALESCE(@reference_image_url, reference_image_url)
            WHERE id = @id
        `);
        stmt.run({
            id,
            name: sanitize(data.name),
            description: sanitize(data.description),
            personality: sanitize(data.personality),
            reference_image_url: sanitize(data.reference_image_url)
        });
        res.json({ success: true });
    });

    router.delete('/api/characters/:id', (req, res) => {
        const { id } = req.params;
        db.prepare('DELETE FROM characters WHERE id = ?').run(id);
        res.json({ success: true });
    });

    return router;
}
