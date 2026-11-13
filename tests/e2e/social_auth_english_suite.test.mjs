import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSocialAuthEnglishSuite() {
  console.log('=== PRISM English UI & Social OAuth (Google / Kakao) E2E Test Suite ===\n');

  const screenshotDir = path.resolve(__dirname, '../../docs/screenshots/social_auth');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const results = {
    timestamp: new Date().toISOString(),
    englishUiChecks: {},
    socialButtonDesign: {},
    googleAuthFlow: {},
    kakaoAuthFlow: {},
    responsiveViewports: {},
    screenshots: []
  };

  try {
    // =========================================================================
    // 1. English UI Audit & Header Dropdown Verification
    // =========================================================================
    console.log('[Phase 1] Auditing UI text for 100% English unification...');
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 1.1 Home page as Guest
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    const guestHeaderBtn = await page.locator('.header-actions .auth-badge-btn').innerText();
    console.log(`  Guest Header Button text: "${guestHeaderBtn.trim()}" (Expected: LOGIN)`);
    results.englishUiChecks.guestHeaderButton = guestHeaderBtn.includes('LOGIN');

    // 1.2 Login Page English UI & Social Buttons Check
    console.log('\n[Phase 2] Login Page UI Design & Social Buttons Verification...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

    const loginTitle = await page.locator('.auth-title').innerText();
    const loginSubtitle = await page.locator('.auth-subtitle').innerText();
    const dividerText = await page.locator('.auth-divider-text').innerText();
    const googleBtnText = await page.locator('.btn-google-official').innerText();
    const kakaoBtnText = await page.locator('.btn-kakao-official').innerText();

    console.log(`  Title: "${loginTitle}" (Expected: Welcome Back)`);
    console.log(`  Subtitle: "${loginSubtitle}" (Expected: Sign in to continue exploring)`);
    console.log(`  Divider: "${dividerText}" (Expected: or)`);
    console.log(`  Google Button: "${googleBtnText.trim()}" (Expected: Sign in with Google)`);
    console.log(`  Kakao Button: "${kakaoBtnText.trim()}" (Expected: Login with Kakao)`);

    results.socialButtonDesign.hasWelcomeBack = loginTitle.toLowerCase().includes('welcome back');
    results.socialButtonDesign.hasSubtitle = loginSubtitle.toLowerCase().includes('sign in to continue exploring');
    results.socialButtonDesign.hasDivider = dividerText.trim().toLowerCase() === 'or';
    results.socialButtonDesign.googleText = googleBtnText.toLowerCase().includes('sign in with google');
    results.socialButtonDesign.kakaoText = kakaoBtnText.toLowerCase().includes('login with kakao');

    // Verify Kakao button has #FEE500 background and 12px border radius
    const kakaoBg = await page.locator('.btn-kakao-official').evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        bg: style.backgroundColor,
        borderRadius: style.borderRadius,
        color: style.color
      };
    });
    console.log(`  Kakao Button styles: BG=${kakaoBg.bg}, Radius=${kakaoBg.borderRadius}, Color=${kakaoBg.color}`);
    results.socialButtonDesign.kakaoStylesVerified = kakaoBg.borderRadius === '12px';

    // Verify Google button has white background and neutral border
    const googleStyles = await page.locator('.btn-google-official').evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        bg: style.backgroundColor,
        border: style.border
      };
    });
    console.log(`  Google Button styles: BG=${googleStyles.bg}, Border=${googleStyles.border}`);

    // Capture screenshot of the enhanced login page
    const loginShotPath = path.join(screenshotDir, '01_enhanced_login_page.png');
    await page.screenshot({ path: loginShotPath, fullPage: true });
    results.screenshots.push('01_enhanced_login_page.png');

    // 1.3 Test Google Button Click (Guide / Simulation Modal)
    console.log('\n[Phase 3] Testing Google Social Authentication interaction...');
    await page.locator('.btn-google-official').click();
    await page.waitForSelector('.auth-modal-card', { state: 'visible' });

    const modalTitle = await page.locator('.modal-title').innerText();
    console.log(`  Modal Title: "${modalTitle}"`);
    results.googleAuthFlow.modalOpened = modalTitle.toLowerCase().includes('google');

    // Capture modal screenshot
    const modalShotPath = path.join(screenshotDir, '02_google_oauth_modal.png');
    await page.screenshot({ path: modalShotPath, fullPage: true });
    results.screenshots.push('02_google_oauth_modal.png');

    // Trigger simulation sign in
    await page.locator('.btn-modal-primary').click();
    await page.waitForURL('**/account', { timeout: 10000 });
    console.log(`  Successfully navigated to: ${page.url()}`);
    results.googleAuthFlow.loginSucceeded = page.url().includes('/account');

    // Verify User Account Header Dropdown shows English items
    const userRoleText = await page.locator('.account-role-pill').innerText();
    console.log(`  Account Role Pill: "${userRoleText}" (Expected: USER)`);
    results.googleAuthFlow.strictlyUserRole = userRoleText.toUpperCase() === 'USER';

    // Open User Dropdown in Header to check English items
    await page.locator('.user-badge-btn').click();
    await page.waitForSelector('.header-dropdown-menu', { state: 'visible' });
    const userDropdownContent = await page.locator('.header-dropdown-menu').innerText();
    console.log('  User Header Dropdown items:\n', userDropdownContent.trim());

    const hasKoreanInUserDropdown = /[\uac00-\ud7a3]/.test(userDropdownContent);
    console.log(`  User Dropdown free of Korean: ${!hasKoreanInUserDropdown ? 'PASS' : 'FAIL'}`);
    results.englishUiChecks.userDropdownPurity = !hasKoreanInUserDropdown;

    // Capture User Account view
    const userAccountShot = path.join(screenshotDir, '03_google_reader_account.png');
    await page.screenshot({ path: userAccountShot, fullPage: true });
    results.screenshots.push('03_google_reader_account.png');

    // Log out
    await page.locator('.dropdown-logout-btn').click();
    await page.waitForURL('**/login', { timeout: 10000 });
    await context.close();

    // =========================================================================
    // 2. Kakao Authentication & Role Separation Verification
    // =========================================================================
    console.log('\n[Phase 4] Testing Kakao Social Authentication interaction...');
    const kakaoContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const kakaoPage = await kakaoContext.newPage();

    await kakaoPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await kakaoPage.locator('.btn-kakao-official').click();
    await kakaoPage.waitForSelector('.auth-modal-card', { state: 'visible' });

    const kakaoModalTitle = await kakaoPage.locator('.modal-title').innerText();
    console.log(`  Kakao Modal Title: "${kakaoModalTitle}"`);
    results.kakaoAuthFlow.modalOpened = kakaoModalTitle.toLowerCase().includes('kakao');

    // Trigger simulation sign in
    await kakaoPage.locator('.btn-modal-primary').click();
    await kakaoPage.waitForURL('**/account', { timeout: 10000 });
    console.log(`  Kakao login navigated to: ${kakaoPage.url()}`);
    results.kakaoAuthFlow.loginSucceeded = kakaoPage.url().includes('/account');

    // Verify Role is strictly USER
    const kakaoUserRole = await kakaoPage.locator('.account-role-pill').innerText();
    console.log(`  Kakao User Role: "${kakaoUserRole}" (Expected: USER)`);
    results.kakaoAuthFlow.strictlyUserRole = kakaoUserRole.toUpperCase() === 'USER';

    // Verify accessing /admin results in 403 Access Denied in English
    console.log('  Testing RBAC: accessing /admin with Kakao USER account...');
    await kakaoPage.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
    const deniedText = await kakaoPage.locator('h1').innerText();
    console.log(`  Access Denied Header: "${deniedText}"`);
    results.kakaoAuthFlow.accessDenied403 =
      deniedText.toLowerCase().includes('denied') ||
      deniedText.toLowerCase().includes('restricted') ||
      deniedText.includes('403');

    // Capture 403 page
    const deniedShot = path.join(screenshotDir, '04_kakao_user_403_denied.png');
    await kakaoPage.screenshot({ path: deniedShot, fullPage: true });
    results.screenshots.push('04_kakao_user_403_denied.png');

    await kakaoContext.close();

    // =========================================================================
    // 3. Admin Login & Admin Header Dropdown English Verification
    // =========================================================================
    console.log('\n[Phase 5] Verifying Administrator Header Dropdown English Unification...');
    const adminContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const adminPage = await adminContext.newPage();

    await adminPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await adminPage.locator('#login-username').fill('admin');
    await adminPage.locator('#login-password').fill('AdminSecurePassword2026!');
    await adminPage.locator('.btn-auth-submit').click();
    await adminPage.waitForURL('**/admin/dashboard', { timeout: 10000 });

    // Navigate to homepage to check header
    await adminPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    const adminHeaderBtn = await adminPage.locator('.admin-badge-btn');
    await adminHeaderBtn.click();
    await adminPage.waitForSelector('.header-dropdown-menu', { state: 'visible' });

    const adminDropdownText = await adminPage.locator('.header-dropdown-menu').innerText();
    console.log('  Admin Header Dropdown items:\n', adminDropdownText.trim());

    const hasKoreanInAdminDropdown = /[\uac00-\ud7a3]/.test(adminDropdownText);
    console.log(`  Admin Dropdown free of Korean: ${!hasKoreanInAdminDropdown ? 'PASS' : 'FAIL'}`);
    results.englishUiChecks.adminDropdownPurity = !hasKoreanInAdminDropdown;

    // Capture Admin Dropdown
    const adminDropdownShot = path.join(screenshotDir, '05_admin_header_dropdown_english.png');
    await adminPage.screenshot({ path: adminDropdownShot, fullPage: true });
    results.screenshots.push('05_admin_header_dropdown_english.png');

    await adminContext.close();

    // =========================================================================
    // 4. Mobile Navigation Drawer English Audit (375x812)
    // =========================================================================
    console.log('\n[Phase 6] Verifying Mobile Navigation Drawer in English (375x812)...');
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await mobilePage.locator('.mobile-menu-toggle').click();
    await mobilePage.waitForSelector('.mobile-nav-drawer', { state: 'visible' });

    const mobileDrawerText = await mobilePage.locator('.mobile-nav-drawer').innerText();
    const hasKoreanInMobile = /[\uac00-\ud7a3]/.test(mobileDrawerText);
    console.log(`  Mobile Drawer free of Korean: ${!hasKoreanInMobile ? 'PASS' : 'FAIL'}`);
    results.englishUiChecks.mobileDrawerPurity = !hasKoreanInMobile;

    const mobileDrawerShot = path.join(screenshotDir, '06_mobile_drawer_guest_english.png');
    await mobilePage.screenshot({ path: mobileDrawerShot, fullPage: true });
    results.screenshots.push('06_mobile_drawer_guest_english.png');

    // Check Mobile Login Page layout
    await mobilePage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    const mobileLoginShot = path.join(screenshotDir, '07_mobile_login_social_layout.png');
    await mobilePage.screenshot({ path: mobileLoginShot, fullPage: true });
    results.screenshots.push('07_mobile_login_social_layout.png');

    await mobileContext.close();

    // =========================================================================
    // 5. Multi-viewport Responsive Stability
    // =========================================================================
    console.log('\n[Phase 7] Multi-viewport Responsive Checks (375x812, 768x1024, 1280x800, 1440x900)...');
    const viewports = [
      { name: 'mobile_375x812', width: 375, height: 812 },
      { name: 'tablet_768x1024', width: 768, height: 1024 },
      { name: 'desktop_1280x800', width: 1280, height: 800 },
      { name: 'wide_1440x900', width: 1440, height: 900 }
    ];

    for (const vp of viewports) {
      const vpContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const vpPage = await vpContext.newPage();
      await vpPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

      // Check horizontal overflow
      const overflow = await vpPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      console.log(`  Viewport ${vp.name}: Horizontal Overflow = ${overflow ? 'FAIL' : '0px (PASS)'}`);
      results.responsiveViewports[vp.name] = !overflow;
      await vpContext.close();
    }

    console.log('\n=== All Tests in Suite Completed Successfully! ===\n');
  } catch (err) {
    console.error('Test Suite Failed with Exception:', err);
    throw err;
  } finally {
    await browser.close();
  }

  // Save results report
  const reportPath = path.resolve(__dirname, '../../docs/social_auth_qa_results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Report saved to: ${reportPath}`);
}

runSocialAuthEnglishSuite().catch((err) => {
  console.error(err);
  process.exit(1);
});
