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

    // Phase 4: Holistic Image Audit Migrations
    try {
        const variantsInfo2 = db.pragma('table_info(image_variants)');
        const variantCols = new Set(variantsInfo2.map(col => col.name));

        if (!variantCols.has('audit_score')) {
            console.log('Migrating: Adding holistic audit columns to image_variants table...');
            db.exec('ALTER TABLE image_variants ADD COLUMN audit_score INTEGER');
            db.exec('ALTER TABLE image_variants ADD COLUMN audit_recommendation TEXT');
            db.exec('ALTER TABLE image_variants ADD COLUMN audit_data TEXT');
        }
    } catch (e) {
        console.error("Phase 4 (Image Audit) Migration failed:", e);
    }

    // Phase 6: Audit System Elevation — iteration tracking + status lifecycle
    try {
        const variantsInfo3 = db.pragma('table_info(image_variants)');
        const variantCols3 = new Set(variantsInfo3.map(col => col.name));

        if (!variantCols3.has('iteration_number')) {
            console.log('Migrating: Adding iteration tracking columns to image_variants...');
            db.exec('ALTER TABLE image_variants ADD COLUMN iteration_number INTEGER DEFAULT 1');
            db.exec('ALTER TABLE image_variants ADD COLUMN parent_variant_id INTEGER');
        }
    } catch (e) {
        console.error("Phase 6 (Audit Elevation) Migration failed:", e);
    }

    // Phase 7: Conversation Persistence
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL UNIQUE,
                mode TEXT DEFAULT 'initial',
                script_content TEXT,
                target_model TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `);
        db.exec(`
            CREATE TABLE IF NOT EXISTS conversation_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            )
        `);
    } catch (e) {
        console.error("Phase 7 (Conversation Persistence) Migration failed:", e);
    }

    // Phase 5: Project Images (Alt Images Library)
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS project_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                image_url TEXT NOT NULL,
                title TEXT,
                notes TEXT,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `);
    } catch (e) {
        console.error("Phase 5 (Project Images) Migration failed:", e);
    }

    // Phase 8: AI Generation History + Entity Reference Images
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS ai_generations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_type TEXT NOT NULL,
                entity_id INTEGER NOT NULL,
                model TEXT,
                suggestions_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        db.exec(`
            CREATE TABLE IF NOT EXISTS entity_reference_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_type TEXT NOT NULL,
                entity_id INTEGER NOT NULL,
                image_type TEXT NOT NULL,
                image_url TEXT NOT NULL,
                label TEXT,
                prompt TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (e) {
        console.error("Phase 8 (AI Generations + Entity Images) Migration failed:", e);
    }

    // Phase 8b: Add analysis_json column to entity_reference_images (for image analysis results)
    try {
        const cols = db.prepare("PRAGMA table_info(entity_reference_images)").all();
        if (!cols.find(c => c.name === 'analysis_json')) {
            db.exec('ALTER TABLE entity_reference_images ADD COLUMN analysis_json TEXT');
            console.log('Added analysis_json column to entity_reference_images');
        }
    } catch (e) {
        console.error("Phase 8b migration failed:", e);
    }

    // Phase 9: Asset Manager — classification, scoring, scene assignment
    try {
        const piCols = db.prepare("PRAGMA table_info(project_images)").all();
        const piColNames = new Set(piCols.map(c => c.name));
        const assetCols = [
            { name: 'asset_type', type: "TEXT DEFAULT 'unclassified'" },      // real_ref, ai_generated, style_ref, unclassified
            { name: 'subject_category', type: 'TEXT' },     // hero, property_manager, vehicle, environment, dome, equipment, other
            { name: 'scene_id', type: 'TEXT' },             // mapped scene (from agent project context)
            { name: 'style_score', type: 'REAL' },          // 0-10 score against project style
            { name: 'realism_score', type: 'REAL' },        // 0-10 photorealism
            { name: 'pipeline_score', type: 'REAL' },       // 0-10 safe to use as downstream ref
            { name: 'status', type: "TEXT DEFAULT 'unreviewed'" },  // unreviewed, approved, needs_work, rejected
            { name: 'analysis_json', type: 'TEXT' },        // full AI analysis stored as JSON
            { name: 'refinement_notes', type: 'TEXT' },     // expert advice for improving this image
            { name: 'source_model', type: 'TEXT' },         // model that generated this (if known)
            { name: 'source_prompt', type: 'TEXT' },        // original prompt (if known or reverse-engineered)
            { name: 'parent_asset_id', type: 'INTEGER' },   // links to the asset this was refined from
            { name: 'iteration', type: 'INTEGER DEFAULT 1' }, // iteration number in refinement chain
            { name: 'refinement_json', type: 'TEXT' },      // refinement plan from AI (ref strategy, prompt, model rec)
        ];
        assetCols.forEach(col => {
            if (!piColNames.has(col.name)) {
                console.log(`Migrating: Adding ${col.name} to project_images...`);
                db.exec(`ALTER TABLE project_images ADD COLUMN ${col.name} ${col.type}`);
            }
        });
    } catch (e) {
        console.error("Phase 9 (Asset Manager) Migration failed:", e);
    }

    // Phase 10: Cost Tracking System
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS api_cost_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT DEFAULT (datetime('now')),
                provider TEXT NOT NULL,
                model TEXT NOT NULL,
                action TEXT NOT NULL,
                project_id INTEGER,
                asset_id INTEGER,
                input_tokens INTEGER,
                output_tokens INTEGER,
                image_count INTEGER,
                duration_ms INTEGER,
                estimated_cost_usd REAL,
                request_meta TEXT,
                response_meta TEXT,
                error TEXT
            )
        `);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_cost_log_timestamp ON api_cost_log(timestamp)`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_cost_log_project ON api_cost_log(project_id)`);
        db.exec(`CREATE INDEX IF NOT EXISTS idx_cost_log_action ON api_cost_log(action)`);
        console.log('Phase 10: Cost tracking table created');
    } catch (e) {
        console.error("Phase 10 (Cost Tracking) Migration failed:", e);
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
