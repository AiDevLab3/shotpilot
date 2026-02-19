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

const FAILED_MODELS = [
  { id: 'recraft_v4', name: 'Recraft V4 Pro' },
  { id: 'seedream_4_5', name: 'Seedream 4.5' },
  { id: 'z_image', name: 'Z-Image' },
  { id: 'reve', name: 'Reve' },
  { id: 'qwen_image_max', name: 'Qwen Image Max' },
  { id: 'kling_image_v3', name: 'Kling Image V3' },
  { id: 'bria_fibo', name: 'Bria FIBO' },
  { id: 'ideogram_v3', name: 'Ideogram' },
];

for (const model of FAILED_MODELS) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎬 ${model.name} (${model.id})`);
  try {
    console.log('  📝 Compiling...');
    const compileRes = await fetch(`${BASE}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief: BRIEF, targetModel: model.id }),
    });
    const compiled = await compileRes.json();
    if (!compileRes.ok) throw new Error(`Compile: ${JSON.stringify(compiled)}`);

    console.log('  🖼️  Generating...');
    const genStart = Date.now();
    const genRes = await fetch(`${BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief: BRIEF, targetModel: model.id }),
      signal: AbortSignal.timeout(180000),
    });
    const genData = await genRes.json();
    if (!genRes.ok) throw new Error(`Generate: ${JSON.stringify(genData)}`);
    const genTime = Date.now() - genStart;
    console.log(`  ✅ Generated in ${(genTime/1000).toFixed(1)}s`);

    const ext = genData.image.mimeType?.includes('png') ? 'png' : 'jpg';
    fs.writeFileSync(path.join(__dirname, `${model.id}.${ext}`), Buffer.from(genData.image.data, 'base64'));

    console.log('  🔍 Auditing...');
    const auditRes = await fetch(`${BASE}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: genData.image.data,
        mimeType: genData.image.mimeType,
        brief: BRIEF.description,
        modelUsed: model.id,
      }),
    });
    const audit = await auditRes.json();
    console.log(`  🏆 Score: ${audit.overall_score}/100 — ${audit.recommendation}`);
    console.log(`  📊 ${JSON.stringify({ genTime, score: audit.overall_score, dims: audit.dimensions, rec: audit.recommendation, summary: audit.summary, issues: audit.issues, strengths: audit.strengths })}`);
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
  }
}
