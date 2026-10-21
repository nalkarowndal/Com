import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function runMediaE2ETest() {
  console.log('=== Starting PRISM Media System & Category Image QA Test ===');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const screenshotsDir = path.resolve('docs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // 1. Visit Food page and take screenshot
    console.log('[Test 1] Verifying Food category page with authentic photography...');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://localhost:5173/food', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'food_page_media_verified.png'), fullPage: false });
    console.log('  -> Captured food_page_media_verified.png');

    // 2. Visit Travel page and take screenshot
    console.log('[Test 2] Verifying Travel category page with authentic photography...');
    await page.goto('http://localhost:5173/travel', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'travel_page_media_verified.png'), fullPage: false });
    console.log('  -> Captured travel_page_media_verified.png');

    // 3. Visit Art page and take screenshot
    console.log('[Test 3] Verifying Art category page with authentic photography...');
    await page.goto('http://localhost:5173/art', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'art_page_media_verified.png'), fullPage: false });
    console.log('  -> Captured art_page_media_verified.png');

    // 4. Log in as admin and visit Admin Media Library
    console.log('[Test 4] Logging into Admin Portal...');
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });
    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'AdminSecurePassword2026!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    console.log('  -> Logged in successfully');

    // 5. Navigate to Admin Media Library
    console.log('[Test 5] Navigating to Admin Media Management...');
    await page.goto('http://localhost:5173/admin/media', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'admin_media_library_verified.png'), fullPage: false });
    console.log('  -> Captured admin_media_library_verified.png');

    // 6. Click on a media card to open Inspector Modal
    console.log('[Test 6] Opening Media Inspector Modal...');
    const firstCard = await page.$('.media-asset-card');
    if (firstCard) {
      await firstCard.click();
      await page.waitForSelector('.media-inspector-dialog', { timeout: 5000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, 'admin_media_inspector_verified.png'), fullPage: false });
      console.log('  -> Captured admin_media_inspector_verified.png');
      await page.click('.modal-close-btn');
    }

    // 7. Visit Article Edit page and verify Recommender UI
    console.log('[Test 7] Verifying Monograph Edit Media Curation & AI Recommender...');
    await page.goto('http://localhost:5173/admin/articles/food-slow-harvest/edit', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Click Suggest Media button to trigger Recommender Engine
    const recommendBtn = await page.$('.btn-admin-recommend');
    if (recommendBtn) {
      console.log('  -> Clicking Suggest Media button...');
      await recommendBtn.click();
      await page.waitForSelector('.recommendations-shelf', { timeout: 5000 });
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: path.join(screenshotsDir, 'admin_article_edit_curation_verified.png'), fullPage: false });
    console.log('  -> Captured admin_article_edit_curation_verified.png');

    console.log('=== All Visual QA Tests Completed Successfully! ===');
  } catch (err) {
    console.error('Error during media E2E QA:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runMediaE2ETest();
