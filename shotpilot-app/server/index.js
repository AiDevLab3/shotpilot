import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, initDatabase } from './database.js';
import { setupAuth, requireAuth, checkCredits } from './middleware/auth.js';
import { deductCredit, getUserCredits, getUsageStats, logAIFeatureUsage, getAIUsageStats } from './services/creditService.js';
import { loadKBForModel, getAvailableModels, readKBFile } from './services/kbLoader.js';
import { calculateCompleteness, checkReadinessWithKB } from './services/qualityCheck.js';
import { generateRecommendations, generatePrompt, analyzeReadiness, generateAestheticSuggestions, generateCharacterSuggestions, generateShotPlan, readinessDialogue, analyzeScript, generateObjectSuggestions, refineContent, creativeDirectorCollaborate, summarizeConversation, holisticImageAudit, refinePromptFromAudit } from './services/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir, limits: { fileSize: 25 * 1024 * 1024 } });

console.log("Initializing database...");
initDatabase();
console.log("Database initialized. Starting server middleware...");

// Middleware


// Setup authentication
setupAuth(app);

// MVP Auto-auth: if no session, auto-login as test user
// This eliminates 401 errors without needing any frontend login flow
app.use((req, res, next) => {
    if (!req.session.userId) {
        const testUser = db.prepare('SELECT id FROM users WHERE email = ?').get('test@shotpilot.com');
        if (testUser) {
            req.session.userId = testUser.id;
            console.log('[AUTO-AUTH] Auto-authenticated request as test user (id:', testUser.id, ')');
        }
    }
    next();
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- HEALTH CHECK ---
// Quick Gemini API validation: GET /api/health/gemini
app.get('/api/health/gemini', async (req, res) => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

    if (!GEMINI_API_KEY) {
        return res.json({ ok: false, error: 'GEMINI_API_KEY not set in .env' });
    }

    try {
        const { default: fetch } = await import('node-fetch');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Say "OK" in one word.' }] }],
                generationConfig: { maxOutputTokens: 10 }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.json({ ok: false, model: GEMINI_MODEL, status: response.status, error: errText });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        res.json({ ok: true, model: GEMINI_MODEL, response: text.trim() });
    } catch (error) {
        res.json({ ok: false, model: GEMINI_MODEL, error: error.message });
    }
});

// --- AUTH ROUTES ---

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // MVP: Simple check (In production use bcrypt.compare)
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Password check skipped for MVP as per instructions (or check if user exists)
    // Logic: if user exists, log them in. 

    req.session.userId = user.id;
    res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            credits: user.credits,
            tier: user.tier
        }
    });
});

// Get current user session
app.get('/api/auth/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = db.prepare('SELECT id, email, credits, tier FROM users WHERE id = ?')
        .get(req.session.userId);

    res.json(user);
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get user credits
app.get('/api/user/credits', requireAuth, (req, res) => {
    try {
        const credits = getUserCredits(db, req.session.userId);
        res.json(credits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get usage stats
app.get('/api/user/usage', requireAuth, (req, res) => {
    try {
        const stats = getUsageStats(db, req.session.userId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- AI & MODELS ---

// Get available models
app.get('/api/models', (req, res) => {
    try {
        res.json(getAvailableModels());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check prompt readiness — uses KB-guided analysis when available, falls back to basic scoring
// Measures how completely a shot is defined for prompt generation (field completeness, NOT image quality)
app.post('/api/shots/:shotId/check-readiness', requireAuth, async (req, res) => {
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

// Backward compat alias — old clients may still call check-quality
app.post('/api/shots/:shotId/check-quality', requireAuth, (req, res) => {
    req.url = req.url.replace('check-quality', 'check-readiness');
    app.handle(req, res);
});

// Get recommendations (free - no credit cost) — now includes KB context
app.post('/api/shots/:shotId/get-recommendations', requireAuth, async (req, res) => {
    try {
        const { shotId } = req.params;
        const { missingFields } = req.body;

        const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(shotId);
        if (!shot) return res.status(404).json({ error: 'Shot not found' });

        const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(shot.scene_id);
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id);

        // Load KB content for context-aware recommendations
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

// Get aesthetic suggestions for a project (free - no credit cost)
app.post('/api/projects/:projectId/aesthetic-suggestions', requireAuth, async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const scenes = db.prepare('SELECT * FROM scenes WHERE project_id = ? ORDER BY order_index ASC').all(projectId);

        // Load KB content for context-aware suggestions
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

// Phase 3.2: Character AI assistant (free - no credit cost)
app.post('/api/projects/:projectId/character-suggestions', requireAuth, async (req, res) => {
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

// Phase 3.3: Scene shot planning (free - no credit cost)
app.post('/api/scenes/:sceneId/shot-plan', requireAuth, async (req, res) => {
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

// Phase 3.4: Prompt readiness dialogue (free - no credit cost)
app.post('/api/shots/:shotId/readiness-dialogue', requireAuth, async (req, res) => {
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

        // Get current readiness data
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

// Backward compat alias
app.post('/api/shots/:shotId/quality-dialogue', requireAuth, (req, res) => {
    req.url = req.url.replace('quality-dialogue', 'readiness-dialogue');
    app.handle(req, res);
});

// Phase 3.5: Script analysis (free - no credit cost)
app.post('/api/projects/:projectId/analyze-script', requireAuth, async (req, res) => {
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

// Phase 3.6: Object AI assistant (free - no credit cost)
app.post('/api/projects/:projectId/object-suggestions', requireAuth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body;

        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        let kbContent = '';
        try {
            const coreKB = readKBFile('01_Core_Realism_Principles.md');
            kbContent = coreKB || '';
        } catch (err) {
            console.warn('[object-suggestions] Could not load KB:', err.message);
        }

        const suggestions = await generateObjectSuggestions({
            object: { name, description },
            project,
            kbContent,
        });

        logAIFeatureUsage(db, req.session.userId, 'object_suggestions', projectId);
        res.json({ ...suggestions, kbFilesUsed: ['01_Core_Realism_Principles.md'] });
    } catch (error) {
        console.error('Object suggestions error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Character/Object refinement (conversational) (free - no credit cost)
app.post('/api/projects/:projectId/refine-content', requireAuth, async (req, res) => {
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

// Creative Director collaborative workspace (free - no credit cost)
app.post('/api/projects/:projectId/creative-director', requireAuth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { message, history, scriptContent, mode, imageUrl, targetModel } = req.body;

        if (!message) return res.status(400).json({ error: 'message required' });

        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        // Load full project context: characters, objects, scenes
        const characters = db.prepare('SELECT * FROM characters WHERE project_id = ?').all(projectId);
        const objects = db.prepare('SELECT * FROM objects WHERE project_id = ?').all(projectId);
        const scenes = db.prepare('SELECT * FROM scenes WHERE project_id = ?').all(projectId);

        // Load model-specific KB if a target model is selected
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

        // Also load core KB packs
        const coreKBFiles = [
            '01_Core_Realism_Principles.md',
            '03_Pack_Spatial_Composition.md',
            '03_Pack_Image_Quality_Control.md',
            '03_Pack_Video_Quality_Control.md',
            '03_Pack_Character_Consistency.md',
            '03_Pack_Motion_Readiness.md',
        ];

        let kbContent = '';
        try {
            kbContent = coreKBFiles.map(f => readKBFile(f)).filter(Boolean).join('\n\n');
            kbFilesUsed.push(...coreKBFiles);
        } catch (err) {
            console.warn('[creative-director] Could not load KB:', err.message);
        }

        const result = await creativeDirectorCollaborate({
            project, message, history, scriptContent, mode, kbContent,
            characters, objects, scenes, imageUrl,
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

        // Auto-create scenes (and their suggested shots) discussed in conversation
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

                    // Create suggested shots inside the scene
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
        res.json({ ...result, kbFilesUsed, createdCharacters, createdScenes });
    } catch (error) {
        console.error('Creative Director error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Conversation compaction — summarize older messages to reduce token usage
app.post('/api/projects/:projectId/compact-conversation', requireAuth, async (req, res) => {
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

// Phase 3.7: Comprehensive AI usage tracking
app.get('/api/usage/stats', requireAuth, (req, res) => {
    try {
        const stats = getAIUsageStats(db, req.session.userId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate prompt (costs 1 credit) — FIX 3: complete context, FIX 4: multimodal
app.post('/api/shots/:shotId/generate-prompt',
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

            // FIX 3: Query ALL data — complete shot, scene, project context
            const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(shotId);
            if (!shot) return res.status(404).json({ error: 'Shot not found' });

            const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(shot.scene_id);
            const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id);

            // Verify ownership (if project user_id set)
            if (project.user_id && project.user_id !== userId) {
                return res.status(403).json({ error: 'Access denied' });
            }

            // FIX 3: Query characters and objects for the project
            const characters = db.prepare('SELECT * FROM characters WHERE project_id = ?').all(scene.project_id);
            const objects = db.prepare('SELECT * FROM objects WHERE project_id = ?').all(scene.project_id);

            // Check prompt readiness (basic fast check for tier determination)
            const readiness = calculateCompleteness(project, scene, shot);

            // Load KB
            const kbContent = loadKBForModel(modelName);

            // FIX 3+4: Generate with Gemini — full context + characters + objects + reference images
            const result = await generatePrompt({
                project, scene, shot,
                characters, objects,
                modelName, kbContent,
                qualityTier: readiness.tier
            });

            // Save variant
            const insertResult = db.prepare(`
        INSERT INTO image_variants (shot_id, model_used, generated_prompt, status, analysis_notes)
        VALUES (?, ?, ?, 'draft', ?)
      `).run(shotId, modelName, result.prompt, result.assumptions);

            // DEDUCT CREDIT
            const remainingCredits = deductCredit(db, userId, modelName, shotId);

            const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?')
                .get(insertResult.lastInsertRowid);

            res.json({
                ...variant,
                readiness_tier: readiness.tier,
                readiness_percentage: readiness.percentage,
                // Backward compat
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

// Get variants (Updated for new endpoint)
app.get('/api/shots/:shotId/variants', requireAuth, (req, res) => {
    try {
        const variants = db.prepare('SELECT * FROM image_variants WHERE shot_id = ? ORDER BY created_at DESC')
            .all(req.params.shotId);
        res.json(variants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update variant
app.put('/api/variants/:id', requireAuth, (req, res) => {
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

// AI-powered prompt refinement based on audit results
app.post('/api/variants/:variantId/refine-prompt', requireAuth, checkCredits(db), async (req, res) => {
    try {
        const { variantId } = req.params;
        const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
        if (!variant) return res.status(404).json({ error: 'Variant not found' });

        // Must have audit data to refine
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

        // Load context
        const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(variant.shot_id);
        const scene = shot ? db.prepare('SELECT * FROM scenes WHERE id = ?').get(shot.scene_id) : null;
        const project = scene ? db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id) : null;
        const characters = project ? db.prepare('SELECT * FROM characters WHERE project_id = ?').all(project.id) : [];
        const objects = project ? db.prepare('SELECT * FROM objects WHERE project_id = ?').all(project.id) : [];

        // Load model-specific KB
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

        // Save the refined prompt as user_edited_prompt
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
app.delete('/api/variants/:id', requireAuth, (req, res) => {
    try {
        db.prepare('DELETE FROM image_variants WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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

// ============================================================
// HOLISTIC IMAGE AUDIT — The real quality analysis system
// Analyzes actual images across 6 cinematic dimensions
// ============================================================

// Upload image to an existing variant and optionally run audit
app.post('/api/variants/:variantId/upload-image', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const { variantId } = req.params;
        const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
        if (!variant) return res.status(404).json({ error: 'Variant not found' });

        if (!req.file) return res.status(400).json({ error: 'No image file provided' });

        const relativePath = `/uploads/images/${req.file.filename}`;
        db.prepare('UPDATE image_variants SET image_url = ? WHERE id = ?').run(relativePath, variantId);

        res.json({ image_url: relativePath, variant_id: variantId });
    } catch (error) {
        console.error('Variant image upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Run holistic image audit on a variant's uploaded image
app.post('/api/variants/:variantId/audit', requireAuth, checkCredits(db), async (req, res) => {
    try {
        const { variantId } = req.params;
        const variant = db.prepare('SELECT * FROM image_variants WHERE id = ?').get(variantId);
        if (!variant) return res.status(404).json({ error: 'Variant not found' });
        if (!variant.image_url) return res.status(400).json({ error: 'No image uploaded for this variant. Upload an image first.' });

        // Resolve image path
        const imagePath = variant.image_url.startsWith('/')
            ? path.join(__dirname, '..', variant.image_url)
            : variant.image_url;

        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Image file not found on disk' });
        }

        const imageBuffer = fs.readFileSync(imagePath);

        // Detect MIME type
        let mimeType = 'image/jpeg';
        const ext = path.extname(imagePath).toLowerCase();
        if (ext) {
            const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
            mimeType = mimeMap[ext] || 'image/jpeg';
        } else {
            if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) mimeType = 'image/png';
            else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) mimeType = 'image/gif';
            else if (imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49) mimeType = 'image/webp';
        }

        // Load context
        const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(variant.shot_id);
        const scene = shot ? db.prepare('SELECT * FROM scenes WHERE id = ?').get(shot.scene_id) : null;
        const project = scene ? db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id) : null;
        const characters = project ? db.prepare('SELECT * FROM characters WHERE project_id = ?').all(project.id) : [];
        const objects = project ? db.prepare('SELECT * FROM objects WHERE project_id = ?').all(project.id) : [];

        // Load KB: Image QC pack + core principles + model-specific guide
        let kbContent = '';
        try {
            const qualityKB = readKBFile('03_Pack_Image_Quality_Control.md');
            const coreKB = readKBFile('01_Core_Realism_Principles.md');
            let modelKB = null;
            if (variant.model_used) {
                try {
                    modelKB = loadKBForModel(variant.model_used);
                } catch (e) {
                    console.warn(`[audit] Could not load model KB for ${variant.model_used}:`, e.message);
                }
            }
            kbContent = [qualityKB, coreKB, modelKB].filter(Boolean).join('\n\n');
        } catch (err) {
            console.warn('[audit] Could not load KB:', err.message);
        }

        // Run the audit
        const auditResult = await holisticImageAudit({
            imageBuffer,
            mimeType,
            project,
            scene,
            shot,
            characters,
            objects,
            kbContent,
        });

        // Persist audit results
        db.prepare(`
            UPDATE image_variants
            SET audit_score = ?, audit_recommendation = ?, audit_data = ?
            WHERE id = ?
        `).run(
            auditResult.overall_score,
            auditResult.recommendation,
            JSON.stringify(auditResult),
            variantId
        );

        deductCredit(db, req.session.userId, 'image_audit', variant.shot_id);
        logAIFeatureUsage(db, req.session.userId, 'holistic_image_audit', variant.shot_id);

        res.json(auditResult);
    } catch (error) {
        console.error('Holistic image audit error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get stored audit results for a variant
app.get('/api/variants/:variantId/audit', requireAuth, (req, res) => {
    try {
        const { variantId } = req.params;
        const variant = db.prepare('SELECT audit_score, audit_recommendation, audit_data FROM image_variants WHERE id = ?').get(variantId);
        if (!variant) return res.status(404).json({ error: 'Variant not found' });

        if (!variant.audit_data) {
            return res.json({ audited: false });
        }

        const auditResult = JSON.parse(variant.audit_data);
        res.json({ audited: true, ...auditResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Audit a standalone image (not tied to a variant) — for character/object reference images
app.post('/api/audit-image', requireAuth, checkCredits(db), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image file provided' });

        const { projectId, context_type } = req.body; // context_type: 'character' | 'object' | 'general'

        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);

        // Detect MIME type
        let mimeType = 'image/jpeg';
        if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) mimeType = 'image/png';
        else if (imageBuffer[0] === 0x47 && imageBuffer[1] === 0x49) mimeType = 'image/gif';
        else if (imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49) mimeType = 'image/webp';

        // Load project context if provided
        let project = null, characters = [], objects = [];
        if (projectId) {
            project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
            if (project) {
                characters = db.prepare('SELECT * FROM characters WHERE project_id = ?').all(projectId);
                objects = db.prepare('SELECT * FROM objects WHERE project_id = ?').all(projectId);
            }
        }

        let kbContent = '';
        try {
            const qualityKB = readKBFile('03_Pack_Image_Quality_Control.md');
            const coreKB = readKBFile('01_Core_Realism_Principles.md');
            kbContent = [qualityKB, coreKB].filter(Boolean).join('\n\n');
        } catch (err) {
            console.warn('[audit-image] Could not load KB:', err.message);
        }

        const auditResult = await holisticImageAudit({
            imageBuffer,
            mimeType,
            project,
            scene: null,
            shot: null,
            characters,
            objects,
            kbContent,
        });

        deductCredit(db, req.session.userId, 'image_audit');
        logAIFeatureUsage(db, req.session.userId, 'holistic_image_audit_standalone');

        res.json(auditResult);
    } catch (error) {
        console.error('Standalone image audit error:', error);
        res.status(500).json({ error: error.message });
    }
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

app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
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
    try {
        const { id } = req.params;
        const startTime = Date.now();

        // Fetch context once
        const shots = db.prepare('SELECT * FROM shots WHERE scene_id = ? ORDER BY order_index ASC, id ASC').all(id);
        const scene = db.prepare('SELECT * FROM scenes WHERE id = ?').get(id);
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(scene.project_id);

        // Calculate prompt readiness for each shot
        const shotsWithReadiness = shots.map(shot => {
            try {
                const readiness = calculateCompleteness(project, scene, shot);
                return {
                    ...shot,
                    readiness_tier: readiness.tier,
                    readiness_percentage: readiness.percentage,
                    // Backward compat
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

app.delete('/api/shots/:id', (req, res) => {
    const { id } = req.params;

    // Get the shot to be deleted to know its order/number
    const shot = db.prepare('SELECT * FROM shots WHERE id = ?').get(id);

    if (shot) {
        const deleteTransaction = db.transaction(() => {
            // 1. Delete the shot
            db.prepare('DELETE FROM shots WHERE id = ?').run(id);

            // 2. Get remaining shots in this scene ordered by order_index
            const remainingShots = db.prepare('SELECT id, shot_number, order_index FROM shots WHERE scene_id = ? ORDER BY order_index ASC').all(shot.scene_id);

            // 3. Renumber them sequentially
            let cleanIndex = 1;
            for (const s of remainingShots) {
                const numericNum = parseInt(s.shot_number);

                // Determine new shot Number (only if it was numeric)
                let newShotNumber = s.shot_number;
                if (!isNaN(numericNum) && String(numericNum) === String(s.shot_number)) {
                    newShotNumber = String(cleanIndex);
                }

                // Update if changed
                if (s.order_index !== cleanIndex || s.shot_number !== newShotNumber) {
                    db.prepare('UPDATE shots SET order_index = ?, shot_number = ? WHERE id = ?')
                        .run(cleanIndex, newShotNumber, s.id);
                }
                cleanIndex++;
            }
        });

        deleteTransaction();
    } else {
        // Just try delete if not found (idempotent-ish) or 404
        db.prepare('DELETE FROM shots WHERE id = ?').run(id);
    }

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

// Only listen when run directly (not imported for testing)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export { app };
