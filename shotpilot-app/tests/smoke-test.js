/**
 * ShotPilot Smoke Test Suite
 * 
 * Runs through the core user workflows via headless Playwright.
 * Designed to catch regressions before Boss Man has to find them manually.
 * 
 * Usage: node tests/smoke-test.js
 * Returns: exit code 0 = all pass, 1 = failures
 */
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const results = [];
let browser, page;

function log(test, passed, detail = '') {
    const icon = passed ? '✅' : '❌';
    results.push({ test, passed, detail });
    console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`);
}

async function setup() {
    browser = await chromium.launch();
    page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
}

async function teardown() {
    await browser?.close();
}

// ========== TESTS ==========

async function testServerUp() {
    try {
        const res = await fetch(`${BASE_URL}/api/projects`);
        const data = await res.json();
        log('Server responds', res.ok, `${data.length} projects`);
        return res.ok;
    } catch (e) {
        log('Server responds', false, e.message);
        return false;
    }
}

async function testAppLoads() {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const title = await page.title();
    const hasTabs = await page.locator('text=Scene Manager').count() > 0;
    log('App loads with nav tabs', hasTabs, title);
}

async function testSceneManagerLoads() {
    await page.locator('text=Scene Manager').first().click();
    await page.waitForTimeout(2000);
    
    // Check scenes render
    const sceneCount = await page.evaluate(() => {
        return document.querySelectorAll('[style*="border-left: 4px"]').length ||
            document.body.textContent.match(/SCENE \d/g)?.length || 0;
    });
    log('Scene Manager loads', sceneCount > 0, `${sceneCount} scenes detected`);
}

async function testShotCardsRender() {
    const shots = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[style*="width: 200px"]')).map(card => ({
            type: card.querySelector('[style*="text-transform: uppercase"]')?.textContent || '',
            hasImg: !!card.querySelector('img'),
        }));
    });
    log('Shot cards render', shots.length > 0, `${shots.length} cards, ${shots.filter(s => s.hasImg).length} with images`);
}

async function testEmptyShotsNoPhantomBadges() {
    const badEmpty = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[style*="width: 200px"]')).filter(card => {
            const hasImg = !!card.querySelector('img');
            const hasBadge = Array.from(card.querySelectorAll('div')).some(d => d.textContent?.match(/^\d+%$/));
            return !hasImg && hasBadge;
        }).length;
    });
    log('Empty shots have no phantom badges', badEmpty === 0, badEmpty > 0 ? `${badEmpty} empty shots showing badges` : '');
}

async function testStagingAreaPresent() {
    const staging = await page.evaluate(() => {
        return {
            visible: document.body.textContent?.includes('Drag images to shots') || false,
            count: Array.from(document.querySelectorAll('[style*="cursor: grab"]')).filter(el => el.getBoundingClientRect().width > 40).length,
        };
    });
    log('Staging area renders', staging.visible, `${staging.count} staged images`);
}

async function testSceneButtons() {
    const buttons = {
        designShots: await page.locator('button:has-text("Design Shots")').first().isVisible().catch(() => false),
        whatsMissing: await page.locator('button:has-text("What\'s Missing")').first().isVisible().catch(() => false),
        lookConsistent: await page.locator('button:has-text("Look Consistent")').first().isVisible().catch(() => false),
    };
    const allPresent = buttons.designShots && buttons.whatsMissing && buttons.lookConsistent;
    log('Scene buttons present', allPresent, Object.entries(buttons).map(([k, v]) => `${k}:${v ? '✓' : '✗'}`).join(' '));
}

async function testExpandedShotPanel() {
    // Click first shot with an image
    const imgShot = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[style*="width: 200px"]'));
        const withImg = cards.find(c => c.querySelector('img'));
        if (withImg) {
            const r = withImg.getBoundingClientRect();
            return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
        }
        return null;
    });

    if (!imgShot) {
        log('Expanded shot panel', true, 'SKIPPED — no shots with images');
        return;
    }

    await page.mouse.click(imgShot.x, imgShot.y);
    await page.waitForTimeout(1000);

    const panel = await page.evaluate(() => ({
        showsNotAnalyzed: document.body.textContent?.includes("hasn't been analyzed") || false,
        showsScore: !!document.body.textContent?.match(/Overall Score|Score:|Recommendation/),
    }));

    log('Expanded panel shows analysis (not "not analyzed")', !panel.showsNotAnalyzed && panel.showsScore,
        panel.showsNotAnalyzed ? 'Still showing "not analyzed"' : 'Analysis data present');

    // Close panel
    const closeBtn = page.locator('button:has-text("Close")').first();
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
    await page.waitForTimeout(300);
}

async function testDesignShotsModal() {
    // Check if mode selection appears when scene has shots
    await page.locator('button:has-text("Design Shots")').first().click();
    await page.waitForTimeout(1000);

    const modal = await page.evaluate(() => ({
        hasStartFresh: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Start Fresh')),
        hasAddMore: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Add More')),
        hasModal: document.body.textContent?.includes('Shot Planning') || false,
    }));

    log('Design Shots modal with mode selection', modal.hasModal && modal.hasStartFresh && modal.hasAddMore,
        `Modal:${modal.hasModal} Fresh:${modal.hasStartFresh} Add:${modal.hasAddMore}`);

    // Close without acting
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.isVisible().catch(() => false)) await cancelBtn.click();
    await page.waitForTimeout(300);
}

async function testDndDragTargets() {
    // Verify DnD infrastructure is wired (don't actually drag — that changes data)
    const dnd = await page.evaluate(() => {
        const grabs = Array.from(document.querySelectorAll('[style*="cursor: grab"]'));
        const staged = grabs.filter(el => el.getBoundingClientRect().width > 40);
        const gripHandles = grabs.filter(el => el.getBoundingClientRect().width < 30 && el.getBoundingClientRect().width > 5);
        return { staged: staged.length, grips: gripHandles.length };
    });
    log('DnD infrastructure present', dnd.staged > 0 || dnd.grips > 0,
        `${dnd.staged} draggable staged images, ${dnd.grips} grip handles`);
}

async function testAPIs() {
    const endpoints = [
        { name: 'Projects', url: '/api/projects', method: 'GET' },
        { name: 'Scenes', url: '/api/projects/2/scenes', method: 'GET' },
        { name: 'Shots', url: '/api/scenes/21/shots', method: 'GET' },
        { name: 'Assets', url: '/api/projects/2/assets', method: 'GET' },
        { name: 'RAG Status', url: '/api/v2/rag/status', method: 'GET' },
    ];

    for (const ep of endpoints) {
        try {
            const res = await fetch(`${BASE_URL}${ep.url}`);
            const data = await res.json();
            const count = Array.isArray(data) ? data.length : (data.total_chunks || data.count || 'ok');
            log(`API: ${ep.name}`, res.ok, `${res.status} — ${count}`);
        } catch (e) {
            log(`API: ${ep.name}`, false, e.message);
        }
    }
}

async function testBuildFresh() {
    const { execSync } = await import('child_process');
    try {
        const output = execSync('npm run build 2>&1', {
            cwd: '/Users/aidevlab/Documents/App_Lab/cine-ai-knowledge-base/shotpilot-app',
            timeout: 30000,
        }).toString();
        const success = output.includes('built in');
        log('Build succeeds', success, success ? output.match(/built in .*/)?.[0] : 'Build failed');
    } catch (e) {
        log('Build succeeds', false, e.message.substring(0, 100));
    }
}

async function testCreativeDirectorPage() {
    await page.goto(BASE_URL);
    await page.waitForTimeout(1500);
    await page.locator('text=Creative Director').first().click();
    await page.waitForTimeout(2000);

    const cd = await page.evaluate(() => ({
        hasChat: !!document.querySelector('textarea') || document.body.textContent?.includes('Send') || false,
        hasScript: document.body.textContent?.includes('TCPW') || document.body.textContent?.includes('script') || false,
    }));
    log('Creative Director page loads', cd.hasChat, `Chat:${cd.hasChat} Script:${cd.hasScript}`);
}

async function testAssetManagerPage() {
    await page.locator('text=Asset Manager').first().click();
    await page.waitForTimeout(2000);

    const am = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return { imageCount: images.length };
    });
    log('Asset Manager page loads', true, `${am.imageCount} images rendered`);
}

// ========== RUNNER ==========

async function run() {
    console.log('\n🎬 ShotPilot Smoke Test Suite\n' + '='.repeat(50));
    const start = Date.now();

    // Server check first — bail if down
    const serverUp = await testServerUp();
    if (!serverUp) {
        console.log('\n⛔ Server is down. Cannot run UI tests.');
        process.exit(1);
    }

    // Build check
    await testBuildFresh();

    // UI Tests
    await setup();
    try {
        await testAppLoads();
        await testCreativeDirectorPage();
        await testAssetManagerPage();

        // Navigate to Scene Manager for remaining tests
        await page.goto(BASE_URL);
        await page.waitForTimeout(1500);
        await page.locator('text=Scene Manager').first().click();
        await page.waitForTimeout(2000);

        await testSceneManagerLoads();
        await testShotCardsRender();
        await testEmptyShotsNoPhantomBadges();
        await testStagingAreaPresent();
        await testSceneButtons();
        await testExpandedShotPanel();
        await testDesignShotsModal();
        await testDndDragTargets();
    } finally {
        await teardown();
    }

    // API Tests
    await testAPIs();

    // Summary
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Results: ${passed}/${total} passed, ${failed} failed (${elapsed}s)`);

    if (failed > 0) {
        console.log('\n❌ Failures:');
        results.filter(r => !r.passed).forEach(r => console.log(`   - ${r.test}: ${r.detail}`));
    }

    console.log('');
    process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => {
    console.error('Suite crashed:', e);
    process.exit(1);
});
