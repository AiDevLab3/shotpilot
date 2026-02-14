import { Router } from 'express';

export default function createShotRoutes({ db, sanitize, calculateCompleteness }) {
    const router = Router();

    const getNextOrderIndex = (sceneId) => {
        const row = db.prepare('SELECT MAX(order_index) as maxIndex FROM shots WHERE scene_id = ?').get(sceneId);
        return (row.maxIndex || 0) + 1;
    };

    router.get('/api/scenes/:id/shots', (req, res) => {
        try {
            const { id } = req.params;
            const startTime = Date.now();

            const shots = db.prepare('SELECT * FROM shots WHERE scene_id = ? ORDER BY order_index ASC, id ASC').all(id);
            const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(id);
            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id);

            const shotsWithReadiness = shots.map(shot => {
                try {
                    const readiness = calculateCompleteness(project, scene, shot);
                    return {
                        ...shot,
                        readiness_tier: readiness.tier,
                        readiness_percentage: readiness.percentage,
                        quality_tier: readiness.tier,
                        quality_percentage: readiness.percentage,
                    };
                } catch (err) {
                    console.error(`[Readiness] Error calculating for shot ${shot.id}:`, err.message);
                    return {
                        ...shot,
                        readiness_tier: 'draft',
                        readiness_percentage: 0,
                        quality_tier: 'draft',
                        quality_percentage: 0,
                    };
                }
            });

            const duration = Date.now() - startTime;
            console.log(`[Readiness] Calculated ${shots.length} shot scores in ${duration}ms`);

            res.json(shotsWithReadiness);
        } catch (error) {
            console.error('[Shots Fetch] Error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/api/scenes/:id/shots', (req, res) => {
        const { id } = req.params;
        const data = req.body;

        let targetOrderIndex;

        if (data.insertAfterOrderIndex !== undefined) {
            targetOrderIndex = data.insertAfterOrderIndex + 1;

            const shiftTransaction = db.transaction(() => {
                const shotsToShift = db.prepare(`
                    SELECT id, shot_number
                    FROM shots
                    WHERE scene_id = ? AND order_index >= ?
                    ORDER BY order_index ASC
                `).all(id, targetOrderIndex);

                for (const shot of shotsToShift) {
                    const numericNum = parseInt(shot.shot_number);
                    if (!isNaN(numericNum) && String(numericNum) === String(shot.shot_number)) {
                        const newNum = (numericNum + 1).toString();
                        db.prepare('UPDATE shots SET shot_number = ? WHERE id = ?').run(newNum, shot.id);
                    }
                }

                db.prepare(`
                    UPDATE shots
                    SET order_index = order_index + 1
                    WHERE scene_id = ? AND order_index >= ?
                `).run(id, targetOrderIndex);
            });

            shiftTransaction();
        } else {
            targetOrderIndex = getNextOrderIndex(id);
        }

        const stmt = db.prepare(`
            INSERT INTO shots (
                scene_id, shot_number, shot_type, shot_type_custom,
                camera_angle, camera_angle_custom, camera_movement, camera_movement_custom,
                desired_duration, generation_duration, focal_length, camera_lens,
                description, blocking, vfx_notes, sfx_notes, notes, order_index, status
            )
            VALUES (
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
            desired_duration: data.desired_duration || 5,
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

    router.put('/api/shots/:id', (req, res) => {
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

    router.delete('/api/shots/:id', (req, res) => {
        const { id } = req.params;

        const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(id);

        if (shot) {
            const deleteTransaction = db.transaction(() => {
                db.prepare('DELETE FROM shots WHERE id = ?').run(id);

                const remainingShots = db.prepare('SELECT id, shot_number, order_index FROM shots WHERE scene_id = ? ORDER BY order_index ASC').all(shot.scene_id);

                let cleanIndex = 1;
                for (const s of remainingShots) {
                    const numericNum = parseInt(s.shot_number);

                    let newShotNumber = s.shot_number;
                    if (!isNaN(numericNum) && String(numericNum) === String(s.shot_number)) {
                        newShotNumber = String(cleanIndex);
                    }

                    if (s.order_index !== cleanIndex || s.shot_number !== newShotNumber) {
                        db.prepare('UPDATE shots SET order_index = ?, shot_number = ? WHERE id = ?')
                            .run(cleanIndex, newShotNumber, s.id);
                    }
                    cleanIndex++;
                }
            });

            deleteTransaction();
        } else {
            db.prepare('DELETE FROM shots WHERE id = ?').run(id);
        }

        res.json({ success: true });
    });

    return router;
}
