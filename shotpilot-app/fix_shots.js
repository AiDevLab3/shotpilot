import { db, initDatabase } from './server/database.js';

initDatabase();

const sceneId = 1; // Fixing Scene 1

console.log('Fixing shot numbers for Scene 1...');

const fixTransaction = db.transaction(() => {
    // Get all shots ordered by current index
    const shots = db.prepare('SELECT id, shot_number, order_index FROM shots WHERE scene_id = ? ORDER BY order_index ASC').all(sceneId);

    let cleanIndex = 1;
    for (const s of shots) {
        const numericNum = parseInt(s.shot_number);

        // Determine new shot Number (only if it was numeric)
        // If the user manually named it "2A", we might not want to rename it to "3".
        // But for this fix, assuming standard numeric sequence.
        let newShotNumber = s.shot_number;
        if (!isNaN(numericNum) && String(numericNum) === String(s.shot_number)) {
            newShotNumber = String(cleanIndex);
        }

        console.log(`Shot ID ${s.id}: ${s.shot_number} -> ${newShotNumber} (Order: ${s.order_index} -> ${cleanIndex})`);

        db.prepare('UPDATE shots SET order_index = ?, shot_number = ? WHERE id = ?')
            .run(cleanIndex, newShotNumber, s.id);

        cleanIndex++;
    }
});

fixTransaction();

console.log('Fix complete. New State:');
const newShots = db.prepare('SELECT id, shot_number, order_index FROM shots WHERE scene_id = ? ORDER BY order_index ASC').all(sceneId);
console.table(newShots);
