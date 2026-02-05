import initSqlJs, { type Database } from 'sql.js';

let db: Database | null = null;
let dbPromise: Promise<Database> | null = null;

const DB_KEY = 'shotpilot_db_v1';

export const initDB = async (): Promise<Database> => {
    if (db) return db;
    if (dbPromise) return dbPromise;

    dbPromise = new Promise(async (resolve, reject) => {
        try {
            const SQL = await initSqlJs({
                locateFile: file => `/${file}`
            });

            // Check localStorage
            const savedDb = localStorage.getItem(DB_KEY);
            let database;

            if (savedDb) {
                // If saved DB exists, load it
                const binaryString = atob(savedDb);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                database = new SQL.Database(bytes);
                // Ensure migrations run on existing DBs
                migrateDB(database);
                console.log("SHOTPILOT: Loaded database from localStorage");
            } else {
                // Otherwise create new
                database = new SQL.Database();
                runMigrations(database);
                console.log("SHOTPILOT: Created new in-memory database");

                // Save immediately to cache schema
                try {
                    saveDBInternal(database);
                } catch (e) {
                    console.warn("SHOTPILOT: Could not save initial empty DB (storage full?)", e);
                }
            }

            db = database;
            resolve(database);
        } catch (error) {
            reject(error);
        }
    });

    return dbPromise;
};

export const getDB = async (): Promise<Database> => {
    if (!db) {
        return initDB();
    }
    return db;
};

// Internal helper to save without async await issues inside init
const saveDBInternal = (database: Database) => {
    try {
        const data = database.export();
        // Convert Uint8Array to binary string for btoa
        let binary = '';
        const len = data.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(data[i]);
        }
        const base64 = btoa(binary);
        localStorage.setItem(DB_KEY, base64);
        console.log("SHOTPILOT: Database saved to localStorage");
    } catch (e) {
        console.error("SHOTPILOT: Failed to save DB", e);
        throw e; // RE-THROW so API knows it failed
    }
};

export const saveDB = async () => {
    const db = await getDB();
    saveDBInternal(db);
};

const runMigrations = (database: Database) => {
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
        shot_number TEXT,
        shot_type TEXT,
        camera_movement TEXT,
        description TEXT,
        blocking TEXT,
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

    database.run(schema);

    // Also run migrations
    migrateDB(database);
};

// Separated migration logic to run on both new and existing DBs
const migrateDB = (database: Database) => {
    try { database.run("ALTER TABLE scenes ADD COLUMN location_setting TEXT"); } catch (e) { }
    try { database.run("ALTER TABLE scenes ADD COLUMN time_of_day TEXT"); } catch (e) { }
    try { database.run("ALTER TABLE scenes ADD COLUMN weather_atmosphere TEXT"); } catch (e) { }
    try { database.run("ALTER TABLE scenes ADD COLUMN mood_tone TEXT"); } catch (e) { }
    try { database.run("ALTER TABLE scenes ADD COLUMN lighting_notes TEXT"); } catch (e) { }
    try { database.run("ALTER TABLE scenes ADD COLUMN camera_approach TEXT"); } catch (e) { }
    try { database.run("ALTER TABLE scenes ADD COLUMN characters_present TEXT"); } catch (e) { }
};
