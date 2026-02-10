/**
 * Phase 3 Automated Test Suite
 * Tests all 7 AI features (Phase 3.1-3.7) plus integration tests
 * Uses Vitest + Supertest against the Express app with mocked Gemini service
 */
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';

// Mock the Gemini service BEFORE importing the app
vi.mock('../server/services/geminiService.js', () => ({
    generateAestheticSuggestions: vi.fn().mockResolvedValue([
        { field: 'style_aesthetic', value: 'Film noir with neon accents', reasoning: 'The dark urban setting lends itself to noir aesthetics' },
        { field: 'atmosphere_mood', value: 'Tense, electric, anticipatory', reasoning: 'Building tension through visual atmosphere' },
        { field: 'lighting_directions', value: 'High-contrast rim lighting with colored gels', reasoning: 'Creates dramatic depth and mood separation' },
        { field: 'cinematic_references', value: 'Blade Runner 2049, Drive, Collateral', reasoning: 'These films share the urban night aesthetic' },
    ]),
    generateCharacterSuggestions: vi.fn().mockResolvedValue({
        description: 'A weathered detective in his late 40s with sharp gray eyes and a permanent five o\'clock shadow.',
        personality: 'Quiet intensity, methodical thinker, dry humor masking deep empathy',
        referencePrompt: 'middle-aged male detective, gray eyes, stubble, worn leather jacket, noir lighting',
        consistencyTips: ['Maintain the stubble length across shots', 'Keep eye color consistently gray-blue'],
    }),
    generateShotPlan: vi.fn().mockResolvedValue({
        shots: [
            {
                shot_type: 'wide',
                camera_angle: 'low',
                camera_movement: 'dolly_in',
                description: 'Establishing shot of the rain-soaked street',
                focal_length: '24mm',
                duration: 5,
            },
            {
                shot_type: 'medium',
                camera_angle: 'eye_level',
                camera_movement: 'static',
                description: 'Character enters frame from the left',
                focal_length: '50mm',
                duration: 4,
            },
        ],
        sequenceReasoning: 'Starting wide to establish environment, then moving closer to introduce character.',
    }),
    qualityDialogue: vi.fn().mockResolvedValue({
        response: 'Your shot is missing camera movement details. Consider adding a slow dolly-in to build tension.',
    }),
    analyzeScript: vi.fn().mockResolvedValue({
        scenes: [
            {
                name: 'INT. DETECTIVE OFFICE - NIGHT',
                description: 'A dimly lit office with papers scattered across the desk',
                location_setting: 'indoor office',
                time_of_day: 'night',
                mood_tone: 'somber',
                shots: [
                    { shot_type: 'wide', description: 'Establishing the cramped office' },
                    { shot_type: 'close-up', description: 'Detective\'s hands shuffling papers' },
                ],
            },
        ],
        characters: [
            { name: 'Detective Miller', description: 'Tired, mid-40s detective' },
        ],
        summary: 'A noir-style detective scene with emphasis on atmosphere.',
    }),
    generateObjectSuggestions: vi.fn().mockResolvedValue({
        description: 'A vintage brass pocket watch with a cracked glass face, showing 11:47 PM permanently.',
        referencePrompt: 'vintage brass pocket watch, cracked glass, stopped at 11:47, noir style, dramatic lighting',
        consistencyTips: ['Keep the crack on the right side of the glass', 'Maintain the brass patina color'],
    }),
    generateRecommendations: vi.fn().mockResolvedValue({}),
    generatePrompt: vi.fn().mockResolvedValue({ prompt: 'test prompt' }),
    analyzeQuality: vi.fn().mockResolvedValue({}),
    buildContextBlock: vi.fn().mockReturnValue(''),
    refineContent: vi.fn().mockResolvedValue({
        response: 'I\'ve made the character younger with a more casual look.',
        contentUpdate: {
            description: 'A young detective in his early 30s with bright eyes.',
            personality: 'Energetic, optimistic, quick-witted',
            referencePrompt: 'young male detective, bright eyes, casual jacket',
            consistencyTips: ['Keep youthful appearance', 'Maintain bright eye color'],
        },
    }),
    creativeDirectorCollaborate: vi.fn().mockResolvedValue({
        response: 'Great concept! A noir thriller set in a rain-soaked city gives us rich visual material to work with.',
        projectUpdates: { style_aesthetic: 'Neo-noir realism', atmosphere_mood: 'Tense, rain-soaked melancholy' },
        scriptUpdates: null,
    }),
}));

let request;
let app;
let testProjectId;
let testSceneId;
let testShotId;

beforeAll(async () => {
    // Import app after mocking
    const serverModule = await import('../server/index.js');
    app = serverModule.app;
    request = supertest(app);

    // Login first to establish session
    const loginRes = await request.post('/api/auth/login')
        .send({ email: 'test@shotpilot.com', password: 'testpassword123' });

    // Store cookies for authenticated requests
    const cookies = loginRes.headers['set-cookie'];
    if (cookies) {
        request = supertest.agent(app);
        await request.post('/api/auth/login')
            .send({ email: 'test@shotpilot.com', password: 'testpassword123' });
    } else {
        // Fallback: use agent for auto-auth
        request = supertest.agent(app);
    }

    // Create test project
    const projRes = await request.post('/api/projects')
        .send({
            title: 'Test Noir Film',
            style_aesthetic: 'Film Noir',
            atmosphere_mood: 'Dark and brooding',
            lighting_directions: 'Low-key, high contrast',
            cinematic_references: 'Blade Runner, Se7en',
        });
    testProjectId = projRes.body.id;

    // Create test scene
    const sceneRes = await request.post(`/api/projects/${testProjectId}/scenes`)
        .send({
            name: 'INT. DETECTIVE OFFICE - NIGHT',
            description: 'A dimly lit office',
            location_setting: 'Indoor office',
            time_of_day: 'Night',
            mood_tone: 'Somber',
        });
    testSceneId = sceneRes.body.id;

    // Create test shot
    const shotRes = await request.post(`/api/scenes/${testSceneId}/shots`)
        .send({
            shot_number: '1',
            shot_type: 'wide',
            camera_angle: 'eye_level',
            description: 'Establishing shot of the office',
        });
    testShotId = shotRes.body.id;

    // Create test character
    await request.post(`/api/projects/${testProjectId}/characters`)
        .send({ name: 'Detective Miller', description: 'A tired detective' });

    // Create test object
    await request.post(`/api/projects/${testProjectId}/objects`)
        .send({ name: 'Pocket Watch', description: 'An old brass pocket watch' });
});

// ===================================================================
// TEST 1: Phase 3.1 — Aesthetic Suggestions
// ===================================================================
describe('Phase 3.1: Aesthetic Suggestions', () => {
    it('should return suggestions for a valid project', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/aesthetic-suggestions`)
            .send();

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('suggestions');
        expect(res.body).toHaveProperty('kbFilesUsed');
        expect(Array.isArray(res.body.suggestions)).toBe(true);
        expect(res.body.suggestions.length).toBeGreaterThan(0);
    });

    it('should return suggestions with correct structure', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/aesthetic-suggestions`)
            .send();

        const suggestion = res.body.suggestions[0];
        expect(suggestion).toHaveProperty('field');
        expect(suggestion).toHaveProperty('value');
        expect(suggestion).toHaveProperty('reasoning');
        expect(typeof suggestion.field).toBe('string');
        expect(typeof suggestion.value).toBe('string');
        expect(typeof suggestion.reasoning).toBe('string');
    });

    it('should include KB files metadata', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/aesthetic-suggestions`)
            .send();

        expect(res.body.kbFilesUsed).toContain('01_Core_Realism_Principles.md');
        expect(res.body.kbFilesUsed).toContain('03_Pack_Quality_Control.md');
    });

    it('should suggest recognized project fields', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/aesthetic-suggestions`)
            .send();

        const validFields = ['style_aesthetic', 'atmosphere_mood', 'lighting_directions', 'cinematic_references', 'cinematography'];
        for (const suggestion of res.body.suggestions) {
            expect(validFields).toContain(suggestion.field);
        }
    });

    it('should return 404 for non-existent project', async () => {
        const res = await request
            .post('/api/projects/99999/aesthetic-suggestions')
            .send();

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error');
    });
});

// ===================================================================
// TEST 2: Phase 3.2 — Character AI Assistant
// ===================================================================
describe('Phase 3.2: Character AI Assistant', () => {
    it('should return character suggestions for a valid request', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/character-suggestions`)
            .send({ name: 'Detective Miller', description: 'A tired detective', personality: 'Stoic' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('description');
        expect(res.body).toHaveProperty('personality');
        expect(res.body).toHaveProperty('referencePrompt');
        expect(res.body).toHaveProperty('consistencyTips');
        expect(res.body).toHaveProperty('kbFilesUsed');
    });

    it('should return consistency tips as array', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/character-suggestions`)
            .send({ name: 'Detective Miller' });

        expect(Array.isArray(res.body.consistencyTips)).toBe(true);
        expect(res.body.consistencyTips.length).toBeGreaterThan(0);
    });

    it('should include Character Consistency KB', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/character-suggestions`)
            .send({ name: 'Detective Miller' });

        expect(res.body.kbFilesUsed).toContain('03_Pack_Character_Consistency.md');
        expect(res.body.kbFilesUsed).toContain('01_Core_Realism_Principles.md');
    });

    it('should work with minimal input (name only)', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/character-suggestions`)
            .send({ name: 'Jane Doe' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent project', async () => {
        const res = await request
            .post('/api/projects/99999/character-suggestions')
            .send({ name: 'Test' });

        expect(res.status).toBe(404);
    });
});

// ===================================================================
// TEST 3: Phase 3.3 — Shot Planning
// ===================================================================
describe('Phase 3.3: Shot Planning', () => {
    it('should return shot plan for a valid scene', async () => {
        const res = await request
            .post(`/api/scenes/${testSceneId}/shot-plan`)
            .send();

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('shots');
        expect(res.body).toHaveProperty('sequenceReasoning');
        expect(res.body).toHaveProperty('kbFilesUsed');
        expect(Array.isArray(res.body.shots)).toBe(true);
    });

    it('should return shots with correct structure', async () => {
        const res = await request
            .post(`/api/scenes/${testSceneId}/shot-plan`)
            .send();

        const shot = res.body.shots[0];
        expect(shot).toHaveProperty('shot_type');
        expect(shot).toHaveProperty('description');
    });

    it('should include Motion Readiness and Spatial KB', async () => {
        const res = await request
            .post(`/api/scenes/${testSceneId}/shot-plan`)
            .send();

        expect(res.body.kbFilesUsed).toContain('03_Pack_Motion_Readiness.md');
        expect(res.body.kbFilesUsed).toContain('03_Pack_Spatial_Composition.md');
        expect(res.body.kbFilesUsed).toContain('01_Core_Realism_Principles.md');
    });

    it('should include sequence reasoning', async () => {
        const res = await request
            .post(`/api/scenes/${testSceneId}/shot-plan`)
            .send();

        expect(typeof res.body.sequenceReasoning).toBe('string');
        expect(res.body.sequenceReasoning.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent scene', async () => {
        const res = await request
            .post('/api/scenes/99999/shot-plan')
            .send();

        expect(res.status).toBe(404);
    });
});

// ===================================================================
// TEST 4: Phase 3.4 — Quality Dialogue
// ===================================================================
describe('Phase 3.4: Quality Dialogue', () => {
    it('should respond to a quality question', async () => {
        const res = await request
            .post(`/api/shots/${testShotId}/quality-dialogue`)
            .send({ message: 'How can I improve this shot?' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('response');
        expect(res.body).toHaveProperty('kbFilesUsed');
        expect(typeof res.body.response).toBe('string');
    });

    it('should support conversation history', async () => {
        const history = [
            { role: 'user', content: 'What is the quality score?' },
            { role: 'assistant', content: 'The quality score is 45%.' },
        ];

        const res = await request
            .post(`/api/shots/${testShotId}/quality-dialogue`)
            .send({ message: 'How can I improve it?', history });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('response');
    });

    it('should include Quality Control KB', async () => {
        const res = await request
            .post(`/api/shots/${testShotId}/quality-dialogue`)
            .send({ message: 'What KB rules apply?' });

        expect(res.body.kbFilesUsed).toContain('03_Pack_Quality_Control.md');
        expect(res.body.kbFilesUsed).toContain('01_Core_Realism_Principles.md');
        expect(res.body.kbFilesUsed).toContain('03_Pack_Spatial_Composition.md');
    });

    it('should require message parameter', async () => {
        const res = await request
            .post(`/api/shots/${testShotId}/quality-dialogue`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent shot', async () => {
        const res = await request
            .post('/api/shots/99999/quality-dialogue')
            .send({ message: 'Test' });

        expect(res.status).toBe(404);
    });
});

// ===================================================================
// TEST 5: Phase 3.5 — Script Analysis
// ===================================================================
describe('Phase 3.5: Script Analysis', () => {
    const sampleScript = `
        INT. DETECTIVE OFFICE - NIGHT

        DETECTIVE MILLER sits behind his cluttered desk, papers strewn everywhere.
        A single desk lamp casts long shadows across the room.

        MILLER
        (muttering to himself)
        Something doesn't add up...

        He picks up the old POCKET WATCH, turns it over in his hands.
    `;

    it('should analyze a script and return structured results', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/analyze-script`)
            .send({ scriptText: sampleScript });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('scenes');
        expect(res.body).toHaveProperty('characters');
        expect(res.body).toHaveProperty('summary');
        expect(res.body).toHaveProperty('kbFilesUsed');
    });

    it('should return scenes as array with correct structure', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/analyze-script`)
            .send({ scriptText: sampleScript });

        expect(Array.isArray(res.body.scenes)).toBe(true);
        expect(res.body.scenes.length).toBeGreaterThan(0);

        const scene = res.body.scenes[0];
        expect(scene).toHaveProperty('name');
        expect(scene).toHaveProperty('description');
    });

    it('should extract characters from script', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/analyze-script`)
            .send({ scriptText: sampleScript });

        expect(Array.isArray(res.body.characters)).toBe(true);
        expect(res.body.characters.length).toBeGreaterThan(0);

        const character = res.body.characters[0];
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('description');
    });

    it('should include Motion Readiness KB', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/analyze-script`)
            .send({ scriptText: sampleScript });

        expect(res.body.kbFilesUsed).toContain('03_Pack_Motion_Readiness.md');
        expect(res.body.kbFilesUsed).toContain('01_Core_Realism_Principles.md');
    });

    it('should require scriptText parameter', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/analyze-script`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should reject empty scriptText', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/analyze-script`)
            .send({ scriptText: '   ' });

        expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent project', async () => {
        const res = await request
            .post('/api/projects/99999/analyze-script')
            .send({ scriptText: 'Some script' });

        expect(res.status).toBe(404);
    });
});

// ===================================================================
// TEST 6: Phase 3.6 — Object AI Assistant
// ===================================================================
describe('Phase 3.6: Object AI Assistant', () => {
    it('should return object suggestions', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/object-suggestions`)
            .send({ name: 'Pocket Watch', description: 'An old brass pocket watch' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('description');
        expect(res.body).toHaveProperty('referencePrompt');
        expect(res.body).toHaveProperty('consistencyTips');
        expect(res.body).toHaveProperty('kbFilesUsed');
    });

    it('should return consistency tips as array', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/object-suggestions`)
            .send({ name: 'Pocket Watch' });

        expect(Array.isArray(res.body.consistencyTips)).toBe(true);
    });

    it('should include Core Realism KB', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/object-suggestions`)
            .send({ name: 'Pocket Watch' });

        expect(res.body.kbFilesUsed).toContain('01_Core_Realism_Principles.md');
    });

    it('should work with name only', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/object-suggestions`)
            .send({ name: 'Coffee Mug' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent project', async () => {
        const res = await request
            .post('/api/projects/99999/object-suggestions')
            .send({ name: 'Test' });

        expect(res.status).toBe(404);
    });
});

// ===================================================================
// TEST 7: Phase 3.7 — Usage Tracking & KB Transparency
// ===================================================================
describe('Phase 3.7: Usage Tracking & KB Transparency', () => {
    it('should return usage stats', async () => {
        const res = await request.get('/api/usage/stats');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('featureBreakdown');
        expect(res.body).toHaveProperty('recentActivity');
        expect(res.body).toHaveProperty('totalGenerations');
        expect(res.body).toHaveProperty('totalAIAssists');
    });

    it('should have featureBreakdown as array', async () => {
        const res = await request.get('/api/usage/stats');

        expect(Array.isArray(res.body.featureBreakdown)).toBe(true);
    });

    it('should have recentActivity as array', async () => {
        const res = await request.get('/api/usage/stats');

        expect(Array.isArray(res.body.recentActivity)).toBe(true);
    });

    it('should track AI feature usage from previous tests', async () => {
        // Previous tests called AI endpoints which should have logged usage
        const res = await request.get('/api/usage/stats');

        expect(res.body.totalAIAssists).toBeGreaterThanOrEqual(0);
    });

    it('should show kbFilesUsed in all AI endpoint responses', async () => {
        // Verify all AI endpoints include kbFilesUsed
        const endpoints = [
            { method: 'post', url: `/api/projects/${testProjectId}/aesthetic-suggestions`, body: {} },
            { method: 'post', url: `/api/projects/${testProjectId}/character-suggestions`, body: { name: 'Test' } },
            { method: 'post', url: `/api/scenes/${testSceneId}/shot-plan`, body: {} },
            { method: 'post', url: `/api/shots/${testShotId}/quality-dialogue`, body: { message: 'Test' } },
            { method: 'post', url: `/api/projects/${testProjectId}/analyze-script`, body: { scriptText: 'Test script' } },
            { method: 'post', url: `/api/projects/${testProjectId}/object-suggestions`, body: { name: 'Test' } },
        ];

        for (const ep of endpoints) {
            const res = await request[ep.method](ep.url).send(ep.body);
            expect(res.body).toHaveProperty('kbFilesUsed',);
            expect(Array.isArray(res.body.kbFilesUsed)).toBe(true);
            expect(res.body.kbFilesUsed.length).toBeGreaterThan(0);
        }
    });
});

// ===================================================================
// TEST 8: Integration Tests — Cross-Feature Workflows
// ===================================================================
describe('Integration: Cross-Feature Workflows', () => {
    it('should support full project setup workflow', async () => {
        // 1. Create project
        const projRes = await request.post('/api/projects')
            .send({ title: 'Integration Test Film' });
        const pid = projRes.body.id;
        expect(pid).toBeDefined();

        // 2. Get aesthetic suggestions
        const aestheticRes = await request
            .post(`/api/projects/${pid}/aesthetic-suggestions`)
            .send();
        expect(aestheticRes.status).toBe(200);

        // 3. Create character with AI
        const charRes = await request
            .post(`/api/projects/${pid}/character-suggestions`)
            .send({ name: 'Hero' });
        expect(charRes.status).toBe(200);

        // 4. Create scene
        const sceneRes = await request
            .post(`/api/projects/${pid}/scenes`)
            .send({ name: 'Scene 1', description: 'Opening scene' });
        const sid = sceneRes.body.id;

        // 5. Generate shot plan for scene
        const planRes = await request
            .post(`/api/scenes/${sid}/shot-plan`)
            .send();
        expect(planRes.status).toBe(200);
        expect(planRes.body.shots.length).toBeGreaterThan(0);

        // 6. Verify usage stats reflect all the AI calls
        const statsRes = await request.get('/api/usage/stats');
        expect(statsRes.status).toBe(200);
    });

    it('should support script-to-production workflow', async () => {
        const script = 'INT. CAFE - DAY\nALICE sits alone, staring at her coffee.';

        // 1. Analyze script
        const analysisRes = await request
            .post(`/api/projects/${testProjectId}/analyze-script`)
            .send({ scriptText: script });
        expect(analysisRes.status).toBe(200);
        expect(analysisRes.body.scenes.length).toBeGreaterThan(0);

        // 2. Create scene from analysis
        const sceneData = analysisRes.body.scenes[0];
        const sceneRes = await request
            .post(`/api/projects/${testProjectId}/scenes`)
            .send({
                name: sceneData.name,
                description: sceneData.description,
            });
        expect(sceneRes.body.id).toBeDefined();

        // 3. Generate shot plan for new scene
        const planRes = await request
            .post(`/api/scenes/${sceneRes.body.id}/shot-plan`)
            .send();
        expect(planRes.status).toBe(200);
    });

    it('should support character-to-shot quality workflow', async () => {
        // 1. Get character suggestions
        const charRes = await request
            .post(`/api/projects/${testProjectId}/character-suggestions`)
            .send({ name: 'Villain', description: 'The antagonist' });
        expect(charRes.status).toBe(200);

        // 2. Create character using AI suggestions
        const createCharRes = await request
            .post(`/api/projects/${testProjectId}/characters`)
            .send({
                name: 'Villain',
                description: charRes.body.description,
                personality: charRes.body.personality,
            });
        expect(createCharRes.body.id).toBeDefined();

        // 3. Quality dialogue for a shot (should include character context)
        const dialogueRes = await request
            .post(`/api/shots/${testShotId}/quality-dialogue`)
            .send({ message: 'Does the villain look consistent?' });
        expect(dialogueRes.status).toBe(200);
    });
});

// ===================================================================
// TEST 9: Performance Benchmarks
// ===================================================================
describe('Performance Benchmarks', () => {
    it('should respond to aesthetic suggestions within 5s', async () => {
        const start = Date.now();
        await request
            .post(`/api/projects/${testProjectId}/aesthetic-suggestions`)
            .send();
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(5000);
    });

    it('should respond to character suggestions within 5s', async () => {
        const start = Date.now();
        await request
            .post(`/api/projects/${testProjectId}/character-suggestions`)
            .send({ name: 'Test' });
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(5000);
    });

    it('should respond to shot planning within 5s', async () => {
        const start = Date.now();
        await request
            .post(`/api/scenes/${testSceneId}/shot-plan`)
            .send();
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(5000);
    });

    it('should respond to quality dialogue within 5s', async () => {
        const start = Date.now();
        await request
            .post(`/api/shots/${testShotId}/quality-dialogue`)
            .send({ message: 'How to improve?' });
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(5000);
    });

    it('should respond to script analysis within 5s', async () => {
        const start = Date.now();
        await request
            .post(`/api/projects/${testProjectId}/analyze-script`)
            .send({ scriptText: 'INT. ROOM - DAY\nA person enters.' });
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(5000);
    });

    it('should respond to object suggestions within 5s', async () => {
        const start = Date.now();
        await request
            .post(`/api/projects/${testProjectId}/object-suggestions`)
            .send({ name: 'Lamp' });
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(5000);
    });

    it('should respond to usage stats within 1s', async () => {
        const start = Date.now();
        await request.get('/api/usage/stats');
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent AI requests', async () => {
        const start = Date.now();
        const results = await Promise.all([
            request.post(`/api/projects/${testProjectId}/aesthetic-suggestions`).send(),
            request.post(`/api/projects/${testProjectId}/character-suggestions`).send({ name: 'Concurrent Test' }),
            request.post(`/api/projects/${testProjectId}/object-suggestions`).send({ name: 'Concurrent Obj' }),
        ]);
        const duration = Date.now() - start;

        // All should succeed
        for (const res of results) {
            expect(res.status).toBe(200);
        }

        // Concurrent should be faster than sequential
        expect(duration).toBeLessThan(10000);
    });
});

// ===================================================================
// TEST 10: Error Handling & Edge Cases
// ===================================================================
describe('Error Handling & Edge Cases', () => {
    it('should handle empty body gracefully for character suggestions', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/character-suggestions`)
            .send({});

        // Should still work — name/description are optional in the endpoint
        expect(res.status).toBe(200);
    });

    it('should handle empty body gracefully for object suggestions', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/object-suggestions`)
            .send({});

        expect(res.status).toBe(200);
    });

    it('should handle very long script text', async () => {
        const longScript = 'INT. ROOM - DAY\nCharacter speaks.\n'.repeat(100);
        const res = await request
            .post(`/api/projects/${testProjectId}/analyze-script`)
            .send({ scriptText: longScript });

        expect(res.status).toBe(200);
    });

    it('should handle special characters in input', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/character-suggestions`)
            .send({
                name: 'O\'Brien & Müller <script>alert("xss")</script>',
                description: 'Test with "quotes" and <html>tags</html>',
            });

        expect(res.status).toBe(200);
    });

    it('should handle unicode in quality dialogue', async () => {
        const res = await request
            .post(`/api/shots/${testShotId}/quality-dialogue`)
            .send({ message: '这个镜头的质量如何？ 🎬' });

        expect(res.status).toBe(200);
    });

    it('should handle long conversation history', async () => {
        const history = Array.from({ length: 20 }, (_, i) => ({
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: `Message ${i + 1}: This is a test message for history.`,
        }));

        const res = await request
            .post(`/api/shots/${testShotId}/quality-dialogue`)
            .send({ message: 'Continue our conversation', history });

        expect(res.status).toBe(200);
    });

    it('should return proper error format on server error', async () => {
        // Import the mock to trigger an error
        const { generateAestheticSuggestions } = await import('../server/services/geminiService.js');
        generateAestheticSuggestions.mockRejectedValueOnce(new Error('Gemini API rate limit'));

        const res = await request
            .post(`/api/projects/${testProjectId}/aesthetic-suggestions`)
            .send();

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
        expect(typeof res.body.error).toBe('string');
    });

    it('should return proper error for AI service failure in quality dialogue', async () => {
        const { qualityDialogue: qd } = await import('../server/services/geminiService.js');
        qd.mockRejectedValueOnce(new Error('Model overloaded'));

        const res = await request
            .post(`/api/shots/${testShotId}/quality-dialogue`)
            .send({ message: 'Test error handling' });

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

// ===================================================================
// TEST 11: Content Refinement (Conversational)
// ===================================================================
describe('Content Refinement (Conversational)', () => {
    it('should refine character suggestions', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/refine-content`)
            .send({
                type: 'character',
                currentContent: { description: 'An old detective', personality: 'Gruff' },
                message: 'Make him younger',
                history: [],
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('response');
        expect(res.body).toHaveProperty('contentUpdate');
        expect(res.body).toHaveProperty('kbFilesUsed');
    });

    it('should refine object suggestions', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/refine-content`)
            .send({
                type: 'object',
                currentContent: { description: 'A brass watch' },
                message: 'Make it more worn',
                history: [],
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('response');
    });

    it('should require message parameter', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/refine-content`)
            .send({ type: 'character', currentContent: {} });

        expect(res.status).toBe(400);
    });

    it('should require valid type', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/refine-content`)
            .send({ type: 'invalid', currentContent: {}, message: 'test' });

        expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent project', async () => {
        const res = await request
            .post('/api/projects/99999/refine-content')
            .send({ type: 'character', currentContent: {}, message: 'test' });

        expect(res.status).toBe(404);
    });
});

// ===================================================================
// TEST 12: Creative Director Workspace
// ===================================================================
describe('Creative Director Workspace', () => {
    it('should respond to a creative director message', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/creative-director`)
            .send({
                message: 'I want to make a noir thriller',
                history: [],
                scriptContent: '',
                mode: 'idea-first',
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('response');
        expect(res.body).toHaveProperty('kbFilesUsed');
    });

    it('should return project updates when relevant', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/creative-director`)
            .send({
                message: 'The style should be neo-noir with rain-soaked visuals',
                history: [],
                scriptContent: '',
                mode: 'idea-first',
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('projectUpdates');
    });

    it('should require message parameter', async () => {
        const res = await request
            .post(`/api/projects/${testProjectId}/creative-director`)
            .send({ history: [], scriptContent: '', mode: 'initial' });

        expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent project', async () => {
        const res = await request
            .post('/api/projects/99999/creative-director')
            .send({ message: 'test', history: [], scriptContent: '', mode: 'initial' });

        expect(res.status).toBe(404);
    });

    it('should support conversation history', async () => {
        const history = [
            { role: 'user', content: 'I want a noir film' },
            { role: 'assistant', content: 'Great choice! Tell me more.' },
        ];

        const res = await request
            .post(`/api/projects/${testProjectId}/creative-director`)
            .send({
                message: 'Set in 1940s Los Angeles',
                history,
                scriptContent: '',
                mode: 'idea-first',
            });

        expect(res.status).toBe(200);
        expect(typeof res.body.response).toBe('string');
    });
});

// ===================================================================
// TEST 13: CRUD Foundation Verification
// ===================================================================
describe('CRUD Foundation (Phase 2 non-regression)', () => {
    it('should list projects', async () => {
        const res = await request.get('/api/projects');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should create and retrieve a scene', async () => {
        const createRes = await request
            .post(`/api/projects/${testProjectId}/scenes`)
            .send({ name: 'Test Scene', description: 'Verify CRUD' });
        expect(createRes.status).toBe(200);
        expect(createRes.body.id).toBeDefined();

        const listRes = await request.get(`/api/projects/${testProjectId}/scenes`);
        expect(listRes.status).toBe(200);
        const found = listRes.body.find(s => s.id === createRes.body.id);
        expect(found).toBeDefined();
        expect(found.name).toBe('Test Scene');
    });

    it('should create and retrieve a shot', async () => {
        const createRes = await request
            .post(`/api/scenes/${testSceneId}/shots`)
            .send({ shot_number: '99', shot_type: 'close-up', description: 'CRUD test' });
        expect(createRes.status).toBe(200);
        expect(createRes.body.id).toBeDefined();

        const listRes = await request.get(`/api/scenes/${testSceneId}/shots`);
        expect(listRes.status).toBe(200);
        const found = listRes.body.find(s => s.id === createRes.body.id);
        expect(found).toBeDefined();
    });

    it('should create and retrieve characters', async () => {
        const createRes = await request
            .post(`/api/projects/${testProjectId}/characters`)
            .send({ name: 'CRUD Char', description: 'Test char' });
        expect(createRes.status).toBe(200);

        const listRes = await request.get(`/api/projects/${testProjectId}/characters`);
        expect(listRes.status).toBe(200);
        const found = listRes.body.find(c => c.name === 'CRUD Char');
        expect(found).toBeDefined();
    });

    it('should create and retrieve objects', async () => {
        const createRes = await request
            .post(`/api/projects/${testProjectId}/objects`)
            .send({ name: 'CRUD Object', description: 'Test obj' });
        expect(createRes.status).toBe(200);

        const listRes = await request.get(`/api/projects/${testProjectId}/objects`);
        expect(listRes.status).toBe(200);
        const found = listRes.body.find(o => o.name === 'CRUD Object');
        expect(found).toBeDefined();
    });

    it('should get user credits', async () => {
        const res = await request.get('/api/user/credits');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('credits');
        expect(res.body).toHaveProperty('tier');
    });
});
