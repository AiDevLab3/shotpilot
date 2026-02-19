/**
 * Cine-AI Prompt Compiler — API Server
 * 
 * Endpoints:
 *   POST /compile         — Compile a creative brief → model-specific prompt
 *   POST /compile/multi   — Compile same brief for multiple models
 *   POST /audit           — Audit a generated image against its brief
 *   POST /generate        — Compile + generate image (end-to-end)
 *   GET  /models          — List available models with capabilities
 *   GET  /health          — Health check
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { compile, compileMulti } from './compiler.js';
import { auditImage } from './audit.js';
import { generateImage } from './gemini.js';
import { recommendModel, listModels } from './model-router.js';

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// ── Health ───────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'cine-ai-compiler', version: '0.1.0' });
});

// ── Models ───────────────────────────────────────────────────────────

app.get('/models', (req, res) => {
  res.json(listModels());
});

app.post('/models/recommend', (req, res) => {
  try {
    const { brief, currentModel, currentScore, availableModels } = req.body;
    if (!brief) return res.status(400).json({ error: 'brief is required' });
    
    const result = recommendModel(brief, { currentModel, currentScore, availableModels });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Compile ──────────────────────────────────────────────────────────

app.post('/compile', async (req, res) => {
  try {
    const { brief, targetModel } = req.body;
    if (!brief?.description) return res.status(400).json({ error: 'brief.description is required' });
    if (!targetModel) return res.status(400).json({ error: 'targetModel is required' });

    const result = await compile(brief, targetModel);
    res.json(result);
  } catch (err) {
    console.error('[compile]', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/compile/multi', async (req, res) => {
  try {
    const { brief, targetModels } = req.body;
    if (!brief?.description) return res.status(400).json({ error: 'brief.description is required' });
    if (!targetModels?.length) return res.status(400).json({ error: 'targetModels array is required' });

    const results = await compileMulti(brief, targetModels);
    res.json(results);
  } catch (err) {
    console.error('[compile/multi]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Generate (compile + image gen) ───────────────────────────────────

app.post('/generate', async (req, res) => {
  try {
    const { brief, targetModel } = req.body;
    if (!brief?.description) return res.status(400).json({ error: 'brief.description is required' });

    // Use specified model or auto-recommend
    const model = targetModel || recommendModel(brief).recommended;
    
    // Step 1: Compile
    const compiled = await compile(brief, model);
    
    // Step 2: Generate
    const image = await generateImage(compiled.prompt);
    
    res.json({
      prompt: compiled.prompt,
      assumptions: compiled.assumptions,
      model: compiled.model,
      image: {
        data: image.buffer.toString('base64'),
        mimeType: image.mimeType,
      },
      textResponse: image.textResponse,
    });
  } catch (err) {
    console.error('[generate]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Audit ────────────────────────────────────────────────────────────

app.post('/audit', async (req, res) => {
  try {
    const { image, mimeType, brief, modelUsed } = req.body;
    if (!image) return res.status(400).json({ error: 'image (base64) is required' });
    if (!brief) return res.status(400).json({ error: 'brief is required' });

    const buffer = Buffer.from(image, 'base64');
    const result = await auditImage(buffer, mimeType || 'image/jpeg', brief, modelUsed || 'unknown');
    res.json(result);
  } catch (err) {
    console.error('[audit]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Full Pipeline (compile → generate → audit) ──────────────────────

app.post('/pipeline', async (req, res) => {
  try {
    const { brief, targetModel, maxIterations = 3 } = req.body;
    if (!brief?.description) return res.status(400).json({ error: 'brief.description is required' });

    const model = targetModel || recommendModel(brief).recommended;
    const iterations = [];
    let currentPrompt = null;

    for (let i = 0; i < Math.min(maxIterations, 5); i++) {
      // Compile (or refine)
      const compiled = await compile(brief, model);
      currentPrompt = compiled.prompt;

      // Generate
      const image = await generateImage(currentPrompt);

      // Audit
      const audit = await auditImage(image.buffer, image.mimeType, brief, model);

      iterations.push({
        iteration: i + 1,
        prompt: currentPrompt,
        score: audit.overall_score,
        recommendation: audit.recommendation,
        dimensions: audit.dimensions,
        routing: audit.routing,
        summary: audit.summary,
        image: {
          data: image.buffer.toString('base64'),
          mimeType: image.mimeType,
        },
      });

      // Stop conditions
      if (audit.recommendation === 'ACCEPT') break;
      if (audit.recommendation === 'SWITCH_MODEL') {
        iterations[iterations.length - 1].switchSuggestion = audit.routing;
        break;
      }

      // Feed audit back into brief for next iteration
      if (audit.prompt_fixes?.length) {
        brief.constraints = (brief.constraints || '') + '\n' + audit.prompt_fixes.join('\n');
      }
    }

    res.json({
      model,
      iterations,
      bestScore: Math.max(...iterations.map(i => i.score)),
      finalRecommendation: iterations[iterations.length - 1].recommendation,
    });
  } catch (err) {
    console.error('[pipeline]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Start ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🎬 Cine-AI Prompt Compiler v0.1.0`);
  console.log(`📡 API running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /compile        — Brief → model-specific prompt`);
  console.log(`  POST /compile/multi  — Brief → multiple model prompts`);
  console.log(`  POST /generate       — Brief → prompt + generated image`);
  console.log(`  POST /audit          — Image + brief → quality audit`);
  console.log(`  POST /pipeline       — Full loop: compile → generate → audit`);
  console.log(`  POST /models/recommend — Brief → best model recommendation`);
  console.log(`  GET  /models         — List all models`);
  console.log(`  GET  /health         — Health check\n`);
});

export { app };
