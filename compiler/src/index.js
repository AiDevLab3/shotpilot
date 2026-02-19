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
import { compile, compileMulti, refine } from './compiler.js';
import { auditImage } from './audit.js';
import { generateImage } from './gemini.js';
import { recommendModel, listModels, routeGeneration, getAvailableApiModels } from './model-router.js';
import { listStyles, getStyle, createStyle, updateStyle, deleteStyle } from './style-manager.js';

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// ── Health ───────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'cine-ai-compiler', version: '0.3.0' });
});

// ── Models ───────────────────────────────────────────────────────────

app.get('/models', (req, res) => {
  const all = listModels();
  const available = getAvailableApiModels();
  res.json({ all, available });
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
    
    // Step 2: Generate — route to correct provider
    const image = await routeGeneration(compiled.model, compiled.prompt);
    
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

// ── Refine ───────────────────────────────────────────────────────────

app.post('/refine', async (req, res) => {
  try {
    const { brief, image, mimeType, targetModel, currentPrompt } = req.body;
    if (!brief?.description) return res.status(400).json({ error: 'brief.description is required' });
    if (!image) return res.status(400).json({ error: 'image (base64) is required' });

    const model = targetModel || recommendModel(brief).recommended;

    // Step 1: Audit the image
    const buffer = Buffer.from(image, 'base64');
    const auditResult = await auditImage(buffer, mimeType || 'image/jpeg', brief, model);

    // Step 2: Refine based on audit
    const promptToRefine = currentPrompt || '(no previous prompt provided)';
    const refined = await refine({
      currentPrompt: promptToRefine,
      auditResult,
      brief,
      targetModel: model,
    });

    res.json({
      audit: auditResult,
      refined: refined,
      model,
    });
  } catch (err) {
    console.error('[refine]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Auto Pipeline (compile → generate → audit → refine loop) ────────

app.post('/pipeline/auto', async (req, res) => {
  try {
    const { brief, targetModel } = req.body;
    if (!brief?.description) return res.status(400).json({ error: 'brief.description is required' });

    const model = targetModel || recommendModel(brief).recommended;
    const iterations = [];
    let currentPrompt = null;
    let previousScore = 0;

    const MAX_ITERATIONS = 3;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      // Compile (first iteration) or use refined prompt (subsequent)
      if (!currentPrompt) {
        const compiled = await compile(brief, model);
        currentPrompt = compiled.prompt;
      }

      // Generate — route to correct provider
      const image = await routeGeneration(model, currentPrompt);

      // Audit
      const audit = await auditImage(image.buffer, image.mimeType, brief, model);

      const iteration = {
        iteration: i + 1,
        prompt: currentPrompt,
        score: audit.overall_score,
        recommendation: audit.recommendation,
        dimensions: audit.dimensions,
        issues: audit.issues,
        prompt_fixes: audit.prompt_fixes,
        routing: audit.routing,
        summary: audit.summary,
        image: { data: image.buffer.toString('base64'), mimeType: image.mimeType },
      };
      iterations.push(iteration);

      // Exit condition 1: score >= 90
      if (audit.overall_score >= 90) {
        iteration.exitReason = 'score_threshold_met';
        break;
      }

      // Exit condition 2: score didn't improve by >= 3 points
      if (i > 0 && audit.overall_score - previousScore < 3) {
        iteration.exitReason = 'insufficient_improvement';
        break;
      }

      // Exit condition 3: model switch recommended
      if (audit.recommendation === 'SWITCH_MODEL') {
        iteration.exitReason = 'switch_model_recommended';
        iteration.switchSuggestion = audit.routing;
        break;
      }

      // Exit condition 4: last iteration
      if (i === MAX_ITERATIONS - 1) {
        iteration.exitReason = 'max_iterations_reached';
        break;
      }

      previousScore = audit.overall_score;

      // Refine for next iteration — anchored to original brief
      const refined = await refine({
        currentPrompt,
        auditResult: audit,
        brief,
        targetModel: model,
      });
      currentPrompt = refined.prompt;
      iteration.refinementChanges = refined.changes;
    }

    const scores = iterations.map(i => i.score);
    res.json({
      model,
      totalIterations: iterations.length,
      iterations,
      bestScore: Math.max(...scores),
      scoreProgression: scores,
      finalRecommendation: iterations[iterations.length - 1].recommendation,
      exitReason: iterations[iterations.length - 1].exitReason,
    });
  } catch (err) {
    console.error('[pipeline/auto]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Legacy Pipeline (kept for backwards compatibility) ───────────────

app.post('/pipeline', async (req, res) => {
  try {
    const { brief, targetModel, maxIterations = 3 } = req.body;
    if (!brief?.description) return res.status(400).json({ error: 'brief.description is required' });

    const model = targetModel || recommendModel(brief).recommended;
    const iterations = [];
    let currentPrompt = null;

    for (let i = 0; i < Math.min(maxIterations, 5); i++) {
      const compiled = await compile(brief, model);
      currentPrompt = compiled.prompt;
      const image = await routeGeneration(model, currentPrompt);
      const audit = await auditImage(image.buffer, image.mimeType, brief, model);

      iterations.push({
        iteration: i + 1,
        prompt: currentPrompt,
        score: audit.overall_score,
        recommendation: audit.recommendation,
        dimensions: audit.dimensions,
        routing: audit.routing,
        summary: audit.summary,
        image: { data: image.buffer.toString('base64'), mimeType: image.mimeType },
      });

      if (audit.recommendation === 'ACCEPT') break;
      if (audit.recommendation === 'SWITCH_MODEL') {
        iterations[iterations.length - 1].switchSuggestion = audit.routing;
        break;
      }
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

// ── Style Profiles ───────────────────────────────────────────────────

app.get('/styles', (req, res) => {
  res.json(listStyles());
});

app.get('/styles/:id', (req, res) => {
  const style = getStyle(req.params.id);
  if (!style) return res.status(404).json({ error: 'Style not found' });
  res.json(style);
});

app.post('/styles', (req, res) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'name is required' });
    const style = createStyle(req.body);
    res.status(201).json(style);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/styles/:id', (req, res) => {
  const style = updateStyle(req.params.id, req.body);
  if (!style) return res.status(404).json({ error: 'Style not found' });
  res.json(style);
});

app.delete('/styles/:id', (req, res) => {
  const deleted = deleteStyle(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Style not found' });
  res.json({ ok: true });
});

// ── Start ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🎬 Cine-AI Prompt Compiler v0.3.0`);
  console.log(`📡 API running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /compile         — Brief → model-specific prompt`);
  console.log(`  POST /compile/multi   — Brief → multiple model prompts`);
  console.log(`  POST /generate        — Brief → prompt + generated image`);
  console.log(`  POST /audit           — Image + brief → quality audit`);
  console.log(`  POST /refine          — Image + brief → audit + refined prompt`);
  console.log(`  POST /pipeline/auto   — Full auto: compile → generate → audit → refine loop`);
  console.log(`  POST /pipeline        — Legacy pipeline`);
  console.log(`  POST /models/recommend — Brief → best model recommendation`);
  console.log(`  GET  /models          — List all models`);
  console.log(`  GET  /styles          — List style profiles`);
  console.log(`  GET  /styles/:id      — Get style profile`);
  console.log(`  POST /styles          — Create style profile`);
  console.log(`  PUT  /styles/:id      — Update style profile`);
  console.log(`  DELETE /styles/:id    — Delete style profile`);
  console.log(`  GET  /health          — Health check\n`);
});

export { app };
