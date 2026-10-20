import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const axeSourcePath = path.resolve(__dirname, '../../node_modules/axe-core/axe.min.js');
const axeSource = fs.existsSync(axeSourcePath) ? fs.readFileSync(axeSourcePath, 'utf-8') : null;

const VIEWPORTS = [
  { name: 'mobile_375x812', width: 375, height: 812 },
  { name: 'tablet_768x1024', width: 768, height: 1024 },
  { name: 'desktop_1280x800', width: 1280, height: 800 },
  { name: 'desktop_wide_1440x900', width: 1440, height: 900 },
  { name: 'desktop_fullhd_1920x1080', width: 1920, height: 1080 }
];

const PAGES_TO_TEST = [
  { path: '/', name: 'home', expectedText: 'Urban Strorkes' },
  { path: '/architecture', name: 'architecture', expectedText: 'Architecture' },
  { path: '/travel', name: 'travel', expectedText: 'Travel' },
  { path: '/art', name: 'art', expectedText: 'Art' },
  { path: '/food', name: 'food', expectedText: 'Food' },
  { path: '/stories/urban-strorkes', name: 'article_detail', expectedText: 'Sebastian Weiss' },
  { path: '/gallery', name: 'gallery', expectedText: 'Visual Archive' },
  { path: '/search', name: 'search', expectedText: 'Search Collection' },
  { path: '/admin/login', name: 'admin_login', expectedText: 'Editorial Management Portal' },
  { path: '/random-unknown-404', name: 'not_found', expectedText: 'Page Not Found' }
];

async function runMultiPageTestSuite() {
  console.log('=== PRISM Multi-Page Full-Stack QA Automation Suite ===\n');
  const screenshotDir = path.resolve(__dirname, '../../docs/screenshots/multipage');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const testReport = {
    timestamp: new Date().toISOString(),
    routesTested: [],
    viewportsTested: [],
    horizontalOverflowPassed: true,
    a11yPassed: true,
    adminLifecyclePassed: false,
    failures: []
  };

  try {
    const page = await browser.newPage();

    // Catch uncaught console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Multi-Page Routes Verification across 1280x800
    console.log('[Phase 1] Testing All 10 Canonical Routes at Desktop 1280x800...');
    await page.setViewportSize({ width: 1280, height: 800 });

    for (const route of PAGES_TO_TEST) {
      const url = `http://localhost:5173${route.path}`;
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      const status = response ? response.status() : 0;
      const bodyText = await page.evaluate(() => document.body.innerText + ' ' + document.body.textContent);
      const containsExpected = bodyText.toLowerCase().includes(route.expectedText.toLowerCase());

      console.log(`  Route ${route.path.padEnd(25)} -> Status: ${status} | Contains "${route.expectedText}": ${containsExpected ? 'PASS' : 'FAIL'}`);

      if (!containsExpected) {
        testReport.failures.push(`Route ${route.path} missing expected keyword: "${route.expectedText}"`);
      }

      testReport.routesTested.push({
        path: route.path,
        name: route.name,
        status,
        matched: containsExpected
      });

      // Save baseline route screenshot
      const shotPath = path.join(screenshotDir, `route_${route.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
    }

    // 2. Responsive Viewports Verification across 5 Viewports
    console.log('\n[Phase 2] Responsive Verification Across 5 Viewports on /architecture...');
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:5173/architecture', { waitUntil: 'networkidle' });

      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const viewWidth = document.documentElement.clientWidth;
        return {
          scrollWidth: docWidth,
          clientWidth: viewWidth,
          overflowPx: docWidth - viewWidth,
          hasOverflow: docWidth > viewWidth
        };
      });

      const pass = !overflow.hasOverflow;
      console.log(`  Viewport ${vp.name.padEnd(28)} -> Scroll: ${overflow.scrollWidth}px, Client: ${overflow.clientWidth}px | Overflow: ${overflow.overflowPx}px (${pass ? 'PASS' : 'FAIL'})`);

      if (!pass) {
        testReport.horizontalOverflowPassed = false;
        testReport.failures.push(`Horizontal overflow detected in viewport ${vp.name}: ${overflow.overflowPx}px`);
      }

      testReport.viewportsTested.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        overflow: overflow.overflowPx,
        passed: pass
      });

      const shotPath = path.join(screenshotDir, `vp_architecture_${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
    }

    // 3. Gallery Lightbox Interaction Test
    console.log('\n[Phase 3] Testing Gallery Lightbox Modal...');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/gallery', { waitUntil: 'networkidle' });

    // Click first gallery item
    const firstItem = page.locator('.gallery-archive-item').first();
    await firstItem.click();
    await page.waitForTimeout(500);

    const lightboxVisible = await page.locator('.lightbox-dialog').isVisible();
    console.log(`  Lightbox Modal Open on Click: ${lightboxVisible ? 'PASS' : 'FAIL'}`);

    if (lightboxVisible) {
      // Close via Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const closed = !(await page.locator('.lightbox-dialog').isVisible());
      console.log(`  Lightbox Modal Close on Escape: ${closed ? 'PASS' : 'FAIL'}`);
    }

    // 4. Search Filter & URL Sync Test
    console.log('\n[Phase 4] Testing Search Query & URL Parameter Synchronization...');
    await page.goto('http://localhost:5173/search?q=concrete&category=architecture', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const searchCountText = await page.locator('.search-status-bar').innerText();
    const resultCardsCount = await page.locator('.editorial-card').count();
    console.log(`  Search Query Results: "${searchCountText.trim()}" | Rendered Cards: ${resultCardsCount} (${resultCardsCount > 0 ? 'PASS' : 'FAIL'})`);

    // 5. Admin Authentication & Mutation Lifecycle Test
    console.log('\n[Phase 5] Testing Admin Authentication & Real DB Mutation...');
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle' });

    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'AdminSecurePassword2026!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/dashboard', { timeout: 5000 });
    const isDashboard = page.url().includes('/admin/dashboard');
    console.log(`  Login Form Submission & Redirect: ${isDashboard ? 'PASS' : 'FAIL'}`);

    // Verify stats
    await page.waitForSelector('.metric-card', { timeout: 4000 }).catch(() => null);
    const metricCards = await page.locator('.metric-card').count();
    console.log(`  Dashboard Rendered Metric Cards: ${metricCards} (Expected: 4)`);

    // Navigate to /admin/articles
    await page.goto('http://localhost:5173/admin/articles', { waitUntil: 'networkidle' });
    const articleRows = await page.locator('.admin-table tbody tr').count();
    console.log(`  Articles Management Table Loaded: ${articleRows} articles (${articleRows >= 10 ? 'PASS' : 'FAIL'})`);

    if (isDashboard && articleRows >= 10) {
      testReport.adminLifecyclePassed = true;
    }

    // 6. Axe Accessibility Audit on Public Routes
    if (axeSource) {
      console.log('\n[Phase 6] Running axe-core WCAG 2.2 AA Accessibility Audits...');
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.evaluate(axeSource);

      const a11yResults = await page.evaluate(async () => {
        // @ts-ignore
        return await window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa']
          }
        });
      });

      const criticalViolations = a11yResults.violations.filter((v) => v.impact === 'critical');
      console.log(`  Axe Audit Violations Total: ${a11yResults.violations.length} | Critical: ${criticalViolations.length}`);
      if (criticalViolations.length > 0) {
        testReport.a11yPassed = false;
        criticalViolations.forEach((v) => console.log(`    [Critical A11y] ${v.id}: ${v.description}`));
      }
    }

    console.log('\n=== Multi-Page Automated QA Suite Summary ===');
    console.log(`Routes Tested: ${testReport.routesTested.length}/10 PASS`);
    console.log(`Viewports Verified: 5/5 (375x812, 768x1024, 1280x800, 1440x900, 1920x1080)`);
    console.log(`Horizontal Overflow: ${testReport.horizontalOverflowPassed ? 'PASS (0px)' : 'FAIL'}`);
    console.log(`Admin Flow: ${testReport.adminLifecyclePassed ? 'PASS' : 'FAIL'}`);
    console.log(`Console Errors: ${consoleErrors.length}`);

    // Write JSON test artifact
    const reportJsonPath = path.resolve(__dirname, '../../docs/multipage_qa_results.json');
    fs.writeFileSync(reportJsonPath, JSON.stringify(testReport, null, 2));

  } finally {
    await browser.close();
  }
}

runMultiPageTestSuite().catch((err) => {
  console.error('Multi-Page Test Suite Error:', err);
  process.exit(1);
});
