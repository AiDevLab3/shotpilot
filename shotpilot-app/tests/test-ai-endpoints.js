#!/usr/bin/env node
/**
 * ShotPilot AI Endpoint Integration Test
 *
 * Hits all 14 AI-powered endpoints against a running server.
 * Requires: server running on localhost:3000 with Gemini API key configured.
 *
 * Usage:  node tests/test-ai-endpoints.js
 */

const API = 'http://localhost:3000';
let sessionCookie = '';
let projectId, sceneId, shotId, characterId, objectId, variantId;
let projectExistedBefore = false;

const results = [];

// ─── Helpers ────────────────────────────────────────────────────────────────

async function api(path, { method = 'GET', body, formData } = {}) {
  const headers = {};
  if (sessionCookie) headers['Cookie'] = sessionCookie;
  if (body && !formData) headers['Content-Type'] = 'application/json';

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  if (formData) opts.body = formData;

  const res = await fetch(`${API}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, headers: res.headers };
}

function record(num, name, status, shapeOk, notes) {
  results.push({ num, name, status, shapeOk, notes });
  const icon = shapeOk === true ? '✓' : shapeOk === false ? '✗' : '⊘';
  console.log(`  ${icon} Test ${num}: ${name} — HTTP ${status} — ${notes}`);
}

function snip(text, len = 100) {
  if (typeof text !== 'string') text = JSON.stringify(text);
  return text.length > len ? text.slice(0, len) + '…' : text;
}

function hasKeys(obj, keys) {
  if (!obj || typeof obj !== 'object') return false;
  return keys.every(k => k in obj);
}

// ─── Setup ──────────────────────────────────────────────────────────────────

async function setup() {
  console.log('\n═══ SETUP ═══\n');

  // 1. Login
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'test@shotpilot.com', password: 'testpassword123' }
  });
  const setCookie = login.headers.get('set-cookie');
  if (setCookie) sessionCookie = setCookie.split(';')[0];
  if (login.status !== 200 || !login.data.success) {
    console.error('Login failed:', login.data);
    process.exit(1);
  }
  console.log(`  Logged in as ${login.data.user.email} (credits: ${login.data.user.credits})`);

  // 2. Get or create project
  const projects = await api('/api/projects');
  if (projects.data.length > 0) {
    projectId = projects.data[0].id;
    projectExistedBefore = true;
    console.log(`  Using existing project ${projectId}`);
  } else {
    const p = await api('/api/projects', {
      method: 'POST',
      body: { title: 'AI Test Project', frame_size: '16:9 Widescreen', style_aesthetic: 'Film Noir' }
    });
    projectId = p.data.id;
    console.log(`  Created project ${projectId}`);
  }

  // 3. Get or create scene
  const scenes = await api(`/api/projects/${projectId}/scenes`);
  if (scenes.data.length > 0) {
    sceneId = scenes.data[0].id;
    console.log(`  Using existing scene ${sceneId}`);
  } else {
    const s = await api(`/api/projects/${projectId}/scenes`, {
      method: 'POST',
      body: { name: 'Test Scene', order_index: 1, status: 'planning', location_setting: 'Dark alley', time_of_day: 'Night', mood_tone: 'Tense' }
    });
    sceneId = s.data.id;
    console.log(`  Created scene ${sceneId}`);
  }

  // 4. Create shot
  const sh = await api(`/api/scenes/${sceneId}/shots`, {
    method: 'POST',
    body: {
      shot_number: 'AI-1', shot_type: 'Medium', camera_angle: 'Low Angle',
      camera_movement: 'Static',
      description: 'Detective crouches beside evidence markers in rain-slicked alley, neon signs reflecting off wet pavement',
      focal_length: '35mm', blocking: 'Subject left-third, evidence markers foreground',
      camera_lens: 'Prime 35mm'
    }
  });
  shotId = sh.data.id;
  console.log(`  Created shot ${shotId}`);

  // 5. Create character
  const ch = await api(`/api/projects/${projectId}/characters`, {
    method: 'POST',
    body: {
      name: 'Detective Morrow',
      description: 'Weathered female detective, late 40s, silver-streaked dark hair pulled back, deep-set eyes, rain-soaked trench coat',
      personality: 'World-weary but sharp, sardonic humor masks genuine empathy'
    }
  });
  characterId = ch.data.id;
  console.log(`  Created character ${characterId}`);

  // 6. Create object
  const ob = await api(`/api/projects/${projectId}/objects`, {
    method: 'POST',
    body: {
      name: 'Evidence Case',
      description: 'Battered aluminum evidence case with dented corners, forensic stickers, smudged latex glove prints'
    }
  });
  objectId = ob.data.id;
  console.log(`  Created object ${objectId}`);

  console.log(`\n  IDs → project=${projectId} scene=${sceneId} shot=${shotId} char=${characterId} obj=${objectId}\n`);
}

// ─── AI Endpoint Tests ─────────────────────────────────────────────────────

async function runTests() {
  console.log('═══ AI ENDPOINT TESTS ═══\n');

  // 1. Check Readiness (KB-enhanced)
  try {
    const r = await api(`/api/shots/${shotId}/check-readiness`, { method: 'POST', body: { useKB: true } });
    const ok = hasKeys(r.data, ['percentage', 'tier']);
    record(1, 'Check Readiness (KB)', r.status, r.status === 200 && ok,
      ok ? `${r.data.percentage}% — tier: ${r.data.tier}` : snip(r.data));
  } catch (e) { record(1, 'Check Readiness (KB)', 'ERR', false, e.message); }

  // 2. Get Recommendations (missingFields must be objects with {field, label})
  try {
    const r = await api(`/api/shots/${shotId}/get-recommendations`, {
      method: 'POST', body: { missingFields: [
        { field: 'camera_movement', label: 'Camera Movement' },
        { field: 'notes', label: 'Notes' }
      ] }
    });
    const ok = Array.isArray(r.data) && r.data.length > 0 && 'field' in r.data[0];
    record(2, 'Get Recommendations', r.status, r.status === 200 && ok,
      ok ? snip(r.data[0].recommendation || r.data[0].value) : snip(r.data));
  } catch (e) { record(2, 'Get Recommendations', 'ERR', false, e.message); }

  // 3. Aesthetic Suggestions
  try {
    const r = await api(`/api/projects/${projectId}/aesthetic-suggestions`, { method: 'POST', body: {} });
    const ok = hasKeys(r.data, ['suggestions']);
    record(3, 'Aesthetic Suggestions', r.status, r.status === 200 && ok,
      ok ? `kbFiles: ${r.data.kbFilesUsed || 0} — ${snip(typeof r.data.suggestions === 'string' ? r.data.suggestions : JSON.stringify(r.data.suggestions))}` : snip(r.data));
  } catch (e) { record(3, 'Aesthetic Suggestions', 'ERR', false, e.message); }

  // 4. Character Suggestions
  try {
    const r = await api(`/api/projects/${projectId}/character-suggestions`, {
      method: 'POST',
      body: { name: 'Detective Morrow', description: 'Weathered female detective, late 40s', personality: 'World-weary but sharp' }
    });
    const ok = r.data && (r.data.description || r.data.referencePrompt || r.data.consistencyTips);
    record(4, 'Character Suggestions', r.status, r.status === 200 && !!ok,
      ok ? snip(r.data.description || r.data.referencePrompt) : snip(r.data));
  } catch (e) { record(4, 'Character Suggestions', 'ERR', false, e.message); }

  // 5. Object Suggestions
  try {
    const r = await api(`/api/projects/${projectId}/object-suggestions`, {
      method: 'POST',
      body: { name: 'Evidence Case', description: 'Battered aluminum evidence case', targetModel: 'midjourney' }
    });
    const ok = r.data && (r.data.description || r.data.referencePrompt || r.data.turnaroundPrompts);
    record(5, 'Object Suggestions', r.status, r.status === 200 && !!ok,
      ok ? snip(r.data.description || r.data.referencePrompt) : snip(r.data));
  } catch (e) { record(5, 'Object Suggestions', 'ERR', false, e.message); }

  // 6. Shot Plan
  try {
    const r = await api(`/api/scenes/${sceneId}/shot-plan`, { method: 'POST', body: {} });
    const ok = r.data && (Array.isArray(r.data.shots) || Array.isArray(r.data.suggestedShots) || r.data.plan);
    record(6, 'Shot Plan', r.status, r.status === 200 && !!ok,
      ok ? `${(r.data.shots || r.data.suggestedShots || []).length} shots suggested` : snip(r.data));
  } catch (e) { record(6, 'Shot Plan', 'ERR', false, e.message); }

  // 7. Generate Prompt (costs 1 credit)
  try {
    const r = await api(`/api/shots/${shotId}/generate-prompt`, {
      method: 'POST', body: { modelName: 'midjourney' }
    });
    const ok = r.data && (r.data.generated_prompt || r.data.variant);
    if (r.data?.variant?.id) variantId = r.data.variant.id;
    else if (r.data?.id) variantId = r.data.id;
    record(7, 'Generate Prompt', r.status, r.status === 200 && !!ok,
      ok ? `variantId=${variantId} — ${snip(r.data.generated_prompt || r.data.variant?.generated_prompt)}` : snip(r.data));
  } catch (e) { record(7, 'Generate Prompt', 'ERR', false, e.message); }

  // 8. Readiness Dialogue
  try {
    const r = await api(`/api/shots/${shotId}/readiness-dialogue`, {
      method: 'POST',
      body: { message: 'What would make this shot more cinematic?', history: [] }
    });
    const ok = r.data && ('response' in r.data);
    record(8, 'Readiness Dialogue', r.status, r.status === 200 && ok,
      ok ? snip(r.data.response) : snip(r.data));
  } catch (e) { record(8, 'Readiness Dialogue', 'ERR', false, e.message); }

  // 9. Script Analysis
  try {
    const scriptText = `INT. DARK ALLEY - NIGHT\n\nRain hammers the cracked asphalt. DETECTIVE MORROW (40s, silver-streaked hair) crouches beside a chalk outline, evidence markers scattered like fallen stars.\n\nMORROW\n(into radio)\nGet forensics down here. And tell them to bring the UV kit.\n\nShe stands, her trench coat heavy with rain, and stares at the neon sign flickering above: PARADISE MOTEL.`;
    const r = await api(`/api/projects/${projectId}/analyze-script`, {
      method: 'POST', body: { scriptText }
    });
    const ok = r.data && (r.data.scenes || r.data.characters || r.data.summary);
    record(9, 'Script Analysis', r.status, r.status === 200 && !!ok,
      ok ? `scenes: ${(r.data.scenes || []).length}, chars: ${(r.data.characters || []).length}` : snip(r.data));
  } catch (e) { record(9, 'Script Analysis', 'ERR', false, e.message); }

  // 10. Creative Director
  try {
    const r = await api(`/api/projects/${projectId}/creative-director`, {
      method: 'POST',
      body: {
        message: 'I want this project to feel like a 1990s David Fincher thriller — green-tinted shadows, always raining, claustrophobic framing. What visual approach should we take?',
        history: [], mode: 'vision'
      }
    });
    const ok = r.data && ('response' in r.data);
    record(10, 'Creative Director', r.status, r.status === 200 && ok,
      ok ? snip(r.data.response) : snip(r.data));
  } catch (e) { record(10, 'Creative Director', 'ERR', false, e.message); }

  // 11. Content Refinement (Character)
  try {
    const r = await api(`/api/projects/${projectId}/refine-content`, {
      method: 'POST',
      body: {
        type: 'character',
        currentContent: { name: 'Detective Morrow', description: 'Weathered female detective' },
        message: 'Make her look more battle-hardened, add scars and a prosthetic left hand',
        history: []
      }
    });
    const ok = r.data && ('response' in r.data || 'contentUpdate' in r.data);
    record(11, 'Content Refinement', r.status, r.status === 200 && ok,
      ok ? snip(r.data.response || JSON.stringify(r.data.contentUpdate)) : snip(r.data));
  } catch (e) { record(11, 'Content Refinement', 'ERR', false, e.message); }

  // 12. Conversation Compaction
  try {
    const messages = [
      { role: 'user', content: 'I want a noir project' },
      { role: 'assistant', content: 'Great choice! Film noir is a fantastic genre...' },
      { role: 'user', content: 'Main character is a detective' },
      { role: 'assistant', content: "I'll create a detective character..." },
      { role: 'user', content: 'She should be in her 40s' },
      { role: 'assistant', content: "Updated the character's age..." },
      { role: 'user', content: 'Add a dark alley scene' },
      { role: 'assistant', content: 'Scene created with dark alley setting...' },
      { role: 'user', content: 'The mood should be tense' },
      { role: 'assistant', content: "I've updated the mood to tense..." },
      { role: 'user', content: 'What about the lighting?' },
      { role: 'assistant', content: 'For noir, low-key lighting with harsh shadows...' },
    ];
    const r = await api(`/api/projects/${projectId}/compact-conversation`, {
      method: 'POST', body: { messages }
    });
    const ok = r.data && ('summary' in r.data || 'keyDecisions' in r.data);
    record(12, 'Conversation Compaction', r.status, r.status === 200 && ok,
      ok ? snip(r.data.summary) : snip(r.data));
  } catch (e) { record(12, 'Conversation Compaction', 'ERR', false, e.message); }

  // 13. Holistic Image Audit — skip (no test image available in automated run)
  record(13, 'Holistic Image Audit', 'N/A', null, 'Skipped — requires uploaded image file');

  // 14. Prompt Refinement — depends on 13
  if (variantId) {
    try {
      const r = await api(`/api/variants/${variantId}/refine-prompt`, { method: 'POST', body: {} });
      const ok = r.data && ('refined_prompt' in r.data || 'variant' in r.data);
      record(14, 'Prompt Refinement', r.status, r.status === 200 && ok,
        ok ? snip(r.data.refined_prompt) : snip(r.data));
    } catch (e) { record(14, 'Prompt Refinement', 'ERR', false, e.message); }
  } else {
    record(14, 'Prompt Refinement', 'N/A', null, 'Skipped — no variant from test 7 or test 13');
  }
}

// ─── Cleanup ────────────────────────────────────────────────────────────────

async function cleanup() {
  console.log('\n═══ CLEANUP ═══\n');

  // Delete variant if created
  if (variantId) {
    const r = await api(`/api/variants/${variantId}`, { method: 'DELETE' });
    console.log(`  Variant ${variantId}: ${r.status}`);
  }

  // Delete shot
  if (shotId) {
    const r = await api(`/api/shots/${shotId}`, { method: 'DELETE' });
    console.log(`  Shot ${shotId}: ${r.status}`);
  }

  // Delete character
  if (characterId) {
    const r = await api(`/api/projects/${projectId}/characters/${characterId}`, { method: 'DELETE' });
    console.log(`  Character ${characterId}: ${r.status}`);
  }

  // Delete object
  if (objectId) {
    const r = await api(`/api/projects/${projectId}/objects/${objectId}`, { method: 'DELETE' });
    console.log(`  Object ${objectId}: ${r.status}`);
  }

  // Delete scene (only if we created the project)
  if (!projectExistedBefore && sceneId) {
    const r = await api(`/api/projects/${projectId}/scenes/${sceneId}`, { method: 'DELETE' });
    console.log(`  Scene ${sceneId}: ${r.status}`);
  }

  // Delete project only if we created it
  if (!projectExistedBefore && projectId) {
    const r = await api(`/api/projects/${projectId}`, { method: 'DELETE' });
    console.log(`  Project ${projectId}: ${r.status}`);
  } else if (projectExistedBefore) {
    console.log(`  Project ${projectId}: kept (existed before test)`);
  }
}

// ─── Report ─────────────────────────────────────────────────────────────────

function report() {
  console.log('\n═══ SUMMARY ═══\n');
  console.log('| #  | Endpoint                 | Status | Shape OK? | Notes');
  console.log('|----|--------------------------|--------|-----------|------');
  for (const r of results) {
    const shape = r.shapeOk === true ? 'Yes' : r.shapeOk === false ? 'NO' : 'N/A';
    const num = String(r.num).padStart(2);
    const name = r.name.padEnd(24);
    const st = String(r.status).padEnd(6);
    console.log(`| ${num} | ${name} | ${st} | ${shape.padEnd(9)} | ${r.notes}`);
  }

  const passed = results.filter(r => r.shapeOk === true).length;
  const failed = results.filter(r => r.shapeOk === false).length;
  const skipped = results.filter(r => r.shapeOk === null).length;
  console.log(`\n  Passed: ${passed}  Failed: ${failed}  Skipped: ${skipped}  Total: ${results.length}\n`);
}

// ─── Main ───────────────────────────────────────────────────────────────────

(async () => {
  try {
    await setup();
    await runTests();
  } catch (e) {
    console.error('Fatal error:', e);
  } finally {
    await cleanup();
    report();
  }
})();
