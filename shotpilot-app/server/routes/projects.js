import { Router } from 'express';

export default function createProjectRoutes({ db, sanitize }) {
    const router = Router();

    // Projects
    router.get('/api/projects', (req, res) => {
        const stmt = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC');
        const projects = stmt.all();
        res.json(projects);
    });

    router.post('/api/projects', (req, res) => {
        const { title, frame_size, purpose, lighting_directions, style_aesthetic, storyline_narrative, cinematography, atmosphere_mood, cinematic_references } = req.body;
        const stmt = db.prepare(`
            INSERT INTO projects (title, frame_size, purpose, lighting_directions, style_aesthetic, storyline_narrative, cinematography, atmosphere_mood, cinematic_references)
            VALUES (@title, @frame_size, @purpose, @lighting_directions, @style_aesthetic, @storyline_narrative, @cinematography, @atmosphere_mood, @cinematic_references)
        `);
        const info = stmt.run({
            title: sanitize(title),
            frame_size: sanitize(frame_size),
            purpose: sanitize(purpose),
            lighting_directions: sanitize(lighting_directions),
            style_aesthetic: sanitize(style_aesthetic),
            storyline_narrative: sanitize(storyline_narrative),
            cinematography: sanitize(cinematography),
            atmosphere_mood: sanitize(atmosphere_mood),
            cinematic_references: sanitize(cinematic_references)
        });
        res.json({ id: info.lastInsertRowid });
    });

    router.put('/api/projects/:id', (req, res) => {
        const { id } = req.params;
        const data = req.body;
        const stmt = db.prepare(`
            UPDATE projects SET
                title = COALESCE(@title, title),
                frame_size = COALESCE(@frame_size, frame_size),
                purpose = COALESCE(@purpose, purpose),
                lighting_directions = COALESCE(@lighting_directions, lighting_directions),
                style_aesthetic = COALESCE(@style_aesthetic, style_aesthetic),
                storyline_narrative = COALESCE(@storyline_narrative, storyline_narrative),
                cinematography = COALESCE(@cinematography, cinematography),
                atmosphere_mood = COALESCE(@atmosphere_mood, atmosphere_mood),
                cinematic_references = COALESCE(@cinematic_references, cinematic_references),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
        `);
        const safeData = {
            id,
            title: sanitize(data.title),
            frame_size: sanitize(data.frame_size),
            purpose: sanitize(data.purpose),
            lighting_directions: sanitize(data.lighting_directions),
            style_aesthetic: sanitize(data.style_aesthetic),
            storyline_narrative: sanitize(data.storyline_narrative),
            cinematography: sanitize(data.cinematography),
            atmosphere_mood: sanitize(data.atmosphere_mood),
            cinematic_references: sanitize(data.cinematic_references)
        };
        stmt.run(safeData);
        res.json({ success: true });
    });

    router.delete('/api/projects/:id', (req, res) => {
        const { id } = req.params;
        db.prepare('DELETE FROM projects WHERE id = ?').run(id);
        res.json({ success: true });
    });

    // Project Images (Alt Images Library)
    router.get('/api/projects/:id/images', (req, res) => {
        const { id } = req.params;
        const images = db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY created_at DESC').all(id);
        res.json(images);
    });

    router.post('/api/projects/:id/images', (req, res) => {
        const { id } = req.params;
        const { image_url, title, notes, tags } = req.body;
        if (!image_url) return res.status(400).json({ error: 'image_url is required' });
        const stmt = db.prepare(
            'INSERT INTO project_images (project_id, image_url, title, notes, tags) VALUES (?, ?, ?, ?, ?)'
        );
        const info = stmt.run(id, image_url, sanitize(title) || null, sanitize(notes) || null, sanitize(tags) || null);
        res.json({ id: info.lastInsertRowid, project_id: Number(id), image_url, title, notes, tags });
    });

    router.put('/api/project-images/:id', (req, res) => {
        const { id } = req.params;
        const { title, notes, tags } = req.body;
        db.prepare('UPDATE project_images SET title = ?, notes = ?, tags = ? WHERE id = ?')
            .run(sanitize(title) || null, sanitize(notes) || null, sanitize(tags) || null, id);
        const updated = db.prepare('SELECT * FROM project_images WHERE id = ?').get(id);
        res.json(updated);
    });

    router.delete('/api/project-images/:id', (req, res) => {
        db.prepare('DELETE FROM project_images WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    return router;
}
