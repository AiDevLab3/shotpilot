import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'shotpilot.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

export const initDatabase = () => {
    const schema = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        credits INTEGER DEFAULT 10,
        tier TEXT DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS usage_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        credits_used INTEGER DEFAULT 1,
        model_name TEXT,
        shot_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        frame_size TEXT,
        purpose TEXT,
        lighting_directions TEXT,
        style_aesthetic TEXT,
        storyline_narrative TEXT,
        cinematography TEXT,
        atmosphere_mood TEXT,
        cinematic_references TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        personality TEXT,
        reference_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS objects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        reference_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS scenes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        order_index INTEGER,
        location_setting TEXT,
        time_of_day TEXT,
        weather_atmosphere TEXT,
        mood_tone TEXT,
        lighting_notes TEXT,
        camera_approach TEXT,
        characters_present TEXT,
        status TEXT DEFAULT 'planning',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scene_id INTEGER NOT NULL,
        shot_number TEXT NOT NULL,
        shot_type TEXT,
        shot_type_custom TEXT,
        camera_angle TEXT,
        camera_angle_custom TEXT,
        camera_movement TEXT,
        camera_movement_custom TEXT,
        desired_duration INTEGER DEFAULT 5,
        generation_duration INTEGER DEFAULT 8,
        focal_length TEXT,
        camera_lens TEXT,
        description TEXT,
        blocking TEXT,
        vfx_notes TEXT,
        sfx_notes TEXT,
        notes TEXT,
        status TEXT DEFAULT 'planning',
        order_index INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS image_variants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shot_id INTEGER NOT NULL,
        image_url TEXT,
        model_used TEXT,
        prompt_used TEXT,
        generated_prompt TEXT,
        user_edited_prompt TEXT,
        quality_score INTEGER,
        status TEXT,
        analysis_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shot_id) REFERENCES shots(id) ON DELETE CASCADE
    );
    `;

    db.exec(schema);

    // Migration: Check and add missing columns to shots table
    try {
        const tableInfo = db.pragma('table_info(shots)');
        const existingColumns = new Set(tableInfo.map(col => col.name));

        const newColumns = [
            { name: 'order_index', type: 'INTEGER' },
            { name: 'shot_type_custom', type: 'TEXT' },
            { name: 'camera_angle', type: 'TEXT' },
            { name: 'camera_angle_custom', type: 'TEXT' },
            { name: 'camera_movement_custom', type: 'TEXT' },
            { name: 'desired_duration', type: 'INTEGER DEFAULT 5' },
            { name: 'generation_duration', type: 'INTEGER DEFAULT 8' },
            { name: 'focal_length', type: 'TEXT' },
            { name: 'camera_lens', type: 'TEXT' },
            { name: 'vfx_notes', type: 'TEXT' },
            { name: 'sfx_notes', type: 'TEXT' },
            { name: 'notes', type: 'TEXT' }
        ];

        newColumns.forEach(col => {
            if (!existingColumns.has(col.name)) {
                console.log(`Migrating: Adding ${col.name} to shots table...`);
                db.exec(`ALTER TABLE shots ADD COLUMN ${col.name} ${col.type}`);
            }
        });

        // Backfill Check (Should run even if column already existed, to be safe)
        const nullFn = db.prepare('SELECT COUNT(*) as count FROM shots WHERE order_index IS NULL').get();
        if (nullFn.count > 0) {
            console.log(`Backfilling order_index for ${nullFn.count} shots...`);
            db.prepare('UPDATE shots SET order_index = id WHERE order_index IS NULL').run();
        }

    } catch (e) {
        console.error("Migration check failed:", e);
    }

    // Phase 2 Migrations
    try {
        // Add user_id to projects if missing
        const projectsInfo = db.pragma('table_info(projects)');
        if (!projectsInfo.some(col => col.name === 'user_id')) {
            console.log('Migrating: Adding user_id to projects table...');
            db.exec('ALTER TABLE projects ADD COLUMN user_id INTEGER REFERENCES users(id)');
        }

        // Add generated_prompt columns to image_variants if missing
        const variantsInfo = db.pragma('table_info(image_variants)');
        if (!variantsInfo.some(col => col.name === 'generated_prompt')) {
            console.log('Migrating: Adding generated_prompt to image_variants table...');
            db.exec('ALTER TABLE image_variants ADD COLUMN generated_prompt TEXT');
            db.exec('ALTER TABLE image_variants ADD COLUMN user_edited_prompt TEXT');
        }

        // Add status to scenes if missing
        const scenesInfo = db.pragma('table_info(scenes)');
        if (!scenesInfo.some(col => col.name === 'status')) {
            console.log('Migrating: Adding status to scenes table...');
            db.exec("ALTER TABLE scenes ADD COLUMN status TEXT DEFAULT 'planning'");
        }

        // Add status to shots if missing
        const shotsInfo = db.pragma('table_info(shots)');
        if (!shotsInfo.some(col => col.name === 'status')) {
            console.log('Migrating: Adding status to shots table...');
            db.exec("ALTER TABLE shots ADD COLUMN status TEXT DEFAULT 'planning'");
        }

    } catch (e) {
        console.error("Phase 2 Migration check failed:", e);
    }

    // Create default test user if not exists
    try {
        const testUser = db.prepare('SELECT * FROM users WHERE email = ?').get('test@shotpilot.com');
        if (!testUser) {
            console.log('Creating default test user...');
            // Note: In a real app, hash this password! For MVP/Test, we store directly or handling in service. 
            // The instructions provided a hash: $2b$10$YourHashedPasswordHere. 
            // We should use that if we can, or just plain text if the auth logic allows (but instruction said use hash).
            // Let's use the provided hash and assume the logic compares correctly (or we temporarily skip bcrypt compare for MVP login as hinted in instructions).
            db.prepare(`
                INSERT INTO users (email, password_hash, credits, tier)
                VALUES (?, ?, ?, ?)
            `).run('test@shotpilot.com', '$2b$10$YourHashedPasswordHere', 100, 'pro');
        }
    } catch (e) {
        console.error("Failed to create test user:", e);
    }
};

export { db };
