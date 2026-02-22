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
import { generateRecommendations, generatePrompt, analyzeReadiness, generateAestheticSuggestions, generateCharacterSuggestions, generateShotPlan, readinessDialogue, analyzeScript, generateObjectSuggestions, generateTurnaroundPrompt, refineContent, creativeDirectorCollaborate, summarizeConversation, holisticImageAudit, refinePromptFromAudit, analyzeEntityImage } from './services/geminiService.js';

// Route modules
import createAuthRoutes from './routes/auth.js';
import createAIRoutes from './routes/ai.js';
import createProjectRoutes from './routes/projects.js';
import createCharacterRoutes from './routes/characters.js';
import createObjectRoutes from './routes/objects.js';
import createSceneRoutes from './routes/scenes.js';
import createShotRoutes from './routes/shots.js';
import createImageRoutes from './routes/images.js';
import createConversationRoutes from './routes/conversations.js';
import createGenerationRoutes from './routes/generations.js';
import createAgentRoutes from './routes/agents.js';
import createAssetRoutes from './routes/assets.js';
import createCostRoutes from './routes/costs.js';
import analyzeRouter from './routes/analyze.js';
import generateRouter from './routes/generate.js';
import upscaleRouter from './routes/upscale.js';
import v2modelsRouter from './routes/v2models.js';
import v2promptRouter from './routes/v2prompt.js';
import v2videoRouter from './routes/v2video.js';

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

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- HEALTH CHECK ---
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

// --- SHARED UTILITY ---
const sanitize = (val) => val === undefined ? null : val;

// --- MOUNT ROUTE MODULES ---

app.use(createAuthRoutes({
    db, requireAuth, getUserCredits, getUsageStats,
}));

app.use(createAIRoutes({
    db, requireAuth, checkCredits, sanitize,
    loadKBForModel, getAvailableModels, readKBFile,
    calculateCompleteness, checkReadinessWithKB,
    generateRecommendations, generatePrompt, generateAestheticSuggestions,
    generateCharacterSuggestions, generateShotPlan, readinessDialogue,
    analyzeScript, generateObjectSuggestions, generateTurnaroundPrompt, refineContent,
    creativeDirectorCollaborate, summarizeConversation, refinePromptFromAudit,
    deductCredit, logAIFeatureUsage, getAIUsageStats,
}));

app.use(createProjectRoutes({ db, sanitize }));
app.use(createCharacterRoutes({ db, sanitize }));
app.use(createObjectRoutes({ db, sanitize }));
app.use(createSceneRoutes({ db, sanitize }));
app.use(createShotRoutes({ db, sanitize, calculateCompleteness }));

app.use(createImageRoutes({
    db, requireAuth, checkCredits, upload,
    holisticImageAudit, loadKBForModel, readKBFile,
    deductCredit, logAIFeatureUsage,
}));
app.use(createConversationRoutes({ db, requireAuth }));
app.use(createGenerationRoutes({ db, sanitize, analyzeEntityImage, loadKBForModel, readKBFile }));
app.use(createAgentRoutes());
app.use(createAssetRoutes());
app.use(createCostRoutes());

// V2 unified routes
app.use(analyzeRouter);
app.use(generateRouter);
app.use(upscaleRouter);
app.use(v2modelsRouter);
app.use(v2promptRouter);
app.use(v2videoRouter);

// Only listen when run directly (not imported for testing)
if (process.env.NODE_ENV !== 'test') {
    const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
    const server = app.listen(PORT, BIND_HOST, () => {
        console.log(`Server running on http://${BIND_HOST}:${PORT}`);
        if (BIND_HOST === '0.0.0.0') {
            console.log(`  Tailscale: http://100.105.103.35:${PORT}`);
        }
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n❌ Port ${PORT} is already in use. Kill the stale process:\n   npx kill-port ${PORT}\n`);
        } else {
            console.error('Server error:', err);
        }
        process.exit(1);
    });
}

export { app };
