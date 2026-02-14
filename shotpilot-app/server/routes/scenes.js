import { Router } from 'express';

export default function createSceneRoutes({ db, sanitize }) {
    const router = Router();

    router.get('/api/projects/:id/scenes', (req, res) => {
        const { id } = req.params;
        const stmt = db.prepare('SELECT * FROM scenes WHERE project_id = ? ORDER BY order_index ASC');
        const scenes = stmt.all(id);
        res.json(scenes);
    });

    router.post('/api/projects/:id/scenes', (req, res) => {
        const { id } = req.params;
        const data = req.body;

        const max = db.prepare('SELECT MAX(order_index) as max_order FROM scenes WHERE project_id = ?').get(id);
        const orderIndex = (max.max_order || 0) + 1;

        const stmt = db.prepare(`
            INSERT INTO scenes (project_id, name, description, order_index, location_setting, time_of_day, weather_atmosphere, mood_tone, lighting_notes, camera_approach, characters_present)
            VALUES (@projectId, @name, @description, @order_index, @location_setting, @time_of_day, @weather_atmosphere, @mood_tone, @lighting_notes, @camera_approach, @characters_present)
        `);

        const info = stmt.run({
            projectId: id,
            name: sanitize(data.name),
            description: sanitize(data.description),
            order_index: orderIndex,
            location_setting: sanitize(data.location_setting),
            time_of_day: sanitize(data.time_of_day),
            weather_atmosphere: sanitize(data.weather_atmosphere),
            mood_tone: sanitize(data.mood_tone),
            lighting_notes: sanitize(data.lighting_notes),
            camera_approach: sanitize(data.camera_approach),
            characters_present: sanitize(data.characters_present)
        });
        res.json({ id: info.lastInsertRowid });
    });

    router.put('/api/scenes/:id', (req, res) => {
        const { id } = req.params;
        const data = req.body;
        const stmt = db.prepare(`
            UPDATE scenes SET
                name = COALESCE(@name, name),
                description = COALESCE(@description, description),
                order_index = COALESCE(@order_index, order_index),
                status = COALESCE(@status, status),
                location_setting = COALESCE(@location_setting, location_setting),
                time_of_day = COALESCE(@time_of_day, time_of_day),
                weather_atmosphere = COALESCE(@weather_atmosphere, weather_atmosphere),
                mood_tone = COALESCE(@mood_tone, mood_tone),
                lighting_notes = COALESCE(@lighting_notes, lighting_notes),
                camera_approach = COALESCE(@camera_approach, camera_approach),
                characters_present = COALESCE(@characters_present, characters_present)
            WHERE id = @id
        `);
        stmt.run({
            id,
            name: sanitize(data.name),
            description: sanitize(data.description),
            order_index: sanitize(data.order_index),
            status: sanitize(data.status),
            location_setting: sanitize(data.location_setting),
            time_of_day: sanitize(data.time_of_day),
            weather_atmosphere: sanitize(data.weather_atmosphere),
            mood_tone: sanitize(data.mood_tone),
            lighting_notes: sanitize(data.lighting_notes),
            camera_approach: sanitize(data.camera_approach),
            characters_present: sanitize(data.characters_present)
        });
        res.json({ success: true });
    });

    router.delete('/api/scenes/:id', (req, res) => {
        const { id } = req.params;
        db.prepare('DELETE FROM scenes WHERE id = ?').run(id);
        res.json({ success: true });
    });

    return router;
}
