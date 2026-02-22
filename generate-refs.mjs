/**
 * Generate missing TCPW Dark Knight reference images
 * Uses: Agent pipeline for prompts → fal.ai Flux 2 for generation → QG for screening
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envFile = fs.readFileSync(path.join(__dirname, 'compiler/.env'), 'utf-8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const AGENT_URL = 'http://localhost:3000';
const FAL_API_KEY = process.env.FALAI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, 'generated-refs');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── fal.ai generation ──
async function generateWithFlux2(prompt, name, aspectRatio = '21:9') {
  console.log(`\n🎬 Generating: ${name}`);
  console.log(`   Prompt length: ${typeof prompt === 'string' ? prompt.length : JSON.stringify(prompt).length} chars`);
  
  // Flatten structured prompt to string if needed
  const promptStr = typeof prompt === 'string' ? prompt : 
    Object.entries(prompt).map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: ${v.join(', ')}`;
      return `${k}: ${v}`;
    }).join('. ');

  const body = {
    prompt: promptStr,
    num_images: 4,  // Generate 4 variations for QG to pick from
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
    output_format: 'jpeg',
  };

  // Submit to queue
  const submitRes = await fetch('https://queue.fal.run/fal-ai/flux-2-flex', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    console.error(`   ❌ Submit failed: ${submitRes.status} ${err}`);
    return null;
  }

  const { request_id } = await submitRes.json();
  console.log(`   ⏳ Queued: ${request_id}`);

  // Poll for completion
  const startTime = Date.now();
  while (Date.now() - startTime < 180000) {
    await new Promise(r => setTimeout(r, 3000));
    
    const statusRes = await fetch(`https://queue.fal.run/fal-ai/flux-2-flex/requests/${request_id}/status`, {
      headers: { 'Authorization': `Key ${FAL_API_KEY}` },
    });
    const statusText = await statusRes.text();
    let status;
    try { status = JSON.parse(statusText); } catch { 
      console.log(`   Status raw: ${statusText.substring(0, 200)}`);
      continue;
    }
    
    if (status.status === 'COMPLETED') {
      const resultRes = await fetch(`https://queue.fal.run/fal-ai/flux-2-flex/requests/${request_id}`, {
        headers: { 'Authorization': `Key ${FAL_API_KEY}` },
      });
      const result = await resultRes.json();
      
      // Download images
      const images = result.images || [];
      const paths = [];
      for (let i = 0; i < images.length; i++) {
        const imgUrl = images[i].url;
        const imgRes = await fetch(imgUrl);
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const outPath = path.join(OUTPUT_DIR, `${name}_v${i + 1}.jpg`);
        fs.writeFileSync(outPath, buffer);
        paths.push(outPath);
        console.log(`   ✅ Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
      }
      return paths;
    } else if (status.status === 'FAILED') {
      console.error(`   ❌ Generation failed`);
      return null;
    }
    process.stdout.write('.');
  }
  console.error('   ❌ Timeout');
  return null;
}

// ── QG screening ──
async function screenImage(imagePath) {
  const img = fs.readFileSync(imagePath).toString('base64');
  const res = await fetch(`${AGENT_URL}/api/agents/screen-reference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: img }),
  });
  return res.json();
}

// ── Get agent prompt ──
async function getAgentPrompt(description, modelPref = null) {
  const res = await fetch(`${AGENT_URL}/api/agents/generate-shot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description,
      model_preference: modelPref || 'flux-2',
      project_id: 'tcpw-dark-knight',
    }),
  });
  const data = await res.json();
  return data;
}

// ── Main ──
async function main() {
  console.log('=== TCPW Dark Knight — Reference Image Generation ===\n');

  // 1. Hero Tactical Gear — THE key reference
  console.log('\n━━━ 1/5: HERO TACTICAL GEAR (Scene 3 Key Frame) ━━━');
  const heroResult = await getAgentPrompt(
    `Character reference: The TCPW Lead Operative standing in a dimly lit industrial space. ` +
    `Full body shot showing the complete Tactical Industrial outfit: matte-black Cordura nylon suit, ` +
    `reinforced carbon-fiber plating on forearms and shins, utility belt with brass quick-connects and ` +
    `high-tensile carabiners. Tactical full-face respirator/visor helmet — fighter pilot meets welding gear, ` +
    `matte finish, visibly scuffed and worn from real fieldwork. The gear must look like actual industrial PPE, ` +
    `NOT a superhero costume. Real fabric wrinkles, real wear patterns, real dirt. Entropy is critical — ` +
    `dried water spots on visor, carbon fiber scratches, brass patina on fittings. ` +
    `Photographed with an 85mm lens at f/4, shallow DOF. Motivated tungsten practicals from above. ` +
    `Film grain, natural skin-like texture on all materials. This must look like a wardrobe photo from a real film set.`
  );
  console.log('   CD selected:', heroResult.creative_direction?.selected_model);
  const heroPrompt = heroResult.specialist_output?.prompt;
  const heroPaths = await generateWithFlux2(heroPrompt, 'hero_tactical');

  // 2. Hero Close-up (visor/helmet detail)
  console.log('\n━━━ 2/5: HERO VISOR CLOSE-UP ━━━');
  const visorResult = await getAgentPrompt(
    `Extreme close-up of the TCPW operative's tactical visor/helmet. 105mm macro at f/2.8. ` +
    `The scuffed polycarbonate visor reflects the Houston skyline and amber sodium vapor lights. ` +
    `Matte-black helmet surface shows real wear: micro-scratches, dried water droplets, dust in crevices. ` +
    `The respirator section has industrial brass fittings with natural patina. ` +
    `Shot like a prop photography session on a real film set. Extreme texture detail — every scratch tells a story. ` +
    `Shallow DOF, film grain, motivated sidelight from a tungsten practical.`
  );
  const visorPrompt = visorResult.specialist_output?.prompt;
  const visorPaths = await generateWithFlux2(visorPrompt, 'hero_visor_closeup');

  // 3. Interceptor Motorcycle
  console.log('\n━━━ 3/5: INTERCEPTOR MOTORCYCLE ━━━');
  const bikeResult = await getAgentPrompt(
    `The TCPW Interceptor motorcycle parked in a dark industrial garage. ` +
    `Matte-black, low-slung aggressive frame with exposed hydraulic lines and oversized rugged tires. ` +
    `LED light bar strobes casting cool blue light on the wet concrete floor. ` +
    `The bike looks like a modified tactical pursuit vehicle — tech-forward but industrial, not flashy. ` +
    `Think Batpod meets industrial utility bike. Real metal, real rubber, real hydraulic fluid stains. ` +
    `Shot at 35mm f/5.6, deep focus. Sodium vapor overhead with blue LED accent from the bike itself. ` +
    `Wet floor reflections. Film grain. Photographed like a vehicle feature in a car magazine — but dark and gritty.`
  );
  const bikePrompt = bikeResult.specialist_output?.prompt;
  const bikePaths = await generateWithFlux2(bikePrompt, 'interceptor_motorcycle');

  // 4. Property Manager (replacement ref)
  console.log('\n━━━ 4/5: PROPERTY MANAGER CHARACTER ━━━');
  const pmResult = await getAgentPrompt(
    `Professional woman in her 40s, property manager of a high-end Houston shopping center. ` +
    `Standing in a corporate lobby at night. Business professional attire — tailored navy blazer, ` +
    `white blouse, pencil skirt. She looks stressed and concerned. Real skin texture with natural ` +
    `imperfections — pores, slight lines around eyes, asymmetric features. Hair with natural flyaways, ` +
    `not perfectly styled. Real fabric wrinkles in the blazer at the elbows and shoulders. ` +
    `Shot at 50mm f/2.8 — natural proportions, slight background blur of lobby lights. ` +
    `Cool fluorescent overhead with warm accent from lobby fixtures. Film grain. ` +
    `This must look like a candid onset photo of a real actress, not a character render.`
  );
  const pmPrompt = pmResult.specialist_output?.prompt;
  const pmPaths = await generateWithFlux2(pmPrompt, 'property_manager');

  // 5. Scene 3 — Astrodome Reveal (the money shot)
  console.log('\n━━━ 5/5: ASTRODOME REVEAL (Scene 3 Key Frame) ━━━');
  const sceneRes = await fetch(`${AGENT_URL}/api/agents/generate-scene`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: 'tcpw-dark-knight', scene_id: 'scene-3' }),
  });
  const sceneResult = await sceneRes.json();
  console.log('   CD selected:', sceneResult.creative_direction?.selected_model);
  const scenePrompt = sceneResult.specialist_output?.prompt;
  const scenePaths = await generateWithFlux2(scenePrompt, 'astrodome_reveal');

  // ── QG Screening ──
  console.log('\n\n━━━ QUALITY GATE SCREENING ━━━\n');
  
  const allPaths = [
    ...(heroPaths || []),
    ...(visorPaths || []),
    ...(bikePaths || []),
    ...(pmPaths || []),
    ...(scenePaths || []),
  ];

  const results = [];
  for (const p of allPaths) {
    const name = path.basename(p);
    try {
      const score = await screenImage(p);
      console.log(`${name}: ${score.quality_score}/10 | Risk: ${score.downstream_risk} | ${score.suitable ? '✅ APPROVED' : '❌ REJECTED'}`);
      if (score.ai_tells) console.log(`  Tells: ${score.ai_tells.slice(0, 3).join('; ')}`);
      results.push({ file: name, path: p, ...score });
    } catch (e) {
      console.log(`${name}: ⚠️ QG error: ${e.message}`);
    }
  }

  // Save results
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'qg-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n\n━━━ SUMMARY ━━━');
  const approved = results.filter(r => r.suitable);
  const rejected = results.filter(r => !r.suitable);
  console.log(`Total generated: ${allPaths.length}`);
  console.log(`Approved: ${approved.length}`);
  console.log(`Rejected: ${rejected.length}`);
  if (approved.length > 0) {
    console.log('\nBest results:');
    approved.sort((a, b) => b.quality_score - a.quality_score);
    for (const a of approved.slice(0, 5)) {
      console.log(`  ${a.file}: ${a.quality_score}/10`);
    }
  }
  
  console.log('\nDone. Results in:', OUTPUT_DIR);
}

main().catch(console.error);
