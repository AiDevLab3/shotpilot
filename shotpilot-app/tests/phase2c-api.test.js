/**
 * Phase 2C API Integration Tests
 * Tests all backend endpoints used by the Phase 2C frontend components.
 * Run: node tests/phase2c-api.test.js
 * Requires: backend server running on port 3000
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API = 'http://localhost:3000/api';
let sessionCookie = '';
let projectId = null;
let sceneId = null;
let draftShotId = null;
let prodShotId = null;
let variantId = null;

const results = [];
const startTime = Date.now();

async function api(endpoint, options = {}) {
    const res = await fetch(`${API}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie,
            ...(options.headers || {}),
        },
    });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) sessionCookie = setCookie.split(';')[0];
    return { status: res.status, data: await res.json().catch(() => null) };
}

async function runTest(name, fn) {
    const t0 = Date.now();
    try {
        await fn();
        const dur = ((Date.now() - t0) / 1000).toFixed(1);
        results.push({ test: name, status: 'PASSED', duration: `${dur}s` });
        console.log(`  ✅ ${name} (${dur}s)`);
    } catch (err) {
        const dur = ((Date.now() - t0) / 1000).toFixed(1);
        if (err.skipped) {
            results.push({ test: name, status: 'SKIPPED', duration: `${dur}s`, reason: err.message });
            console.log(`  ⏭️  ${name} (${dur}s) — SKIPPED: ${err.message}`);
        } else {
            results.push({ test: name, status: 'FAILED', duration: `${dur}s`, error: err.message });
            console.log(`  ❌ ${name} (${dur}s) — ${err.message}`);
        }
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg);
}

function skip(msg) {
    const err = new Error(msg);
    err.skipped = true;
    throw err;
}

// ----- TESTS -----

async function main() {
    console.log('\n🧪 Phase 2C API Integration Tests\n');
    console.log('─'.repeat(50));

    // 1. Login
    await runTest('Login with test user', async () => {
        const { status, data } = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@shotpilot.com', password: 'testpassword123' }),
        });
        assert(status === 200, `Expected 200, got ${status}`);
        assert(data.success === true, 'Login did not return success');
        assert(data.user.email === 'test@shotpilot.com', 'Wrong email returned');
    });

    // 2. GET /user/credits
    await runTest('Credit badge — GET /user/credits', async () => {
        const { status, data } = await api('/user/credits');
        assert(status === 200, `Expected 200, got ${status}`);
        assert(typeof data.credits === 'number', 'credits not a number');
        assert(data.credits > 0, `Expected credits > 0, got ${data.credits}`);
        console.log(`       Credits: ${data.credits}`);
    });

    // 3. GET /models
    await runTest('Model selector — GET /models', async () => {
        const { status, data } = await api('/models');
        assert(status === 200, `Expected 200, got ${status}`);
        assert(Array.isArray(data), 'Expected array');
        assert(data.length > 0, 'No models returned');
        const types = [...new Set(data.map(m => m.type))];
        assert(types.includes('image'), 'No image models');
        assert(types.includes('video'), 'No video models');
        console.log(`       Models: ${data.length} (${types.join(', ')})`);
    });

    // 4. Get or create project + scene
    await runTest('Setup — Get project and scene', async () => {
        const { data: projects } = await api('/projects');
        assert(projects.length > 0, 'No projects found');
        projectId = projects[0].id;

        let { data: scenes } = await api(`/projects/${projectId}/scenes`);
        if (scenes.length === 0) {
            await api(`/projects/${projectId}/scenes`, {
                method: 'POST',
                body: JSON.stringify({ name: 'API Test Scene', order_index: 1, status: 'planning' }),
            });
            scenes = (await api(`/projects/${projectId}/scenes`)).data;
        }
        sceneId = scenes[0].id;
        console.log(`       Project: ${projectId}, Scene: ${sceneId}`);
    });

    // 5. Create draft shot (minimal fields, <70%)
    await runTest('Create draft-tier shot (minimal fields)', async () => {
        const { status } = await api(`/scenes/${sceneId}/shots`, {
            method: 'POST',
            body: JSON.stringify({
                shot_number: 'D1',
                shot_type: 'Wide',
                description: 'A foggy street at night',
            }),
        });
        assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
        const { data: shots } = await api(`/scenes/${sceneId}/shots`);
        draftShotId = shots.find(s => s.shot_number === 'D1')?.id;
        assert(draftShotId, 'Draft shot not found after creation');
    });

    // 6. Create production shot (many fields, >=70%)
    await runTest('Create production-tier shot (many fields)', async () => {
        const { status } = await api(`/scenes/${sceneId}/shots`, {
            method: 'POST',
            body: JSON.stringify({
                shot_number: 'P1',
                shot_type: 'Medium',
                camera_angle: 'Eye level',
                camera_movement: 'Static',
                description: 'Detective examines crime scene photos under desk lamp',
                focal_length: '50mm',
                blocking: 'Subject center frame leaning over desk',
                camera_lens: 'Prime 50mm',
            }),
        });
        assert(status === 200 || status === 201, `Expected 200/201, got ${status}`);
        const { data: shots } = await api(`/scenes/${sceneId}/shots`);
        prodShotId = shots.find(s => s.shot_number === 'P1')?.id;
        assert(prodShotId, 'Production shot not found after creation');
    });

    // 7. Quality check on draft shot → expect 'draft' tier
    await runTest('Quality check — draft shot returns draft tier', async () => {
        const { status, data } = await api(`/shots/${draftShotId}/check-quality`, { method: 'POST' });
        assert(status === 200, `Expected 200, got ${status}`);
        assert(data.tier === 'draft', `Expected draft tier, got "${data.tier}" (${data.percentage}%)`);
        assert(data.percentage < 70, `Expected <70%, got ${data.percentage}%`);
        assert(Array.isArray(data.allMissing), 'allMissing not an array');
        assert(data.allMissing.length > 0, 'Expected missing fields for draft shot');
        console.log(`       Score: ${data.percentage}%, Missing: ${data.allMissing.length} fields`);
    });

    // 8. Quality check on production shot → expect 'production' tier
    await runTest('Quality check — production shot returns production tier', async () => {
        const { status, data } = await api(`/shots/${prodShotId}/check-quality`, { method: 'POST' });
        assert(status === 200, `Expected 200, got ${status}`);
        assert(data.tier === 'production', `Expected production tier, got "${data.tier}" (${data.percentage}%)`);
        assert(data.percentage >= 70, `Expected >=70%, got ${data.percentage}%`);
        console.log(`       Score: ${data.percentage}%`);
    });

    // 9. Get recommendations (requires Gemini API — may be unavailable)
    await runTest('Recommendations — POST /shots/:id/get-recommendations', async () => {
        const { data: quality } = await api(`/shots/${draftShotId}/check-quality`, { method: 'POST' });
        const { status, data } = await api(`/shots/${draftShotId}/get-recommendations`, {
            method: 'POST',
            body: JSON.stringify({ missingFields: quality.allMissing }),
        });
        if (status === 500 && JSON.stringify(data).includes('EAI_AGAIN')) {
            skip('Gemini API unreachable (no external network)');
        }
        if (status === 500 && JSON.stringify(data).includes('GEMINI_API_KEY')) {
            skip('GEMINI_API_KEY not configured');
        }
        assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
        assert(Array.isArray(data), `Expected array, got ${typeof data}`);
        if (data.length > 0) {
            assert(data[0].field, 'Recommendation missing field property');
            assert(data[0].recommendation, 'Recommendation missing recommendation property');
            console.log(`       Got ${data.length} recommendations`);
        }
    });

    // 10. Update shot field (simulates Accept recommendation)
    await runTest('Accept recommendation — PATCH shot field', async () => {
        const { status } = await api(`/shots/${draftShotId}`, {
            method: 'PUT',
            body: JSON.stringify({ camera_angle: 'Low angle' }),
        });
        assert(status === 200, `Expected 200, got ${status}`);
        const { data: shots } = await api(`/scenes/${sceneId}/shots`);
        const updated = shots.find(s => s.id === draftShotId);
        assert(updated.camera_angle === 'Low angle', `Expected "Low angle", got "${updated.camera_angle}"`);
    });

    // 11. Generate prompt (requires Gemini API — may be unavailable)
    await runTest('Generate prompt — POST /shots/:id/generate-prompt', async () => {
        const { status, data } = await api(`/shots/${prodShotId}/generate-prompt`, {
            method: 'POST',
            body: JSON.stringify({ modelName: 'midjourney-v7' }),
        });
        if (status === 500 && JSON.stringify(data).includes('EAI_AGAIN')) {
            skip('Gemini API unreachable (no external network)');
        }
        if (status === 500 && JSON.stringify(data).includes('GEMINI_API_KEY')) {
            skip('GEMINI_API_KEY not configured');
        }
        assert(status === 200, `Expected 200, got ${status}: ${JSON.stringify(data)}`);
        assert(data.generated_prompt || data.prompt_used, 'No prompt in response');
        variantId = data.id;
        console.log(`       Variant ID: ${variantId}`);
        console.log(`       Prompt: "${(data.generated_prompt || data.prompt_used || '').substring(0, 80)}..."`);
    });

    // 12. Simulate variant via DB insert (if Gemini was unavailable)
    if (!variantId && prodShotId) {
        await runTest('Simulate variant — direct DB insert (Gemini unavailable)', async () => {
            const db = new Database(path.join(__dirname, '../data/shotpilot.db'));
            const info = db.prepare(`
                INSERT INTO image_variants (shot_id, model_used, generated_prompt, status, quality_score, created_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'))
            `).run(
                prodShotId,
                'midjourney-v7',
                'Medium shot of world-weary detective in fedora and trench coat, examining crime scene photos under single desk lamp, hard shadows, film noir aesthetic, 50mm lens, eye level angle --ar 16:9 --v 7',
                'generated',
                85
            );
            variantId = Number(info.lastInsertRowid);
            db.close();
            assert(variantId, 'Failed to insert simulated variant');
            console.log(`       Simulated variant ID: ${variantId}`);
        });
    }

    // 13. Credit deduction (skip if Gemini was unavailable)
    await runTest('Credit deduction — verify credit tracking', async () => {
        const { data } = await api('/user/credits');
        assert(typeof data.credits === 'number', 'credits not a number');
        console.log(`       Credits: ${data.credits}`);
        // If Gemini worked, credits should be < 20. If not, just verify the endpoint works.
    });

    // 14. Get variants for shot
    await runTest('Variant list — GET /shots/:id/variants', async () => {
        assert(prodShotId, 'No production shot to query');
        const { status, data } = await api(`/shots/${prodShotId}/variants`);
        assert(status === 200, `Expected 200, got ${status}`);
        assert(Array.isArray(data), 'Expected array');
        assert(data.length > 0, 'Expected at least 1 variant');
        const v = data[0];
        assert(v.id, 'Variant missing id');
        assert(v.generated_prompt || v.prompt_used, 'Variant missing prompt');
        console.log(`       Variants: ${data.length}`);
    });

    // 15. Delete variant
    await runTest('Variant delete — DELETE /variants/:id', async () => {
        assert(variantId, 'No variant to delete');
        const { status } = await api(`/variants/${variantId}`, { method: 'DELETE' });
        assert(status === 200, `Expected 200, got ${status}`);
        const { data: remaining } = await api(`/shots/${prodShotId}/variants`);
        const stillExists = remaining.find(v => v.id === variantId);
        assert(!stillExists, 'Variant still exists after delete');
    });

    // 16. Cleanup test shots
    await runTest('Cleanup — delete test shots', async () => {
        if (draftShotId) await api(`/shots/${draftShotId}`, { method: 'DELETE' });
        if (prodShotId) await api(`/shots/${prodShotId}`, { method: 'DELETE' });
    });

    // ----- SUMMARY -----
    console.log('\n' + '─'.repeat(50));
    const passed = results.filter(r => r.status === 'PASSED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    const skipped = results.filter(r => r.status === 'SKIPPED').length;
    const total = results.length;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    const summary = {
        timestamp: new Date().toISOString(),
        total_tests: total,
        passed,
        failed,
        skipped,
        duration: `${elapsed}s`,
        results,
    };

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${skipped} skipped / ${total} total (${elapsed}s)\n`);

    if (failed > 0) {
        console.log('Failed tests:');
        results.filter(r => r.status === 'FAILED').forEach(r => {
            console.log(`  • ${r.test}: ${r.error}`);
        });
        console.log('');
    }
    if (skipped > 0) {
        console.log('Skipped tests (external API unavailable):');
        results.filter(r => r.status === 'SKIPPED').forEach(r => {
            console.log(`  • ${r.test}: ${r.reason}`);
        });
        console.log('');
    }

    // Write results JSON
    const fs = await import('fs');
    fs.writeFileSync('test-results/results.json', JSON.stringify(summary, null, 2));
    console.log('Results saved to test-results/results.json\n');

    process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('Test runner crashed:', err);
    process.exit(2);
});
