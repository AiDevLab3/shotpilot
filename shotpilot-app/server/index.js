import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, initDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Initializing database...");
initDatabase();
console.log("Database initialized. Starting server middleware...");

// Middleware
app.use(cors());
app.use(express.json());

// Static files for images
// We'll store images in the project root's 'public/uploads' so Vite can serve them if needed,
// OR just serve them via Express. Serving via Express is safer for dynamic uploads.
// Let's create a 'uploads' dir one level up in root if we want it visible easily,
// but for a pure app, keeping it in server/uploads or just root/uploads is fine.
// The user asked for "shotpilot-app/public/uploads/images/"
const UPLOADS_DIR = path.join(__dirname, '../public/uploads/images');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve static files from public
app.use(express.static(path.join(__dirname, '../public')));

// Initialize DB
initDatabase();

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// --- API ROUTES ---

// Helper to ensure all params are present
const sanitize = (val) => val === undefined ? null : val;

// Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const relativePath = `/uploads/images/${req.file.filename}`;
    res.json({ url: relativePath });
});

// Projects
app.get('/api/projects', (req, res) => {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC');
    const projects = stmt.all();
    res.json(projects);
});

app.post('/api/projects', (req, res) => {
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

app.put('/api/projects/:id', (req, res) => {
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
    // For UPDATE with COALESCE, we can pass undefined and better-sqlite3 handles it if not bound?
    // Start simple: merge with defaults? No, COALESCE checks for NULL. 
    // If we pass undefined to better-sqlite3 binding, it throws. We must pass NULL.
    // So we map everything.
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

// Characters
app.get('/api/projects/:id/characters', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM characters WHERE project_id = ?');
    const chars = stmt.all(id);
    res.json(chars);
});

app.post('/api/projects/:id/characters', (req, res) => {
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

app.put('/api/characters/:id', (req, res) => {
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

app.delete('/api/characters/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM characters WHERE id = ?').run(id);
    res.json({ success: true });
});

// Objects
app.get('/api/projects/:id/objects', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM objects WHERE project_id = ?');
    const objs = stmt.all(id);
    res.json(objs);
});

app.post('/api/projects/:id/objects', (req, res) => {
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

app.put('/api/objects/:id', (req, res) => {
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

app.delete('/api/objects/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM objects WHERE id = ?').run(id);
    res.json({ success: true });
});

// Scenes
app.get('/api/projects/:id/scenes', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM scenes WHERE project_id = ? ORDER BY order_index ASC');
    const scenes = stmt.all(id);
    res.json(scenes);
});

app.post('/api/projects/:id/scenes', (req, res) => {
    const { id } = req.params;
    const data = req.body;

    // Auto-order
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

app.put('/api/scenes/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const stmt = db.prepare(`
        UPDATE scenes SET
            name = COALESCE(@name, name),
            description = COALESCE(@description, description),
            order_index = COALESCE(@order_index, order_index),
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

app.delete('/api/scenes/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM scenes WHERE id = ?').run(id);
    res.json({ success: true });
});

// Helper to get next order index
const getNextOrderIndex = (sceneId) => {
    const row = db.prepare('SELECT MAX(order_index) as maxIndex FROM shots WHERE scene_id = ?').get(sceneId);
    return (row.maxIndex || 0) + 1;
};

// Shots
app.get('/api/scenes/:id/shots', (req, res) => {
    const { id } = req.params;
    // Order by order_index ASC
    const shots = db.prepare('SELECT * FROM shots WHERE scene_id = ? ORDER BY order_index ASC, id ASC').all(id);
    res.json(shots);
});

app.post('/api/scenes/:id/shots', (req, res) => {
    const { id } = req.params;
    const data = req.body;

    let targetOrderIndex;

    // insertAfterOrderIndex: If provided, we insert AFTER this index.
    if (data.insertAfterOrderIndex !== undefined) {
        targetOrderIndex = data.insertAfterOrderIndex + 1;

        // Transaction to Shift & Renumber
        const shiftTransaction = db.transaction(() => {
            // 1. Get all shots that will be shifted
            const shotsToShift = db.prepare(`
                SELECT id, shot_number 
                FROM shots 
                WHERE scene_id = ? AND order_index >= ?
                ORDER BY order_index ASC
            `).all(id, targetOrderIndex);

            // 2. Renumber Logic: If shot_number is purely numeric, increment it.
            //    We assume the user wants standard 1, 2, 3... behavior if they are using numbers.
            //    We iterate in reverse order to avoid collisions if we were doing unique constraint checks, 
            //    though here we just update strings so order mostly matters for logic clarity.
            for (const shot of shotsToShift) {
                const numericNum = parseInt(shot.shot_number);
                // Check if it's a "clean" integer string (ref: "1" vs "1A")
                if (!isNaN(numericNum) && String(numericNum) === String(shot.shot_number)) {
                    const newNum = (numericNum + 1).toString();
                    db.prepare('UPDATE shots SET shot_number = ? WHERE id = ?').run(newNum, shot.id);
                }
            }

            // 3. Shift order_index
            db.prepare(`
                UPDATE shots 
                SET order_index = order_index + 1 
                WHERE scene_id = ? AND order_index >= ?
            `).run(id, targetOrderIndex);
        });

        shiftTransaction();
    } else {
        // Append to end
        targetOrderIndex = getNextOrderIndex(id);
    }

    const stmt = db.prepare(`
        INSERT INTO shots (
            scene_id, shot_number, shot_type, shot_type_custom, 
            camera_angle, camera_angle_custom, camera_movement, camera_movement_custom,
            desired_duration, generation_duration, focal_length, camera_lens,
            description, blocking, vfx_notes, sfx_notes, notes, order_index, status
        )
            @sceneId, @shot_number, @shot_type, @shot_type_custom, 
            @camera_angle, @camera_angle_custom, @camera_movement, @camera_movement_custom,
            @desired_duration, @generation_duration, @focal_length, @camera_lens,
            @description, @blocking, @vfx_notes, @sfx_notes, @notes, @orderIndex, @status
        )
    `);
    const info = stmt.run({
        sceneId: id,
        shot_number: sanitize(data.shot_number),
        shot_type: sanitize(data.shot_type),
        shot_type_custom: sanitize(data.shot_type_custom),
        camera_angle: sanitize(data.camera_angle),
        camera_angle_custom: sanitize(data.camera_angle_custom),
        camera_movement: sanitize(data.camera_movement),
        camera_movement_custom: sanitize(data.camera_movement_custom),
        desired_duration: data.desired_duration || 5, // defaults handled by DB usually but good to be explicit
        generation_duration: data.generation_duration || 8,
        focal_length: sanitize(data.focal_length),
        camera_lens: sanitize(data.camera_lens),
        description: sanitize(data.description),
        blocking: sanitize(data.blocking),
        vfx_notes: sanitize(data.vfx_notes),
        sfx_notes: sanitize(data.sfx_notes),
        notes: sanitize(data.notes),
        orderIndex: targetOrderIndex,
        status: sanitize(data.status)
    });
    res.json({ id: info.lastInsertRowid });
});

app.put('/api/shots/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const stmt = db.prepare(`
        UPDATE shots SET
            shot_number = COALESCE(@shot_number, shot_number),
            shot_type = COALESCE(@shot_type, shot_type),
            shot_type_custom = COALESCE(@shot_type_custom, shot_type_custom),
            camera_angle = COALESCE(@camera_angle, camera_angle),
            camera_angle_custom = COALESCE(@camera_angle_custom, camera_angle_custom),
            camera_movement = COALESCE(@camera_movement, camera_movement),
            camera_movement_custom = COALESCE(@camera_movement_custom, camera_movement_custom),
            desired_duration = COALESCE(@desired_duration, desired_duration),
            generation_duration = COALESCE(@generation_duration, generation_duration),
            focal_length = COALESCE(@focal_length, focal_length),
            camera_lens = COALESCE(@camera_lens, camera_lens),
            description = COALESCE(@description, description),
            blocking = COALESCE(@blocking, blocking),
            vfx_notes = COALESCE(@vfx_notes, vfx_notes),
            sfx_notes = COALESCE(@sfx_notes, sfx_notes),
            notes = COALESCE(@notes, notes),
            status = COALESCE(@status, status)
        WHERE id = @id
    `);
    stmt.run({
        id,
        shot_number: sanitize(data.shot_number),
        shot_type: sanitize(data.shot_type),
        shot_type_custom: sanitize(data.shot_type_custom),
        camera_angle: sanitize(data.camera_angle),
        camera_angle_custom: sanitize(data.camera_angle_custom),
        camera_movement: sanitize(data.camera_movement),
        camera_movement_custom: sanitize(data.camera_movement_custom),
        desired_duration: data.desired_duration,
        generation_duration: data.generation_duration,
        focal_length: sanitize(data.focal_length),
        camera_lens: sanitize(data.camera_lens),
        description: sanitize(data.description),
        blocking: sanitize(data.blocking),
        vfx_notes: sanitize(data.vfx_notes),
        sfx_notes: sanitize(data.sfx_notes),
        notes: sanitize(data.notes),
        status: sanitize(data.status)
    });
    res.json({ success: true });
});

// Variants Placeholders (Phase 2)
app.get('/api/shots/:shotId/variants', (req, res) => {
    res.json([]);
});

app.post('/api/shots/:shotId/variants', (req, res) => {
    res.json({ message: 'Phase 2 endpoint ready' });
});

app.put('/api/variants/:id', (req, res) => {
    res.json({ message: 'Phase 2 endpoint ready' });
});

app.delete('/api/shots/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM shots WHERE id = ?').run(id);
    res.json({ success: true });
});

// Image Variants
app.get('/api/shots/:id/images', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM image_variants WHERE shot_id = ? ORDER BY created_at DESC');
    const images = stmt.all(id);
    res.json(images);
});

app.post('/api/shots/:id/images', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const stmt = db.prepare(`
        INSERT INTO image_variants (shot_id, image_url, prompt_used, status)
        VALUES (@shotId, @image_url, @prompt_used, @status)
    `);
    const info = stmt.run({
        shotId: id,
        image_url: sanitize(data.image_url),
        prompt_used: sanitize(data.prompt_used),
        status: 'generated'
    });
    res.json({ id: info.lastInsertRowid });
});

app.delete('/api/images/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM image_variants WHERE id = ?').run(id);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
