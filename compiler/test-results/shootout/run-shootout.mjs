/**
 * Cross-Model Shootout Script
 * Runs the same brief through 12 image generation models, compiles optimized prompts,
 * generates images, and audits them all.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:3100';

const BRIEF = {
  description: "A cinematic 21:9 wide shot of a lone figure standing at the edge of a rain-soaked rooftop at night. The city sprawls below, neon signs reflecting in puddles. The figure wears a long dark coat, facing away from camera. Moody, atmospheric, neo-noir aesthetic. Think Blade Runner meets Se7en.",
  shotType: "extreme wide shot",
  mood: "moody, atmospheric, neo-noir",
  lighting: "neon-lit night, rain, wet reflections",
  style: "cinematic, photorealistic",
};

const MODELS = [
  { id: 'nano_banana_pro', name: 'Nano Banana Pro' },
  { id: 'gpt_image_1_5', name: 'GPT Image 1.5' },
  { id: 'flux_2', name: 'Flux 2 Flex' },
  { id: 'recraft_v4', name: 'Recraft V4 Pro' },
  { id: 'grok_imagine', name: 'Grok Imagine' },
  { id: 'seedream_4_5', name: 'Seedream 4.5' },
  { id: 'z_image', name: 'Z-Image' },
  { id: 'reve', name: 'Reve' },
  { id: 'qwen_image_max', name: 'Qwen Image Max' },
  { id: 'kling_image_v3', name: 'Kling Image V3' },
  { id: 'bria_fibo', name: 'Bria FIBO' },
  { id: 'ideogram_v3', name: 'Ideogram' },
];

const results = [];

async function runModel(model) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎬 ${model.name} (${model.id})`);
  console.log('='.repeat(60));

  const entry = {
    model: model.name,
    modelId: model.id,
    compiledPrompt: null,
    score: null,
    dimensions: null,
    strengths: null,
    weaknesses: null,
    recommendation: null,
    genTime: null,
    error: null,
  };

  try {
    // Step 1: Compile
    console.log('  📝 Compiling prompt...');
    const compileStart = Date.now();
    const compileRes = await fetch(`${BASE}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief: BRIEF, targetModel: model.id }),
    });
    if (!compileRes.ok) throw new Error(`Compile failed: ${await compileRes.text()}`);
    const compiled = await compileRes.json();
    entry.compiledPrompt = compiled.prompt;
    console.log(`  ✅ Compiled in ${Date.now() - compileStart}ms`);
    console.log(`  📋 Prompt: ${compiled.prompt.substring(0, 120)}...`);

    // Step 2: Generate
    console.log('  🖼️  Generating image...');
    const genStart = Date.now();
    const genRes = await fetch(`${BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief: BRIEF, targetModel: model.id }),
      signal: AbortSignal.timeout(180000), // 3 min timeout
    });
    if (!genRes.ok) throw new Error(`Generate failed: ${await genRes.text()}`);
    const generated = await genRes.json();
    entry.genTime = Date.now() - genStart;
    console.log(`  ✅ Generated in ${(entry.genTime / 1000).toFixed(1)}s`);

    // Save image
    const ext = generated.image.mimeType?.includes('png') ? 'png' : 'jpg';
    const imgPath = path.join(__dirname, `${model.id}.${ext}`);
    fs.writeFileSync(imgPath, Buffer.from(generated.image.data, 'base64'));
    console.log(`  💾 Saved: ${model.id}.${ext}`);

    // Step 3: Audit
    console.log('  🔍 Auditing...');
    const auditRes = await fetch(`${BASE}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: generated.image.data,
        mimeType: generated.image.mimeType,
        brief: BRIEF.description,
        modelUsed: model.id,
      }),
    });
    if (!auditRes.ok) throw new Error(`Audit failed: ${await auditRes.text()}`);
    const audit = await auditRes.json();
    entry.score = audit.overall_score;
    entry.dimensions = audit.dimensions;
    entry.strengths = audit.strengths || [];
    entry.weaknesses = audit.issues || [];
    entry.recommendation = audit.recommendation;
    entry.summary = audit.summary;
    console.log(`  🏆 Score: ${audit.overall_score}/100 — ${audit.recommendation}`);
    
  } catch (err) {
    entry.error = err.message;
    console.log(`  ❌ ERROR: ${err.message}`);
  }

  results.push(entry);
  return entry;
}

// Run all models sequentially
console.log('🎬 CINE-AI CROSS-MODEL SHOOTOUT');
console.log(`📋 Brief: ${BRIEF.description.substring(0, 80)}...`);
console.log(`🎯 Models: ${MODELS.length}`);
console.log(`⏱️  Started: ${new Date().toISOString()}\n`);

const startTime = Date.now();

for (const model of MODELS) {
  await runModel(model);
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);

// Sort by score
const ranked = [...results]
  .filter(r => r.score !== null)
  .sort((a, b) => b.score - a.score);
const failed = results.filter(r => r.error);

// Generate RESULTS.md
let md = `# 🎬 Cine-AI Cross-Model Shootout Results\n\n`;
md += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
md += `**Total Time:** ${totalTime}s\n`;
md += `**Models Tested:** ${MODELS.length} (${ranked.length} succeeded, ${failed.length} failed)\n\n`;
md += `## Brief\n\n> ${BRIEF.description}\n\n`;

// Rankings table
md += `## Rankings\n\n`;
md += `| Rank | Model | Score | Recommendation | Gen Time | Key Strength | Key Weakness |\n`;
md += `|------|-------|-------|----------------|----------|--------------|-------------|\n`;
ranked.forEach((r, i) => {
  const strength = r.strengths?.[0] || r.dimensions ? Object.entries(r.dimensions).sort((a,b) => b[1] - a[1])[0]?.[0] || '—' : '—';
  const weakness = r.weaknesses?.[0] || r.dimensions ? Object.entries(r.dimensions).sort((a,b) => a[1] - b[1])[0]?.[0] || '—' : '—';
  const genSec = r.genTime ? `${(r.genTime / 1000).toFixed(1)}s` : '—';
  md += `| ${i + 1} | **${r.model}** | ${r.score}/100 | ${r.recommendation} | ${genSec} | ${typeof strength === 'string' ? strength.substring(0, 40) : strength} | ${typeof weakness === 'string' ? weakness.substring(0, 40) : weakness} |\n`;
});

if (failed.length > 0) {
  md += `\n### Failed Models\n\n`;
  failed.forEach(f => {
    md += `- **${f.model}**: ${f.error}\n`;
  });
}

// Detailed results
md += `\n## Detailed Results\n\n`;
ranked.forEach((r, i) => {
  md += `### ${i + 1}. ${r.model} — ${r.score}/100\n\n`;
  if (r.dimensions) {
    md += `**Dimensions:**\n`;
    for (const [dim, score] of Object.entries(r.dimensions)) {
      md += `- ${dim}: ${score}/100\n`;
    }
  }
  if (r.summary) md += `\n**Summary:** ${r.summary}\n`;
  if (r.strengths?.length) md += `\n**Strengths:** ${r.strengths.join(', ')}\n`;
  if (r.weaknesses?.length) md += `\n**Weaknesses:** ${r.weaknesses.join('; ')}\n`;
  md += `\n**Generation Time:** ${r.genTime ? (r.genTime / 1000).toFixed(1) + 's' : 'N/A'}\n`;
  md += `\n**Compiled Prompt:** ${r.compiledPrompt?.substring(0, 200)}...\n\n`;
  md += `---\n\n`;
});

// Summary analysis
md += `## Summary Analysis\n\n`;
if (ranked.length > 0) {
  md += `### 🏆 Top Performers\n`;
  ranked.slice(0, 3).forEach(r => {
    md += `- **${r.model}** (${r.score}/100): ${r.summary || 'Strong performance'}\n`;
  });
  
  md += `\n### 😮 Surprises\n`;
  const surprises = ranked.filter(r => {
    // Models that scored unexpectedly well given their profile
    const unexpectedHigh = ['z_image', 'bria_fibo', 'reve', 'grok_imagine'];
    return unexpectedHigh.includes(r.modelId) && r.score >= 75;
  });
  if (surprises.length) {
    surprises.forEach(r => md += `- **${r.model}** scored ${r.score}/100 — higher than expected for this brief type\n`);
  } else {
    md += `- No major surprises — results largely aligned with model profiles\n`;
  }
  
  md += `\n### 😞 Disappointments\n`;
  const disappointing = ranked.filter(r => {
    const expectedStrong = ['nano_banana_pro', 'gpt_image_1_5', 'flux_2'];
    return expectedStrong.includes(r.modelId) && r.score < 70;
  });
  if (disappointing.length) {
    disappointing.forEach(r => md += `- **${r.model}** scored only ${r.score}/100 — expected better for this brief type\n`);
  } else {
    md += `- No major disappointments among expected strong performers\n`;
  }

  md += `\n### 🎯 Recommendation for Neo-Noir Cinematic Briefs\n\n`;
  md += `For moody, atmospheric, neo-noir cinematic shots like this brief, the top recommendation is **${ranked[0].model}** `;
  md += `with a score of ${ranked[0].score}/100. `;
  if (ranked.length > 1) {
    md += `**${ranked[1].model}** (${ranked[1].score}/100) is a strong runner-up. `;
  }
  md += `\n\nFor rapid iteration/drafting, consider the fastest model that scored well. `;
  const fastAndGood = ranked.filter(r => r.genTime && r.genTime < 30000 && r.score >= 70);
  if (fastAndGood.length) {
    md += `**${fastAndGood[0].model}** generated in ${(fastAndGood[0].genTime/1000).toFixed(1)}s with a score of ${fastAndGood[0].score}/100.\n`;
  }
}

fs.writeFileSync(path.join(__dirname, 'RESULTS.md'), md);
console.log(`\n\n${'='.repeat(60)}`);
console.log('🏁 SHOOTOUT COMPLETE');
console.log(`Total time: ${totalTime}s`);
console.log(`Results saved to: test-results/shootout/RESULTS.md`);
console.log('='.repeat(60));
