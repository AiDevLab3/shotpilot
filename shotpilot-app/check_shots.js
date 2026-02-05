import { db, initDatabase } from './server/database.js';

// Initialize (just in case, though usually works on import if side-effect based)
initDatabase();

const sceneId = 1; // Assuming Scene 1 based on context
const shots = db.prepare('SELECT id, shot_number, order_index, scene_id FROM shots WHERE scene_id = ? ORDER BY order_index ASC').all(sceneId);

console.log('Current Shots for Scene 1:');
console.table(shots);
