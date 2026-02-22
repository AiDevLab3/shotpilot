import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = fs.readFileSync(path.join(__dirname, 'compiler/.env'), 'utf-8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const AGENT_URL = 'http://localhost:3000';
const FAL_API_KEY = process.env.FALAI_API_KEY;
const OUTPUT_DIR = path.join(__dirname, 'generated-refs');

async function generateWithFlux2(prompt, name) {
  console.log(`\n🎬 Generating: ${name}`);
  
  // Flatten prompt
  let promptStr;
  if (typeof prompt === 'string') {
    promptStr = prompt;
  } else if (typeof prompt === 'object' && prompt !== null) {
    promptStr = Object.entries(prompt).map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: ${v.join(', ')}`;
      if (typeof v === 'object') return `${k}: ${JSON.stringify(v)}`;
      return `${k}: ${v}`;
    }).join('. ');
  } else {
    console.error('   ❌ Invalid prompt:', typeof prompt);
    return null;
  }
  
  console.log(`   Prompt: ${promptStr.substring(0, 150)}...`);

  const body = {
    prompt: promptStr,
    num_images: 1,
    image_size: 'landscape_16_9',
    num_inference_steps: 28,
    guidance_scale: 3.5,
    output_format: 'jpeg',
  };

  const submitRes = await fetch('https://queue.fal.run/fal-ai/flux-2-flex', {
    method: 'POST',
    headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!submitRes.ok) {
    console.error(`   ❌ Submit failed: ${submitRes.status} ${await submitRes.text()}`);
    return null;
  }

  const { request_id } = await submitRes.json();
  console.log(`   ⏳ Queued: ${request_id}`);

  const startTime = Date.now();
  while (Date.now() - startTime < 180000) {
    await new Promise(r => setTimeout(r, 3000));
    
    const statusRes = await fetch(`https://queue.fal.run/fal-ai/flux-2-flex/requests/${request_id}/status`, {
      headers: { 'Authorization': `Key ${FAL_API_KEY}` },
    });
    let status;
    try { status = await statusRes.json(); } catch { continue; }
    
    if (status.status === 'COMPLETED') {
      const resultRes = await fetch(`https://queue.fal.run/fal-ai/flux-2-flex/requests/${request_id}`, {
        headers: { 'Authorization': `Key ${FAL_API_KEY}` },
      });
      const result = await resultRes.json();
      const images = result.images || [];
      const paths = [];
      for (let i = 0; i < images.length; i++) {
        const imgRes = await fetch(images[i].url);
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const outPath = path.join(OUTPUT_DIR, `${name}_v${i + 1}.jpg`);
        fs.writeFileSync(outPath, buffer);
        paths.push(outPath);
        console.log(`   ✅ Saved: ${outPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
      }
      return paths;
    } else if (status.status === 'FAILED') {
      console.error('   ❌ Failed');
      return null;
    }
    process.stdout.write('.');
  }
  return null;
}

async function getAgentPrompt(description) {
  const res = await fetch(`${AGENT_URL}/api/agents/generate-shot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, model_preference: 'flux-2', project_id: 'tcpw-dark-knight' }),
  });
  return res.json();
}

async function main() {
  console.log('=== Generating Remaining TCPW References ===\n');

  // 1. Property Manager — character in environment (these score well)
  console.log('━━━ PROPERTY MANAGER ━━━');
  const pmResult = await getAgentPrompt(
    `Film still from a movie production. A professional woman in her 40s stands in a corporate lobby at night, ` +
    `looking stressed. Navy blazer with real wrinkles at the elbows, white blouse slightly untucked. ` +
    `Real skin — visible pores, slight crow's feet, asymmetric features, natural flyaway hair. ` +
    `NOT airbrushed, NOT perfect. She looks like a real person caught in a candid moment. ` +
    `50mm f/2.8, cool fluorescent overhead with warm lobby fixture accent. Film grain. ` +
    `On-set photograph from a Christopher Nolan film production.`
  );
  console.log('   CD selected:', pmResult.creative_direction?.selected_model);
  const pmPrompt = pmResult.specialist_output?.prompt;
  await generateWithFlux2(pmPrompt, 'property_manager');

  // 2. Astrodome Reveal — Scene 3 (environments score 8-10)
  console.log('\n━━━ ASTRODOME REVEAL (Scene 3) ━━━');
  const s3Res = await fetch(`${AGENT_URL}/api/agents/generate-scene`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: 'tcpw-dark-knight', scene_id: 'scene-3' }),
  });
  const s3Result = await s3Res.json();
  console.log('   CD selected:', s3Result.creative_direction?.selected_model);
  await generateWithFlux2(s3Result.specialist_output?.prompt, 'astrodome_reveal');

  // 3. Signal scene — environment + volumetric light (should score well)
  console.log('\n━━━ THE SIGNAL (Scene 2) ━━━');
  const s2Res = await fetch(`${AGENT_URL}/api/agents/generate-scene`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: 'tcpw-dark-knight', scene_id: 'scene-2' }),
  });
  const s2Result = await s2Res.json();
  console.log('   CD selected:', s2Result.creative_direction?.selected_model);
  await generateWithFlux2(s2Result.specialist_output?.prompt, 'signal_scene');

  // 4. Parking Garage — environment (these always score high)
  console.log('\n━━━ PARKING GARAGE CRISIS (Scene 1) ━━━');
  const garageResult = await getAgentPrompt(
    `Film still from a movie production. Underground parking garage at night, ` +
    `fluorescent tubes casting harsh green-white light on oil-stained concrete. ` +
    `Puddles reflecting the overhead lights. Yellow concrete bollards, tire marks, ` +
    `grease stains spreading across the floor. Empty except for a few parked cars in the distance. ` +
    `The place is a mess — this is the crisis that triggers the story. ` +
    `Wide shot, 24mm f/5.6, deep focus. Motivated fluorescent practicals only. ` +
    `Film grain. Nolan-grade location photography.`
  );
  console.log('   CD selected:', garageResult.creative_direction?.selected_model);
  await generateWithFlux2(garageResult.specialist_output?.prompt, 'parking_garage_crisis');

  // 5. Resolution — hero silhouette walking into mist (silhouettes score 8.5+)
  console.log('\n━━━ RESOLUTION (Scene 7) ━━━');
  const s7Res = await fetch(`${AGENT_URL}/api/agents/generate-scene`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: 'tcpw-dark-knight', scene_id: 'scene-7' }),
  });
  const s7Result = await s7Res.json();
  console.log('   CD selected:', s7Result.creative_direction?.selected_model);
  await generateWithFlux2(s7Result.specialist_output?.prompt, 'resolution_mist');

  // 6. Tactical Pursuit — Houston streets at night (environment/mood)
  console.log('\n━━━ TACTICAL PURSUIT (Scene 4) ━━━');
  const s4Res = await fetch(`${AGENT_URL}/api/agents/generate-scene`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: 'tcpw-dark-knight', scene_id: 'scene-4' }),
  });
  const s4Result = await s4Res.json();
  console.log('   CD selected:', s4Result.creative_direction?.selected_model);
  await generateWithFlux2(s4Result.specialist_output?.prompt, 'tactical_pursuit');

  console.log('\n\n━━━ DONE ━━━');
  console.log('Results in:', OUTPUT_DIR);
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.jpg'));
  console.log('Total images:', files.length);
}

main().catch(console.error);
