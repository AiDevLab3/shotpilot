/**
 * Validation Test: KB-compiled vs Raw prompts across 4 models, scored by 3 auditors.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3100';

const BRIEF_TEXT = "A cinematic 21:9 wide shot of a lone figure standing at the edge of a rain-soaked rooftop at night. The city sprawls below, neon signs reflecting in puddles. The figure wears a long dark coat, facing away from camera. Moody, atmospheric, neo-noir aesthetic. Think Blade Runner meets Se7en.";

const BRIEF_OBJ = {
  description: BRIEF_TEXT,
  shotType: "extreme wide shot",
  mood: "neo-noir, moody, atmospheric",
  lighting: "neon-lit, rain-soaked, high contrast",
};

const MODELS = [
  { id: 'nano_banana_pro', slug: 'nano-banana-pro' },
  { id: 'gpt_image_1_5', slug: 'gpt-image-1.5' },
  { id: 'grok_imagine', slug: 'grok-imagine' },
  { id: 'ideogram_v3', slug: 'ideogram' },
];

async function api(endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${endpoint} ${res.status}: ${text.substring(0, 300)}`);
  }
  return res.json();
}

async function generateAndSave(model, promptType) {
  console.log(`  🎬 Generating ${model.slug} [${promptType}]...`);
  
  let result;
  if (promptType === 'kb') {
    // Use /generate which compiles via KB + generates
    result = await api('/generate', { brief: BRIEF_OBJ, targetModel: model.id });
  } else {
    // Raw: use /generate/raw which skips KB compilation
    result = await api('/generate/raw', { prompt: BRIEF_TEXT, targetModel: model.id });
  }
  
  const filename = `${model.slug}-${promptType}.png`;
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, Buffer.from(result.image.data, 'base64'));
  console.log(`    ✅ Saved ${filename} (prompt: ${(result.prompt || BRIEF_TEXT).substring(0, 80)}...)`);
  
  return {
    image: result.image.data,
    mimeType: result.image.mimeType,
    prompt: result.prompt || BRIEF_TEXT,
  };
}

async function auditImage(imageBase64, mimeType) {
  console.log(`  🔍 Running peer audit (3 auditors)...`);
  const result = await api('/audit/peer', {
    image: imageBase64,
    mimeType,
    brief: BRIEF_TEXT,
  });
  console.log(`    ✅ Consensus: ${result.consensus.avg_score} (${result.consensus.agreement_level} agreement)`);
  return result;
}

// ── Main ─────────────────────────────────────────────────────────────

const allResults = {};

async function runModel(model) {
  console.log(`\n📷 Model: ${model.slug}`);
  allResults[model.slug] = {};
  
  for (const promptType of ['kb', 'raw']) {
    try {
      const gen = await generateAndSave(model, promptType, null);
      const audit = await auditImage(gen.image, gen.mimeType);
      allResults[model.slug][promptType] = {
        prompt: gen.prompt,
        audit,
      };
    } catch (err) {
      console.error(`    ❌ ${model.slug} [${promptType}]: ${err.message}`);
      allResults[model.slug][promptType] = { error: err.message };
    }
  }
}

async function main() {
  console.log('🧪 VALIDATION TEST: KB vs Raw × 4 Models × 3 Auditors\n');
  console.log(`Brief: "${BRIEF_TEXT.substring(0, 80)}..."\n`);

  for (const model of MODELS) {
    await runModel(model);
  }

  // Save raw JSON results
  fs.writeFileSync(
    path.join(__dirname, 'results.json'),
    JSON.stringify(allResults, null, 2)
  );

  // Generate markdown report
  generateReport(allResults);
  
  console.log('\n✅ Validation test complete!');
  console.log(`Results saved to ${__dirname}/`);
}

function generateReport(results) {
  const lines = [];
  lines.push('# 🧪 Validation Test Results: KB vs Raw Prompts');
  lines.push('');
  lines.push(`**Date:** ${new Date().toISOString().split('T')[0]}`);
  lines.push(`**Brief:** "${BRIEF_TEXT}"`);
  lines.push('');
  lines.push('## Scoring Matrix');
  lines.push('');
  lines.push('| Model | Prompt | Gemini Flash | Gemini Pro | GPT-4o | **Consensus** |');
  lines.push('|-------|--------|-------------|-----------|--------|--------------|');

  const liftData = [];

  for (const model of MODELS) {
    const mr = results[model.slug];
    if (!mr) continue;
    
    for (const pt of ['kb', 'raw']) {
      const r = mr[pt];
      if (!r || r.error) {
        lines.push(`| ${model.slug} | ${pt.toUpperCase()} | ❌ ${r?.error?.substring(0, 30) || 'failed'} | - | - | - |`);
        continue;
      }
      const a = r.audit;
      const gf = a.results?.gemini_flash?.overall_score ?? '—';
      const gp = a.results?.gemini_pro?.overall_score ?? '—';
      const gpt = a.results?.gpt?.overall_score ?? '—';
      const avg = a.consensus?.avg_score ?? '—';
      lines.push(`| ${model.slug} | ${pt.toUpperCase()} | ${gf} | ${gp} | ${gpt} | **${avg}** |`);
    }

    // Calculate KB lift
    const kbScore = mr.kb?.audit?.consensus?.avg_score;
    const rawScore = mr.raw?.audit?.consensus?.avg_score;
    if (kbScore != null && rawScore != null) {
      liftData.push({ model: model.slug, kb: kbScore, raw: rawScore, lift: +(kbScore - rawScore).toFixed(1) });
    }
  }

  lines.push('');
  lines.push('## KB Lift Analysis');
  lines.push('');
  lines.push('| Model | KB Score | Raw Score | **KB Lift** |');
  lines.push('|-------|---------|----------|------------|');
  for (const d of liftData) {
    const arrow = d.lift > 0 ? '📈' : d.lift < 0 ? '📉' : '➡️';
    lines.push(`| ${d.model} | ${d.kb} | ${d.raw} | **${d.lift > 0 ? '+' : ''}${d.lift}** ${arrow} |`);
  }
  const avgLift = liftData.length ? +(liftData.reduce((a, b) => a + b.lift, 0) / liftData.length).toFixed(1) : 0;
  lines.push(`| **Average** | | | **${avgLift > 0 ? '+' : ''}${avgLift}** |`);

  lines.push('');
  lines.push('## Auditor Agreement Analysis');
  lines.push('');
  for (const model of MODELS) {
    const mr = results[model.slug];
    if (!mr) continue;
    for (const pt of ['kb', 'raw']) {
      const r = mr[pt];
      if (!r || r.error || !r.audit?.consensus) continue;
      const c = r.audit.consensus;
      lines.push(`- **${model.slug} [${pt.toUpperCase()}]**: ${c.agreement_level} agreement (spread: ${c.spread})`);
      if (c.divergence_notes?.length) {
        for (const n of c.divergence_notes) lines.push(`  - ${n}`);
      }
    }
  }

  lines.push('');
  lines.push('## Dimension Averages (Consensus)');
  lines.push('');
  lines.push('| Model | Type | Comp | Light | Color | Real | Mood | Brief |');
  lines.push('|-------|------|------|-------|-------|------|------|-------|');
  for (const model of MODELS) {
    const mr = results[model.slug];
    if (!mr) continue;
    for (const pt of ['kb', 'raw']) {
      const r = mr[pt];
      if (!r || r.error || !r.audit?.consensus?.dim_averages) continue;
      const d = r.audit.consensus.dim_averages;
      lines.push(`| ${model.slug} | ${pt.toUpperCase()} | ${d.composition} | ${d.lighting} | ${d.color} | ${d.realism} | ${d.mood} | ${d.brief_adherence} |`);
    }
  }

  lines.push('');
  lines.push('## Conclusions');
  lines.push('');
  lines.push('*Auto-generated — review and update manually.*');
  lines.push('');
  if (avgLift > 3) {
    lines.push(`- ✅ **KB compilation provides significant lift** (avg +${avgLift} points) — the knowledge base is working.`);
  } else if (avgLift > 0) {
    lines.push(`- ⚠️ **KB provides modest lift** (avg +${avgLift} points) — benefit is model-dependent.`);
  } else {
    lines.push(`- ❌ **KB shows no clear benefit** (avg ${avgLift} points) — investigate prompt compiler.`);
  }

  const report = lines.join('\n');
  fs.writeFileSync(path.join(__dirname, 'VALIDATION_RESULTS.md'), report);
  console.log('\n📊 Report saved to VALIDATION_RESULTS.md');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
