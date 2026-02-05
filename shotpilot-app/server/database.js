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
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
};

export { db };
