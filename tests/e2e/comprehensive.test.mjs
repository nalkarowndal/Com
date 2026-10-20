import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const axeSourcePath = path.resolve(__dirname, '../../node_modules/axe-core/axe.min.js');
const axeSource = fs.readFileSync(axeSourcePath, 'utf-8');

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'desktop_wide', width: 1440, height: 900 }
];

async function runComprehensiveSuite() {
  console.log('=== Starting Automated Playwright E2E & A11y Suite ===');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const results = {
    viewports: [],
    interactions: {},
    accessibility: null,
    consoleErrors: []
  };

  try {
    const page = await browser.newPage();

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        results.consoleErrors.push(msg.text());
        console.error('[Browser Console Error]', msg.text());
      }
    });

    // 1. Test each of the 4 viewports
    for (const vp of VIEWPORTS) {
      console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height})`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

      // Check horizontal overflow
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const viewWidth = document.documentElement.clientWidth;
        return {
          scrollWidth: docWidth,
          clientWidth: viewWidth,
          hasOverflow: docWidth > viewWidth
        };
      });

      console.log(`  Horizontal overflow: ${overflow.hasOverflow ? 'FAIL' : 'PASS (0px)'}`);

      // Verify content presence
      const contentChecks = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasHeroTitle: text.includes('Urban Strorkes') || text.includes('URBAN STRORKES'),
          hasBadge: text.includes("Editor's Choice") || text.includes("EDITOR'S CHOICE"),
          hasAuthor: text.includes('Sebastian Weiss'),
          hasCard1: text.includes('Inspring Reads') || text.includes('INSPRING READS'),
          hasCard2: text.includes('Reflections') || text.includes('REFLECTIONS'),
          hasCopyright: text.includes('2026 Green Systems Incorporated. All rights reserved.'),
          galleryImageCount: document.querySelectorAll('img[src*="gallery-"]').length
        };
      });

      console.log(`  Content verification:`, contentChecks);

      // Capture screenshot
      const shotPath = path.resolve(__dirname, `../../docs/screenshots/viewport_${vp.width}x${vp.height}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      console.log(`  Screenshot saved: ${shotPath}`);

      results.viewports.push({
        viewport: vp,
        overflow,
        contentChecks,
        screenshot: shotPath
      });
    }

    // 2. Test Mobile Menu Interaction (at 375x812)
    console.log('\nTesting Mobile Menu Interaction (375x812)...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    const toggleBtn = page.locator('.mobile-menu-toggle');
    await toggleBtn.click();
    await page.waitForTimeout(300);

    const isDrawerOpen = await page.evaluate(() => {
      const drawer = document.querySelector('.mobile-nav-drawer');
      return drawer && drawer.classList.contains('open');
    });
    console.log(`  Mobile drawer opened: ${isDrawerOpen ? 'PASS' : 'FAIL'}`);

    const closeBtn = page.locator('.drawer-close');
    await closeBtn.click();
    await page.waitForTimeout(300);

    const isDrawerClosed = await page.evaluate(() => {
      const drawer = document.querySelector('.mobile-nav-drawer');
      return drawer && !drawer.classList.contains('open');
    });
    console.log(`  Mobile drawer closed: ${isDrawerClosed ? 'PASS' : 'FAIL'}`);

    results.interactions.mobileNav = { isDrawerOpen, isDrawerClosed };

    // 3. Test Hero Read More Modal
    console.log('\nTesting Hero "Read More" Modal Interaction...');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    const heroReadMoreBtn = page.locator('.hero .button').first();
    await heroReadMoreBtn.click();
    await page.waitForTimeout(200);

    const isHeroModalOpen = await page.evaluate(() => {
      const modal = document.querySelector('.modal-dialog');
      return modal !== null;
    });
    console.log(`  Hero modal opened: ${isHeroModalOpen ? 'PASS' : 'FAIL'}`);

    // Press Escape to close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const isHeroModalClosed = await page.evaluate(() => {
      const modal = document.querySelector('.modal-dialog');
      return modal === null;
    });
    console.log(`  Hero modal closed on Escape: ${isHeroModalClosed ? 'PASS' : 'FAIL'}`);

    results.interactions.heroModal = { isHeroModalOpen, isHeroModalClosed };

    // 4. Test Lightbox Modal and Arrow Key Navigation
    console.log('\nTesting Gallery Lightbox Modal Interaction...');
    const firstGalleryItem = page.locator('.gallery-card').first();
    await firstGalleryItem.click();
    await page.waitForTimeout(200);

    const isLightboxOpen = await page.evaluate(() => {
      return document.querySelector('.lightbox-dialog') !== null;
    });
    console.log(`  Lightbox opened: ${isLightboxOpen ? 'PASS' : 'FAIL'}`);

    // Navigate to next image
    const nextBtn = page.locator('.lightbox-nav-btn.next');
    await nextBtn.click();
    await page.waitForTimeout(200);

    const activeImageSrc = await page.evaluate(() => {
      const img = document.querySelector('.lightbox-image-container img');
      return img ? img.getAttribute('src') : null;
    });
    console.log(`  Lightbox navigated to slide 2: ${activeImageSrc ? 'PASS (' + activeImageSrc + ')' : 'FAIL'}`);

    // Press Escape to close Lightbox
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const isLightboxClosed = await page.evaluate(() => {
      return document.querySelector('.lightbox-dialog') === null;
    });
    console.log(`  Lightbox closed on Escape: ${isLightboxClosed ? 'PASS' : 'FAIL'}`);

    results.interactions.lightbox = { isLightboxOpen, activeImageSrc, isLightboxClosed };

    // 5. Run axe-core Accessibility Audit
    console.log('\nRunning axe-core WCAG 2.2 AA Accessibility Audit...');
    await page.evaluate(axeSource);
    const axeResults = await page.evaluate(async () => {
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
        }
      });
    });

    const violations = axeResults.violations || [];
    const criticalViolations = violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    console.log(`  Total axe violations: ${violations.length} (Critical/Serious: ${criticalViolations.length})`);
    if (violations.length > 0) {
      violations.forEach((v) => {
        console.log(`    - [${v.impact}] ${v.help} (${v.id}) - nodes: ${v.nodes.length}`);
      });
    }

    results.accessibility = {
      passes: axeResults.passes.length,
      violationsCount: violations.length,
      criticalCount: criticalViolations.length,
      violations: violations.map(v => ({ id: v.id, impact: v.impact, description: v.description }))
    };

    console.log('\n=== Playwright Suite Complete! Writing Test Results... ===');
    const resultJsonPath = path.resolve(__dirname, '../../docs/e2e_results.json');
    fs.writeFileSync(resultJsonPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`Report saved to ${resultJsonPath}`);
  } finally {
    await browser.close();
  }
}

runComprehensiveSuite().catch(err => {
  console.error('Playwright Suite Error:', err);
  process.exit(1);
});
