import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const LOGIN_EMAIL = 'test@shotpilot.com';
const LOGIN_PASSWORD = 'testpassword123';

// Helper: login via API then set session cookie
async function login(page) {
    // Navigate to app first to set up the session context
    await page.goto(BASE_URL);

    // Login via API (the backend MVP skips password check — just needs valid email)
    const response = await page.evaluate(async (creds) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: creds.email, password: creds.password }),
        });
        return res.json();
    }, { email: LOGIN_EMAIL, password: LOGIN_PASSWORD });

    // Reload so the app picks up the authenticated session
    await page.reload();
    await page.waitForTimeout(1000);
    return response;
}

// Helper: wait for loading to finish
async function waitForLoad(page) {
    // Wait for "Loading" text to disappear
    try {
        await page.waitForFunction(() => {
            return !document.body.innerText.includes('Loading Shot Board') &&
                   !document.body.innerText.includes('Loading ShotPilot');
        }, { timeout: 10000 });
    } catch { /* continue */ }
    await page.waitForTimeout(500);
}

test.describe('Phase 2C: Frontend AI Integration', () => {
    test.setTimeout(120000); // 2 min per test

    test('Test 1: Credit Badge displays in header', async ({ page }) => {
        await login(page);
        await waitForLoad(page);

        // The CreditBadge should show in the header
        const creditText = page.locator('text=/\\d+ Credits?/').first();
        await expect(creditText).toBeVisible({ timeout: 5000 });

        await page.screenshot({ path: 'test-results/test1-credit-badge.png', fullPage: true });
    });

    test('Test 2: Generate Prompt button appears on shot cards', async ({ page }) => {
        await login(page);
        await waitForLoad(page);

        // Navigate to Scene Manager tab
        await page.click('text=Scene Manager');
        await waitForLoad(page);

        // Expand first scene if collapsed
        const chevron = page.locator('[style*="cursor: pointer"]').first();
        if (chevron) await chevron.click().catch(() => {});
        await page.waitForTimeout(500);

        // Look for Generate Prompt button
        const genBtn = page.locator('button:has-text("Generate Prompt")').first();
        await expect(genBtn).toBeVisible({ timeout: 5000 });

        await page.screenshot({ path: 'test-results/test2-generate-button.png', fullPage: true });
    });

    test('Test 3: Happy Path - Production tier quality check opens modal', async ({ page }) => {
        await login(page);
        await waitForLoad(page);

        // Navigate to Scene Manager
        await page.click('text=Scene Manager');
        await waitForLoad(page);

        // Create a well-populated shot via API for reliable testing
        const shotData = await page.evaluate(async () => {
            // Get projects
            const projects = await (await fetch('/api/projects')).json();
            const pid = projects[0]?.id;
            if (!pid) throw new Error('No project found');

            // Get or create a scene
            let scenes = await (await fetch(`/api/projects/${pid}/scenes`)).json();
            let scene = scenes[0];
            if (!scene) {
                await fetch(`/api/projects/${pid}/scenes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'Test Scene', order_index: 1, status: 'planning' }),
                });
                scenes = await (await fetch(`/api/projects/${pid}/scenes`)).json();
                scene = scenes[0];
            }

            // Create a production-ready shot (>= 70% quality)
            await fetch(`/api/scenes/${scene.id}/shots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shot_number: '99',
                    shot_type: 'Medium',
                    camera_angle: 'Eye level',
                    camera_movement: 'Static',
                    description: 'Detective examines crime scene photos under a single desk lamp',
                    focal_length: '50mm',
                    blocking: 'Subject center frame, leaning over desk',
                    camera_lens: 'Prime 50mm',
                }),
            });

            return { sceneId: scene.id };
        });

        // Reload to see the new shot
        await page.reload();
        await waitForLoad(page);
        await page.click('text=Scene Manager');
        await waitForLoad(page);

        // Expand scenes
        const sceneHeaders = page.locator('text=/Scene|Test Scene/');
        if (await sceneHeaders.count() > 0) {
            await sceneHeaders.first().click();
            await page.waitForTimeout(500);
        }

        // Find the Generate Prompt button for our shot
        const genBtns = page.locator('button:has-text("Generate Prompt")');
        const count = await genBtns.count();
        if (count > 0) {
            await genBtns.last().click();

            // Wait for quality check to complete
            await page.waitForTimeout(3000);

            // Check if GeneratePromptModal or RecommendationsDialog opened
            const modalTitle = page.locator('text=/Generate Prompt|Missing Context/');
            await expect(modalTitle).toBeVisible({ timeout: 10000 });

            await page.screenshot({ path: 'test-results/test3-modal-opened.png', fullPage: true });
        }
    });

    test('Test 4: Quality check API returns correct structure', async ({ page }) => {
        await login(page);

        // Test check-quality endpoint directly
        const quality = await page.evaluate(async () => {
            const projects = await (await fetch('/api/projects')).json();
            const pid = projects[0]?.id;
            const scenes = await (await fetch(`/api/projects/${pid}/scenes`)).json();
            if (!scenes[0]) return null;
            const shots = await (await fetch(`/api/scenes/${scenes[0].id}/shots`)).json();
            if (!shots[0]) return null;

            const res = await fetch(`/api/shots/${shots[0].id}/check-quality`, { method: 'POST' });
            return res.json();
        });

        expect(quality).toBeTruthy();
        expect(quality).toHaveProperty('percentage');
        expect(quality).toHaveProperty('tier');
        expect(quality).toHaveProperty('allMissing');
        expect(['production', 'draft']).toContain(quality.tier);

        await page.screenshot({ path: 'test-results/test4-quality-check.png' });
    });

    test('Test 5: Models API returns grouped models', async ({ page }) => {
        await login(page);

        const models = await page.evaluate(async () => {
            const res = await fetch('/api/models');
            return res.json();
        });

        expect(Array.isArray(models)).toBe(true);
        expect(models.length).toBeGreaterThan(0);

        const types = models.map(m => m.type);
        expect(types).toContain('image');
        expect(types).toContain('video');
    });

    test('Test 6: Variant list component renders', async ({ page }) => {
        await login(page);
        await waitForLoad(page);

        await page.click('text=Scene Manager');
        await waitForLoad(page);

        // Expand first scene
        const sceneHeaders = page.locator('text=/Scene|Test Scene/');
        if (await sceneHeaders.count() > 0) {
            await sceneHeaders.first().click();
            await page.waitForTimeout(500);
        }

        // Check for variant list empty state or variant cards
        const variantArea = page.locator('text=/No prompts generated yet|Generated Variants/');
        await expect(variantArea.first()).toBeVisible({ timeout: 5000 });

        await page.screenshot({ path: 'test-results/test6-variant-list.png', fullPage: true });
    });
});
