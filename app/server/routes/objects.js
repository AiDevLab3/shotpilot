import { Router } from 'express';

export default function createObjectRoutes({ db, sanitize }) {
    const router = Router();

    router.get('/api/projects/:id/objects', (req, res) => {
        const { id } = req.params;
        const stmt = db.prepare('SELECT * FROM objects WHERE project_id = ?');
        const objs = stmt.all(id);
        res.json(objs);
    });

    router.post('/api/projects/:id/objects', (req, res) => {
        const { id } = req.params;
        const { name, description, reference_image_url } = req.body;
        const stmt = db.prepare(`
            INSERT INTO objects (project_id, name, description, reference_image_url)
            VALUES (@projectId, @name, @description, @reference_image_url)
        `);
        const info = stmt.run({
            projectId: id,
            name: sanitize(name),
            description: sanitize(description),
            reference_image_url: sanitize(reference_image_url)
        });
        res.json({ id: info.lastInsertRowid });
    });

    router.put('/api/objects/:id', (req, res) => {
        const { id } = req.params;
        const data = req.body;
        const stmt = db.prepare(`
            UPDATE objects SET
                name = COALESCE(@name, name),
                description = COALESCE(@description, description),
                reference_image_url = COALESCE(@reference_image_url, reference_image_url)
            WHERE id = @id
        `);
        stmt.run({
            id,
            name: sanitize(data.name),
            description: sanitize(data.description),
            reference_image_url: sanitize(data.reference_image_url)
        });
        res.json({ success: true });
    });

    router.delete('/api/objects/:id', (req, res) => {
        const { id } = req.params;
        db.prepare('DELETE FROM objects WHERE id = ?').run(id);
        res.json({ success: true });
    });

    return router;
}
