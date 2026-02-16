import { Router } from 'express';
import { filterByMentions } from '../utils/mentionParser.js';

export default function createAIRoutes({
    db, requireAuth, checkCredits, sanitize,
    // KB services
    loadKBForModel, getAvailableModels, readKBFile,
    // Quality services
    calculateCompleteness, checkReadinessWithKB,
    // AI services
    generateRecommendations, generatePrompt, generateAestheticSuggestions,
    generateCharacterSuggestions, generateShotPlan, readinessDialogue,
    analyzeScript, generateObjectSuggestions, refineContent,
    creativeDirectorCollaborate, summarizeConversation, refinePromptFromAudit,
    // Credit services
    deductCredit, logAIFeatureUsage, getAIUsageStats,
}) {
    const router = Router();

    // Get available models
    router.get('/api/models', (req, res) => {
        try {
            res.json(getAvailableModels());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Check prompt readiness
    router.post('/api/shots/:shotId/check-readiness', requireAuth, async (req, res) => {
        try {
            const { shotId } = req.params;
            const { useKB } = req.body || {};

            const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(shotId);
            if (!shot) return res.status(404).json({ error: 'Shot not found' });

            const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(shot.scene_id);
            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id);

            const characters = db.prepare('SELECT * FROM characters WHERE project_id = ?').all(scene.project_id);
            const objects = db.prepare('SELECT * FROM objects WHERE project_id = ?').all(scene.project_id);

            // First: fast local check for immediate scoring
            const basicReadiness = calculateCompleteness(project, scene, shot);

            // If KB-guided check requested (or by default), enhance with Gemini analysis
            if (useKB !== false) {
                try {
                    const kbReadiness = await checkReadinessWithKB({
                        project, scene, shot, characters, objects
                    });
                    res.json({
                        ...basicReadiness,
                        ...kbReadiness,
                        basicPercentage: basicReadiness.percentage,
                    });
                    return;
                } catch (err) {
                    console.warn('[check-readiness] KB check failed, using basic:', err.message);
                }
            }

            res.json(basicReadiness);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Backward compat alias — redirect preserving POST method
    router.post('/api/shots/:shotId/check-quality', requireAuth, (req, res) => {
        res.redirect(307, req.originalUrl.replace('check-quality', 'check-readiness'));
    });

    // Get recommendations (free)
    router.post('/api/shots/:shotId/get-recommendations', requireAuth, async (req, res) => {
        try {
            const { shotId } = req.params;
            const { missingFields } = req.body;

            const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(shotId);
            if (!shot) return res.status(404).json({ error: 'Shot not found' });

            const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(shot.scene_id);
            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id);

            let kbContent = '';
            try {
                const coreKB = readKBFile('01_Core_Realism_Principles.md');
                const qualityKB = readKBFile('03_Pack_Image_Quality_Control.md');
                kbContent = [coreKB, qualityKB].filter(Boolean).join('\n\n');
            } catch (err) {
                console.warn('[recommendations] Could not load KB:', err.message);
            }

            const recommendations = await generateRecommendations({
                project, scene, shot, missingFields, kbContent
            });

            res.json(recommendations);
        } catch (error) {
            console.error('Recommendations error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Aesthetic suggestions (free)
    router.post('/api/projects/:projectId/aesthetic-suggestions', requireAuth, async (req, res) => {
        try {
            const { projectId } = req.params;

            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
            if (!project) return res.status(404).json({ error: 'Project not found' });

            const scenes = db.prepare('SELECT * FROM scenes WHERE project_id = ? ORDER BY order_index ASC').all(projectId);

            let kbContent = '';
            try {
                const coreKB = readKBFile('01_Core_Realism_Principles.md');
                const qualityKB = readKBFile('03_Pack_Image_Quality_Control.md');
                kbContent = [coreKB, qualityKB].filter(Boolean).join('\n\n');
            } catch (err) {
                console.warn('[aesthetic-suggestions] Could not load KB:', err.message);
            }

            const suggestions = await generateAestheticSuggestions({
                project, scenes, kbContent
            });

            logAIFeatureUsage(db, req.session.userId, 'aesthetic_suggestions', projectId);
            res.json({ suggestions, kbFilesUsed: ['01_Core_Realism_Principles.md', '03_Pack_Image_Quality_Control.md'] });
        } catch (error) {
            console.error('Aesthetic suggestions error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Character suggestions (free)
    router.post('/api/projects/:projectId/character-suggestions', requireAuth, async (req, res) => {
        try {
            const { projectId } = req.params;
            const { name, description, personality } = req.body;

            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
            if (!project) return res.status(404).json({ error: 'Project not found' });

            let kbContent = '';
            try {
                const charKB = readKBFile('03_Pack_Character_Consistency.md');
                const coreKB = readKBFile('01_Core_Realism_Principles.md');
                kbContent = [charKB, coreKB].filter(Boolean).join('\n\n');
            } catch (err) {
                console.warn('[character-suggestions] Could not load KB:', err.message);
            }

            const suggestions = await generateCharacterSuggestions({
                character: { name, description, personality },
                project,
                kbContent,
            });

            logAIFeatureUsage(db, req.session.userId, 'character_suggestions', projectId);
            res.json({ ...suggestions, kbFilesUsed: ['03_Pack_Character_Consistency.md', '01_Core_Realism_Principles.md'] });
        } catch (error) {
            console.error('Character suggestions error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Shot plan (free)
    router.post('/api/scenes/:sceneId/shot-plan', requireAuth, async (req, res) => {
        try {
            const { sceneId } = req.params;

            const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(sceneId);
            if (!scene) return res.status(404).json({ error: 'Scene not found' });

            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id);
            const existingShots = db.prepare('SELECT * FROM shots WHERE scene_id = ? ORDER BY order_index ASC').all(sceneId);

            let kbContent = '';
            try {
                const motionKB = readKBFile('03_Pack_Motion_Readiness.md');
                const spatialKB = readKBFile('03_Pack_Spatial_Composition.md');
                const coreKB = readKBFile('01_Core_Realism_Principles.md');
                kbContent = [motionKB, spatialKB, coreKB].filter(Boolean).join('\n\n');
            } catch (err) {
                console.warn('[shot-plan] Could not load KB:', err.message);
            }

            const plan = await generateShotPlan({
                scene, project, existingShots, kbContent,
            });

            logAIFeatureUsage(db, req.session.userId, 'shot_planning', sceneId);
            res.json({ ...plan, kbFilesUsed: ['03_Pack_Motion_Readiness.md', '03_Pack_Spatial_Composition.md', '01_Core_Realism_Principles.md'] });
        } catch (error) {
            console.error('Shot plan error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Readiness dialogue (free)
    router.post('/api/shots/:shotId/readiness-dialogue', requireAuth, async (req, res) => {
        try {
            const { shotId } = req.params;
            const { message, history } = req.body;

            if (!message) return res.status(400).json({ error: 'message required' });

            const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(shotId);
            if (!shot) return res.status(404).json({ error: 'Shot not found' });

            const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(shot.scene_id);
            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id);
            const characters = db.prepare('SELECT * FROM characters WHERE project_id = ?').all(scene.project_id);
            const objects = db.prepare('SELECT * FROM objects WHERE project_id = ?').all(scene.project_id);

            const readinessData = calculateCompleteness(project, scene, shot);

            let kbContent = '';
            try {
                const qualityKB = readKBFile('03_Pack_Image_Quality_Control.md');
                const coreKB = readKBFile('01_Core_Realism_Principles.md');
                const spatialKB = readKBFile('03_Pack_Spatial_Composition.md');
                kbContent = [qualityKB, coreKB, spatialKB].filter(Boolean).join('\n\n');
            } catch (err) {
                console.warn('[readiness-dialogue] Could not load KB:', err.message);
            }

            const result = await readinessDialogue({
                project, scene, shot, characters, objects,
                userMessage: message,
                history: history || [],
                readinessData,
                kbContent,
            });

            logAIFeatureUsage(db, req.session.userId, 'readiness_dialogue', shotId);
            res.json({ ...result, kbFilesUsed: ['03_Pack_Image_Quality_Control.md', '01_Core_Realism_Principles.md', '03_Pack_Spatial_Composition.md'] });
        } catch (error) {
            console.error('Readiness dialogue error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Backward compat alias — redirect preserving POST method
    router.post('/api/shots/:shotId/quality-dialogue', requireAuth, (req, res) => {
        res.redirect(307, req.originalUrl.replace('quality-dialogue', 'readiness-dialogue'));
    });

    // Script analysis (free)
    router.post('/api/projects/:projectId/analyze-script', requireAuth, async (req, res) => {
        try {
            const { projectId } = req.params;
            const { scriptText } = req.body;

            if (!scriptText || !scriptText.trim()) {
                return res.status(400).json({ error: 'scriptText required' });
            }

            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
            if (!project) return res.status(404).json({ error: 'Project not found' });

            let kbContent = '';
            try {
                const motionKB = readKBFile('03_Pack_Motion_Readiness.md');
                const coreKB = readKBFile('01_Core_Realism_Principles.md');
                kbContent = [motionKB, coreKB].filter(Boolean).join('\n\n');
            } catch (err) {
                console.warn('[analyze-script] Could not load KB:', err.message);
            }

            const analysis = await analyzeScript({
                scriptText, project, kbContent,
            });

            logAIFeatureUsage(db, req.session.userId, 'script_analysis', projectId);
            res.json({ ...analysis, kbFilesUsed: ['03_Pack_Motion_Readiness.md', '01_Core_Realism_Principles.md'] });
        } catch (error) {
            console.error('Script analysis error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Object suggestions (free)
    router.post('/api/projects/:projectId/object-suggestions', requireAuth, async (req, res) => {
        try {
            const { projectId } = req.params;
            const { name, description, targetModel } = req.body;

            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
            if (!project) return res.status(404).json({ error: 'Project not found' });

            let kbContent = '';
            const kbFilesUsed = [];
            try {
                const coreKB = readKBFile('01_Core_Realism_Principles.md');
                kbContent = coreKB || '';
                kbFilesUsed.push('01_Core_Realism_Principles.md');
            } catch (err) {
                console.warn('[object-suggestions] Could not load KB:', err.message);
            }

            let modelKBContent = '';
            if (targetModel) {
                try {
                    modelKBContent = loadKBForModel(targetModel);
                    kbFilesUsed.push(`model:${targetModel}`);
                } catch (err) {
                    console.warn(`[object-suggestions] Could not load model KB for ${targetModel}:`, err.message);
                }
            }

            const suggestions = await generateObjectSuggestions({
                object: { name, description },
                project,
                kbContent,
                modelKBContent,
                targetModel,
            });

            logAIFeatureUsage(db, req.session.userId, 'object_suggestions', projectId);
            res.json({ ...suggestions, kbFilesUsed });
        } catch (error) {
            console.error('Object suggestions error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Content refinement (free)
    router.post('/api/projects/:projectId/refine-content', requireAuth, async (req, res) => {
        try {
            const { projectId } = req.params;
            const { type, currentContent, message, history } = req.body;

            if (!message) return res.status(400).json({ error: 'message required' });
            if (!type || !['character', 'object'].includes(type)) return res.status(400).json({ error: 'type must be "character" or "object"' });

            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
            if (!project) return res.status(404).json({ error: 'Project not found' });

            const kbFiles = type === 'character'
                ? ['03_Pack_Character_Consistency.md', '01_Core_Realism_Principles.md']
                : ['01_Core_Realism_Principles.md'];

            let kbContent = '';
            try {
                kbContent = kbFiles.map(f => readKBFile(f)).filter(Boolean).join('\n\n');
            } catch (err) {
                console.warn('[refine-content] Could not load KB:', err.message);
            }

            const result = await refineContent({
                type, currentContent, message, history, project, kbContent,
            });

            logAIFeatureUsage(db, req.session.userId, `${type}_refinement`, projectId);
            res.json({ ...result, kbFilesUsed: kbFiles });
        } catch (error) {
            console.error('Content refinement error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Creative Director (free)
    router.post('/api/projects/:projectId/creative-director', requireAuth, async (req, res) => {
        try {
            const { projectId } = req.params;
            const { message, history, scriptContent, mode, imageUrls, imageUrl, targetModel } = req.body;

            if (!message) return res.status(400).json({ error: 'message required' });

            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
            if (!project) return res.status(404).json({ error: 'Project not found' });

            const characters = db.prepare('SELECT * FROM characters WHERE project_id = ?').all(projectId);
            const objects = db.prepare('SELECT * FROM objects WHERE project_id = ?').all(projectId);
            const scenes = db.prepare('SELECT * FROM scenes WHERE project_id = ?').all(projectId);

            let modelKBContent = '';
            let kbFilesUsed = [];
            if (targetModel) {
                try {
                    modelKBContent = loadKBForModel(targetModel);
                    kbFilesUsed.push(`model:${targetModel}`);
                } catch (err) {
                    console.warn(`[creative-director] Could not load model KB for ${targetModel}:`, err.message);
                }
            }

            // When a model is selected, loadKBForModel() already includes Core Principles,
            // Character Consistency, Quality Control, Spatial Composition, and Translation Matrix.
            // Only load packs separately when NO model is selected (to avoid duplicate content).
            let kbContent = '';
            if (!modelKBContent) {
                const coreKBFiles = [
                    '01_Core_Realism_Principles.md',
                    '03_Pack_Spatial_Composition.md',
                    '03_Pack_Image_Quality_Control.md',
                    '03_Pack_Video_Quality_Control.md',
                    '03_Pack_Character_Consistency.md',
                    '03_Pack_Motion_Readiness.md',
                ];
                try {
                    kbContent = coreKBFiles.map(f => readKBFile(f)).filter(Boolean).join('\n\n');
                    kbFilesUsed.push(...coreKBFiles);
                } catch (err) {
                    console.warn('[creative-director] Could not load KB:', err.message);
                }
            }

            const result = await creativeDirectorCollaborate({
                project, message, history, scriptContent, mode, kbContent,
                characters, objects, scenes,
                imageUrls: Array.isArray(imageUrls) ? imageUrls : (imageUrl ? [imageUrl] : []),
                targetModel, modelKBContent,
            });

            // Auto-create characters discussed in conversation
            const createdCharacters = [];
            if (result.characterCreations && Array.isArray(result.characterCreations)) {
                const existingNames = characters.map(c => c.name.toLowerCase());
                const insertChar = db.prepare(
                    'INSERT INTO characters (project_id, name, description, personality) VALUES (@projectId, @name, @description, @personality)'
                );
                for (const char of result.characterCreations) {
                    if (char.name && !existingNames.includes(char.name.toLowerCase())) {
                        try {
                            const info = insertChar.run({
                                projectId,
                                name: sanitize(char.name),
                                description: sanitize(char.description || ''),
                                personality: sanitize(char.personality || ''),
                            });
                            createdCharacters.push({ id: info.lastInsertRowid, name: char.name });
                            existingNames.push(char.name.toLowerCase());
                        } catch (err) {
                            console.warn(`[creative-director] Could not create character "${char.name}":`, err.message);
                        }
                    }
                }
            }

            // Auto-create objects discussed in conversation
            const createdObjects = [];
            if (result.objectCreations && Array.isArray(result.objectCreations)) {
                const existingObjNames = objects.map(o => o.name.toLowerCase());
                const insertObj = db.prepare(
                    'INSERT INTO objects (project_id, name, description) VALUES (@projectId, @name, @description)'
                );
                for (const obj of result.objectCreations) {
                    if (obj.name && !existingObjNames.includes(obj.name.toLowerCase())) {
                        try {
                            const info = insertObj.run({
                                projectId,
                                name: sanitize(obj.name),
                                description: sanitize(obj.description || ''),
                            });
                            createdObjects.push({ id: info.lastInsertRowid, name: obj.name });
                            existingObjNames.push(obj.name.toLowerCase());
                        } catch (err) {
                            console.warn(`[creative-director] Could not create object "${obj.name}":`, err.message);
                        }
                    }
                }
            }

            // Auto-create scenes (and their suggested shots)
            const createdScenes = [];
            if (result.sceneCreations && Array.isArray(result.sceneCreations)) {
                const existingSceneNames = scenes.map(s => s.name.toLowerCase());
                const insertScene = db.prepare(
                    `INSERT INTO scenes (project_id, name, description, order_index, location_setting, time_of_day, mood_tone, status)
                     VALUES (@projectId, @name, @description, @order_index, @location_setting, @time_of_day, @mood_tone, 'planning')`
                );
                const getMaxSceneOrder = db.prepare('SELECT MAX(order_index) as max_order FROM scenes WHERE project_id = ?');
                const insertShot = db.prepare(
                    `INSERT INTO shots (scene_id, shot_number, shot_type, camera_angle, description, notes, order_index, status)
                     VALUES (@sceneId, @shot_number, @shot_type, @camera_angle, @description, @notes, @order_index, 'planning')`
                );

                for (const scene of result.sceneCreations) {
                    if (!scene.name || existingSceneNames.includes(scene.name.toLowerCase())) continue;
                    try {
                        const maxOrder = getMaxSceneOrder.get(projectId);
                        const sceneInfo = insertScene.run({
                            projectId,
                            name: sanitize(scene.name),
                            description: sanitize(scene.description || ''),
                            order_index: (maxOrder.max_order || 0) + 1,
                            location_setting: sanitize(scene.location_setting || ''),
                            time_of_day: sanitize(scene.time_of_day || ''),
                            mood_tone: sanitize(scene.mood_tone || ''),
                        });
                        const sceneId = sceneInfo.lastInsertRowid;
                        const shotNames = [];
                        existingSceneNames.push(scene.name.toLowerCase());

                        if (scene.suggestedShots && Array.isArray(scene.suggestedShots)) {
                            for (let i = 0; i < scene.suggestedShots.length; i++) {
                                const shot = scene.suggestedShots[i];
                                try {
                                    insertShot.run({
                                        sceneId,
                                        shot_number: String(i + 1),
                                        shot_type: sanitize(shot.shot_type || 'Wide Shot'),
                                        camera_angle: sanitize(shot.camera_angle || 'Eye Level'),
                                        description: sanitize(shot.description || ''),
                                        notes: sanitize(shot.purpose || ''),
                                        order_index: i + 1,
                                    });
                                    shotNames.push(`${shot.shot_type || 'Shot'} ${i + 1}`);
                                } catch (err) {
                                    console.warn(`[creative-director] Could not create shot in scene "${scene.name}":`, err.message);
                                }
                            }
                        }
                        createdScenes.push({ id: sceneId, name: scene.name, shotCount: shotNames.length });
                    } catch (err) {
                        console.warn(`[creative-director] Could not create scene "${scene.name}":`, err.message);
                    }
                }
            }

            logAIFeatureUsage(db, req.session.userId, 'creative_director', projectId);
            res.json({ ...result, kbFilesUsed, createdCharacters, createdObjects, createdScenes });
        } catch (error) {
            console.error('Creative Director error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Conversation compaction
    router.post('/api/projects/:projectId/compact-conversation', requireAuth, async (req, res) => {
        try {
            const { projectId } = req.params;
            const { messages, scriptContent } = req.body;

            if (!messages || !Array.isArray(messages) || messages.length < 10) {
                return res.status(400).json({ error: 'Need at least 10 messages to compact' });
            }

            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
            if (!project) return res.status(404).json({ error: 'Project not found' });

            const result = await summarizeConversation({
                messages,
                scriptContent: scriptContent || '',
                projectTitle: project.title,
            });

            logAIFeatureUsage(db, req.session.userId, 'conversation_compaction', parseInt(projectId));
            res.json(result);
        } catch (error) {
            console.error('Conversation compaction error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // AI usage stats
    router.get('/api/usage/stats', requireAuth, (req, res) => {
        try {
            const stats = getAIUsageStats(db, req.session.userId);
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Generate prompt (costs 1 credit)
    router.post('/api/shots/:shotId/generate-prompt',
        requireAuth,
        checkCredits(db),
        async (req, res) => {
            try {
                const { shotId } = req.params;
                const { modelName } = req.body;
                const userId = req.session.userId;

                if (!modelName) {
                    return res.status(400).json({ error: 'modelName required' });
                }

                const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(shotId);
                if (!shot) return res.status(404).json({ error: 'Shot not found' });

                const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(shot.scene_id);
                const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id);

                if (project.user_id && project.user_id !== userId) {
                    return res.status(403).json({ error: 'Access denied' });
                }

                const allCharacters = db.prepare('SELECT * FROM characters WHERE project_id = ?').all(scene.project_id);
                const allObjects = db.prepare('SELECT * FROM objects WHERE project_id = ?').all(scene.project_id);

                // Filter to only @mentioned characters/objects (or all if no mentions)
                const { characters, objects, mentionedNames } = filterByMentions(shot, allCharacters, allObjects);
                if (mentionedNames.length > 0) {
                    console.log(`[generate-prompt] @mentions found: ${mentionedNames.join(', ')} → ${characters.length} chars, ${objects.length} objs`);
                }

                const readiness = calculateCompleteness(project, scene, shot);
                const kbContent = loadKBForModel(modelName);

                const result = await generatePrompt({
                    project, scene, shot,
                    characters, objects,
                    modelName, kbContent,
                    qualityTier: readiness.tier
                });

                const insertResult = db.prepare(`
                    INSERT INTO image_variants (shot_id, model_used, generated_prompt, status, analysis_notes)
                    VALUES (?, ?, ?, 'draft', ?)
                `).run(shotId, modelName, result.prompt, result.assumptions);

                const remainingCredits = deductCredit(db, userId, modelName, shotId);

                const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?')
                    .get(insertResult.lastInsertRowid);

                res.json({
                    ...variant,
                    readiness_tier: readiness.tier,
                    readiness_percentage: readiness.percentage,
                    quality_tier: readiness.tier,
                    quality_percentage: readiness.percentage,
                    assumptions: result.assumptions,
                    credits_remaining: remainingCredits
                });

            } catch (error) {
                console.error('--- GENERATE PROMPT ERROR ---');
                console.error('Message:', error.message);
                console.error('Stack:', error.stack);
                console.error('GEMINI_API_KEY set:', !!process.env.GEMINI_API_KEY);
                console.error('Model requested:', req.body.modelName);
                console.error('----------------------------');
                res.status(500).json({ error: error.message });
            }
        }
    );

    // Get variants
    router.get('/api/shots/:shotId/variants', requireAuth, (req, res) => {
        try {
            const variants = db.prepare('SELECT * FROM image_variants WHERE shot_id = ? ORDER BY created_at DESC')
                .all(req.params.shotId);
            res.json(variants);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Update variant
    router.put('/api/variants/:id', requireAuth, (req, res) => {
        try {
            const { user_edited_prompt, status } = req.body;
            const updates = [];
            const values = [];

            if (user_edited_prompt !== undefined) {
                updates.push('user_edited_prompt = ?');
                values.push(user_edited_prompt);
            }

            if (status !== undefined) {
                updates.push('status = ?');
                values.push(status);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            values.push(req.params.id);
            db.prepare(`UPDATE image_variants SET ${updates.join(', ')} WHERE id = ?`).run(...values);

            const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(req.params.id);
            res.json(variant);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Refine prompt from audit (costs 1 credit)
    router.post('/api/variants/:variantId/refine-prompt', requireAuth, checkCredits(db), async (req, res) => {
        try {
            const { variantId } = req.params;
            const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
            if (!variant) return res.status(404).json({ error: 'Variant not found' });

            if (!variant.audit_data) {
                return res.status(400).json({ error: 'Run an audit first before refining the prompt' });
            }

            let auditResult;
            try {
                auditResult = JSON.parse(variant.audit_data);
            } catch {
                return res.status(400).json({ error: 'Invalid audit data. Run a new audit first.' });
            }

            const originalPrompt = variant.generated_prompt || variant.prompt_used || '';
            if (!originalPrompt) {
                return res.status(400).json({ error: 'No original prompt found on this variant' });
            }

            const modelName = variant.model_used || 'unknown';

            const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(variant.shot_id);
            const scene = shot ? db.prepare('SELECT * FROM scenes WHERE id = ?').get(shot.scene_id) : null;
            const project = scene ? db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id) : null;
            const allChars = project ? db.prepare('SELECT * FROM characters WHERE project_id = ?').all(project.id) : [];
            const allObjs = project ? db.prepare('SELECT * FROM objects WHERE project_id = ?').all(project.id) : [];

            // Filter to @mentioned characters/objects for targeted refinement
            const { characters, objects } = filterByMentions(shot, allChars, allObjs);

            let modelKBContent = '';
            try {
                modelKBContent = loadKBForModel(modelName);
            } catch (err) {
                console.warn(`[refine-prompt] Could not load model KB for ${modelName}:`, err.message);
            }

            const result = await refinePromptFromAudit({
                originalPrompt,
                auditResult,
                modelName,
                modelKBContent,
                project,
                scene,
                shot,
                characters,
                objects,
            });

            db.prepare('UPDATE image_variants SET user_edited_prompt = ? WHERE id = ?')
                .run(result.refined_prompt, variantId);

            deductCredit(db, req.session.userId, 'prompt_refinement', variant.shot_id);
            logAIFeatureUsage(db, req.session.userId, 'prompt_refinement', variant.shot_id);

            const updatedVariant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
            res.json({
                refined_prompt: result.refined_prompt,
                reference_strategy: result.reference_strategy,
                variant: updatedVariant,
            });
        } catch (error) {
            console.error('Prompt refinement error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Delete variant
    router.delete('/api/variants/:id', requireAuth, (req, res) => {
        try {
            db.prepare('DELETE FROM image_variants WHERE id = ?').run(req.params.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
