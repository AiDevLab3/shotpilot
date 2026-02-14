/**
 * Comprehensive route test — hits every API endpoint and reports results.
 * Run with: node tests/route-test.js
 */

const BASE = 'http://localhost:3199';
const results = { pass: 0, fail: 0, errors: [] };

async function test(method, path, body, expectedStatus, label) {
    const url = `${BASE}${path}`;
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    try {
        const res = await fetch(url, opts);
        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch { json = text; }

        const ok = expectedStatus ? res.status === expectedStatus : res.status < 400;
        if (ok) {
            results.pass++;
            console.log(`  PASS  ${method.padEnd(6)} ${path} => ${res.status}`);
        } else {
            results.fail++;
            const msg = `${label || ''} ${method} ${path} => ${res.status} (expected ${expectedStatus || '<400'}) ${typeof json === 'string' ? json.slice(0, 100) : JSON.stringify(json).slice(0, 100)}`;
            results.errors.push(msg);
            console.log(`  FAIL  ${msg}`);
        }
        return { status: res.status, json };
    } catch (e) {
        results.fail++;
        const msg = `${label || ''} ${method} ${path} => ERROR: ${e.message}`;
        results.errors.push(msg);
        console.log(`  FAIL  ${msg}`);
        return { status: 0, json: null };
    }
}

async function run() {
    console.log('\n=== AUTH ROUTES ===');
    await test('POST', '/api/auth/login', { email: 'test@shotpilot.com', password: 'test123' }, 200, 'login');
    await test('GET', '/api/auth/me', null, 200, 'me');
    await test('GET', '/api/user/credits', null, 200, 'credits');
    await test('GET', '/api/user/usage', null, 200, 'usage');
    // Don't test logout — it would break session for other tests

    console.log('\n=== PROJECT ROUTES ===');
    const { json: proj } = await test('POST', '/api/projects', {
        title: 'Test Project',
        frame_size: '16:9',
        purpose: 'Testing',
        style_aesthetic: 'Neo-noir',
    }, 200, 'create project');
    const projectId = proj?.id;

    await test('GET', '/api/projects', null, 200, 'list projects');
    if (projectId) {
        await test('PUT', `/api/projects/${projectId}`, { title: 'Updated Test Project' }, 200, 'update project');
    }

    console.log('\n=== CHARACTER ROUTES ===');
    let charId;
    if (projectId) {
        const { json: char } = await test('POST', `/api/projects/${projectId}/characters`, {
            name: 'Test Hero',
            description: 'Tall, dark hair',
            personality: 'Brave',
        }, 200, 'create character');
        charId = char?.id;

        await test('GET', `/api/projects/${projectId}/characters`, null, 200, 'list characters');
        if (charId) {
            await test('PUT', `/api/characters/${charId}`, { name: 'Updated Hero' }, 200, 'update character');
        }
    }

    console.log('\n=== OBJECT ROUTES ===');
    let objId;
    if (projectId) {
        const { json: obj } = await test('POST', `/api/projects/${projectId}/objects`, {
            name: 'Test Prop',
            description: 'Vintage camera',
        }, 200, 'create object');
        objId = obj?.id;

        await test('GET', `/api/projects/${projectId}/objects`, null, 200, 'list objects');
        if (objId) {
            await test('PUT', `/api/objects/${objId}`, { description: 'Vintage Leica camera' }, 200, 'update object');
        }
    }

    console.log('\n=== PROJECT IMAGES ===');
    if (projectId) {
        const { json: pImg } = await test('POST', `/api/projects/${projectId}/images`, {
            image_url: '/uploads/images/test.jpg',
            title: 'Test Image',
            notes: 'For testing',
        }, 200, 'create project image');
        const pImgId = pImg?.id;

        await test('GET', `/api/projects/${projectId}/images`, null, 200, 'list project images');
        if (pImgId) {
            await test('PUT', `/api/project-images/${pImgId}`, { title: 'Updated Title' }, 200, 'update project image');
            await test('DELETE', `/api/project-images/${pImgId}`, null, 200, 'delete project image');
        }
    }

    console.log('\n=== SCENE ROUTES ===');
    let sceneId;
    if (projectId) {
        const { json: scene } = await test('POST', `/api/projects/${projectId}/scenes`, {
            name: 'Test Scene',
            description: 'An alley at night',
            location_setting: 'Dark alley',
            time_of_day: 'Night',
            mood_tone: 'Tense',
        }, 200, 'create scene');
        sceneId = scene?.id;

        await test('GET', `/api/projects/${projectId}/scenes`, null, 200, 'list scenes');
        if (sceneId) {
            await test('PUT', `/api/scenes/${sceneId}`, { mood_tone: 'Very tense' }, 200, 'update scene');
        }
    }

    console.log('\n=== SHOT ROUTES ===');
    let shotId;
    if (sceneId) {
        const { json: shot } = await test('POST', `/api/scenes/${sceneId}/shots`, {
            shot_number: '1',
            shot_type: 'Wide Shot',
            camera_angle: 'Eye Level',
            camera_movement: 'Static',
            description: 'Establishing shot of the alley',
            focal_length: '24mm',
            blocking: 'Hero enters from left',
        }, 200, 'create shot');
        shotId = shot?.id;

        await test('GET', `/api/scenes/${sceneId}/shots`, null, 200, 'list shots');
        if (shotId) {
            await test('PUT', `/api/shots/${shotId}`, { camera_movement: 'Dolly In' }, 200, 'update shot');
        }

        // Create a second shot to test insert-after ordering
        await test('POST', `/api/scenes/${sceneId}/shots`, {
            shot_number: '2',
            shot_type: 'Close-up',
            camera_angle: 'Low Angle',
            description: 'Hero face detail',
            insertAfterOrderIndex: 1,
        }, 200, 'create shot with insertAfter');
    }

    console.log('\n=== IMAGE VARIANT ROUTES ===');
    let variantId;
    if (shotId) {
        // Create variant via shot images
        const { json: variant } = await test('POST', `/api/shots/${shotId}/images`, {
            image_url: '/uploads/images/test.jpg',
            prompt_used: 'test prompt',
        }, 200, 'create variant');
        variantId = variant?.id;

        await test('GET', `/api/shots/${shotId}/images`, null, 200, 'list shot images');
        await test('GET', `/api/shots/${shotId}/variants`, null, 200, 'list variants');

        if (variantId) {
            await test('PUT', `/api/variants/${variantId}`, {
                user_edited_prompt: 'updated prompt',
                status: 'draft',
            }, 200, 'update variant');

            // Test GET audit (no audit yet)
            await test('GET', `/api/variants/${variantId}/audit`, null, 200, 'get audit (none yet)');
        }
    }

    console.log('\n=== AI ROUTES (non-credit) ===');
    await test('GET', '/api/models', null, 200, 'list models');
    await test('GET', '/api/usage/stats', null, 200, 'usage stats');

    if (shotId) {
        await test('POST', `/api/shots/${shotId}/check-readiness`, { useKB: false }, 200, 'check readiness (basic)');
        await test('POST', `/api/shots/${shotId}/check-quality`, { useKB: false }, null, 'check quality (compat alias)');
    }

    if (projectId) {
        await test('POST', `/api/projects/${projectId}/aesthetic-suggestions`, {}, null, 'aesthetic suggestions');
        await test('POST', `/api/projects/${projectId}/character-suggestions`, {
            name: 'Test Hero', description: 'Tall', personality: 'Brave'
        }, null, 'character suggestions');
        await test('POST', `/api/projects/${projectId}/object-suggestions`, {
            name: 'Test Prop', description: 'Vintage camera'
        }, null, 'object suggestions');
        await test('POST', `/api/projects/${projectId}/refine-content`, {
            type: 'character',
            currentContent: { name: 'Hero', description: 'Tall' },
            message: 'Make them shorter',
        }, null, 'refine content');
    }

    if (sceneId) {
        await test('POST', `/api/scenes/${sceneId}/shot-plan`, {}, null, 'shot plan');
    }

    if (shotId) {
        await test('POST', `/api/shots/${shotId}/readiness-dialogue`, {
            message: 'What am I missing?',
            history: [],
        }, null, 'readiness dialogue');

        await test('POST', `/api/shots/${shotId}/quality-dialogue`, {
            message: 'Help me improve',
            history: [],
        }, null, 'quality dialogue (compat alias)');
    }

    if (projectId) {
        await test('POST', `/api/projects/${projectId}/analyze-script`, {
            scriptText: 'INT. OFFICE - DAY\n\nJohn enters the room.'
        }, null, 'analyze script');

        await test('POST', `/api/projects/${projectId}/creative-director`, {
            message: 'Hello, I need help with my project',
            history: [],
            mode: 'initial',
        }, null, 'creative director');

        // Compact needs 10+ messages
        await test('POST', `/api/projects/${projectId}/compact-conversation`, {
            messages: Array(3).fill({ role: 'user', content: 'test' }),
        }, 400, 'compact conversation (too few messages)');
    }

    console.log('\n=== CLEANUP ===');
    // Delete in reverse order
    if (variantId) await test('DELETE', `/api/variants/${variantId}`, null, 200, 'delete variant');
    if (variantId) await test('DELETE', `/api/images/${variantId}`, null, 200, 'delete image variant');
    if (shotId) await test('DELETE', `/api/shots/${shotId}`, null, 200, 'delete shot');
    if (sceneId) await test('DELETE', `/api/scenes/${sceneId}`, null, 200, 'delete scene');
    if (charId) await test('DELETE', `/api/characters/${charId}`, null, 200, 'delete character');
    if (objId) await test('DELETE', `/api/objects/${objId}`, null, 200, 'delete object');
    if (projectId) await test('DELETE', `/api/projects/${projectId}`, null, 200, 'delete project');

    console.log('\n=== RESULTS ===');
    console.log(`PASS: ${results.pass}  FAIL: ${results.fail}`);
    if (results.errors.length > 0) {
        console.log('\nFailed tests:');
        results.errors.forEach(e => console.log('  - ' + e));
    }

    process.exit(results.fail > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
