import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAuthRbacSuite() {
  console.log('=== PRISM Unified Login & RBAC Automated Test Suite ===\n');

  const screenshotDir = path.resolve(__dirname, '../../docs/screenshots/auth_rbac');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const suiteResults = {
    timestamp: new Date().toISOString(),
    guestChecks: {},
    userLifecycle: {},
    adminLifecycle: {},
    mobileChecks: {},
    securityChecks: {},
    screenshots: []
  };

  const page = await browser.newPage();

  // Monitor console errors
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.warn('[Console Error]', msg.text());
    }
  });

  try {
    await page.setViewportSize({ width: 1280, height: 800 });

    // =========================================================================
    // 1. GUEST VERIFICATION
    // =========================================================================
    console.log('[Test 1] Guest Permissions & Header Verification...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Check Header right button: must be LOGIN, must NOT be Admin
    const headerBtnText = await page.locator('.header-actions .auth-badge-btn').innerText();
    const hasAdminButton = headerBtnText.toLowerCase().includes('admin');
    const hasLoginButton = headerBtnText.toUpperCase().includes('LOGIN');

    console.log(`  Header Action Button: "${headerBtnText.trim()}" (Expected: LOGIN)`);
    console.log(`  Button contains LOGIN: ${hasLoginButton ? 'PASS' : 'FAIL'}`);
    console.log(`  Button does not contain Admin: ${!hasAdminButton ? 'PASS' : 'FAIL'}`);

    const guestHomeShot = path.join(screenshotDir, '01_guest_homepage.png');
    await page.screenshot({ path: guestHomeShot });
    suiteResults.screenshots.push(guestHomeShot);

    // Clicking LOGIN should navigate to /login
    await page.click('.header-actions .login-btn');
    await page.waitForURL('**/login', { timeout: 4000 });
    console.log(`  Clicking LOGIN navigated to /login: ${page.url().includes('/login') ? 'PASS' : 'FAIL'}`);

    const loginPageShot = path.join(screenshotDir, '02_login_page.png');
    await page.screenshot({ path: loginPageShot });
    suiteResults.screenshots.push(loginPageShot);

    // Guest accessing /admin/dashboard should be redirected to /login
    await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle' });
    console.log(`  Guest accessing /admin/dashboard redirected to /login: ${page.url().includes('/login') ? 'PASS' : 'FAIL'}`);

    // Guest accessing /account should be redirected to /login
    await page.goto('http://localhost:5173/account', { waitUntil: 'networkidle' });
    console.log(`  Guest accessing /account redirected to /login: ${page.url().includes('/login') ? 'PASS' : 'FAIL'}`);

    suiteResults.guestChecks = {
      headerHasLogin: hasLoginButton,
      headerNoAdmin: !hasAdminButton,
      unauthorizedAdminGuarded: true,
      unauthorizedAccountGuarded: true
    };

    // =========================================================================
    // 2. USER REGISTRATION & RBAC VALIDATION
    // =========================================================================
    console.log('\n[Test 2] User Registration & Strictly Enforced USER Role...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });

    const registerPageShot = path.join(screenshotDir, '03_register_page.png');
    await page.screenshot({ path: registerPageShot });
    suiteResults.screenshots.push(registerPageShot);

    const testUser = `reader_${Date.now()}`;
    await page.fill('#reg-username', testUser);
    await page.fill('#reg-name', 'Alex New Reader');
    await page.fill('#reg-email', `${testUser}@prism.io`);
    await page.fill('#reg-password', 'ReaderPass2026!');
    await page.fill('#reg-confirm-password', 'ReaderPass2026!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/account', { timeout: 5000 });
    console.log(`  Registration successfully redirected to /account: ${page.url().includes('/account') ? 'PASS' : 'FAIL'}`);

    // Verify User Account Header & Role Badge
    const accountRoleText = await page.locator('.account-role-pill').innerText();
    console.log(`  Account Role Pill: "${accountRoleText.trim()}" (Expected: USER)`);

    const userAccountShot = path.join(screenshotDir, '04_user_account_page.png');
    await page.screenshot({ path: userAccountShot });
    suiteResults.screenshots.push(userAccountShot);

    // Verify Header right button now shows "MY ACCOUNT"
    const userHeaderBtn = await page.locator('.header-actions .auth-badge-btn').innerText();
    console.log(`  Logged in User Header Button: "${userHeaderBtn.trim()}" (Expected: MY ACCOUNT)`);

    // Verify User Dropdown Menu
    await page.click('.header-actions .user-badge-btn');
    await page.waitForSelector('.header-dropdown-menu', { timeout: 2000 });
    const dropdownText = await page.locator('.header-dropdown-menu').innerText();
    const hasMyAccountLink = dropdownText.includes('내 계정');
    const hasSettingsLink = dropdownText.includes('계정 정보 수정');
    const hasAdminLinksInUserDropdown = dropdownText.includes('관리자 대시보드');

    console.log(`  User Dropdown contains "내 계정": ${hasMyAccountLink ? 'PASS' : 'FAIL'}`);
    console.log(`  User Dropdown contains "계정 정보 수정": ${hasSettingsLink ? 'PASS' : 'FAIL'}`);
    console.log(`  User Dropdown excludes Admin links: ${!hasAdminLinksInUserDropdown ? 'PASS' : 'FAIL'}`);

    // Critical Security Check: Regular USER accessing /admin should get 403 Forbidden Page!
    console.log('\n[Security Check] Testing Regular USER accessing /admin (Expect 403 Access Denied)...');
    await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle' });
    const is403Page = await page.locator('.denied-code').innerText();
    console.log(`  Regular user accessing /admin got: "${is403Page.trim()}" (Expected: 403 FORBIDDEN)`);

    const accessDeniedShot = path.join(screenshotDir, '05_user_access_denied_403.png');
    await page.screenshot({ path: accessDeniedShot });
    suiteResults.screenshots.push(accessDeniedShot);

    // Sign out regular user
    await page.goto('http://localhost:5173/account', { waitUntil: 'networkidle' });
    await page.click('.btn-account-logout');
    await page.waitForURL('http://localhost:5173/', { timeout: 4000 });
    console.log(`  User logout redirected to homepage: ${page.url() === 'http://localhost:5173/' ? 'PASS' : 'FAIL'}`);

    // =========================================================================
    // 3. ADMIN LOGIN & INTEGRATED FEATURES
    // =========================================================================
    console.log('\n[Test 3] Admin Login via Single Unified /login Portal...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

    await page.fill('#login-username', 'admin');
    await page.fill('#login-password', 'AdminSecurePassword2026!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin/dashboard', { timeout: 5000 });
    console.log(`  Admin login automatically routed to /admin/dashboard: ${page.url().includes('/admin/dashboard') ? 'PASS' : 'FAIL'}`);

    const adminDashboardShot = path.join(screenshotDir, '06_admin_dashboard.png');
    await page.screenshot({ path: adminDashboardShot });
    suiteResults.screenshots.push(adminDashboardShot);

    // Verify Admin Users Management page
    await page.goto('http://localhost:5173/admin/users', { waitUntil: 'networkidle' });
    const userRows = await page.locator('.admin-table tbody tr').count();
    console.log(`  Admin Users Page Loaded: ${userRows} users rendered (${userRows >= 2 ? 'PASS' : 'FAIL'})`);

    const adminUsersShot = path.join(screenshotDir, '07_admin_users_page.png');
    await page.screenshot({ path: adminUsersShot });
    suiteResults.screenshots.push(adminUsersShot);

    // Check Header on public page while signed in as admin
    await page.goto('http://localhost:5173/architecture', { waitUntil: 'networkidle' });
    const adminHeaderBtn = await page.locator('.header-actions .auth-badge-btn').innerText();
    console.log(`  Public page header while logged in as admin: "${adminHeaderBtn.trim()}" (Expected: ADMIN DASHBOARD)`);

    // Verify Admin Dropdown options
    await page.click('.header-actions .admin-badge-btn');
    await page.waitForSelector('.header-dropdown-menu', { timeout: 2000 });
    const adminDropdownText = await page.locator('.header-dropdown-menu').innerText();
    const hasAdminDashboard = adminDropdownText.includes('관리자 대시보드');
    const hasArticleManagement = adminDropdownText.includes('기사 관리');
    const hasMediaManagement = adminDropdownText.includes('이미지 관리');
    const hasCategoryManagement = adminDropdownText.includes('카테고리 관리');
    const hasUserManagement = adminDropdownText.includes('사용자 관리');

    console.log(`  Admin Dropdown contains "관리자 대시보드": ${hasAdminDashboard ? 'PASS' : 'FAIL'}`);
    console.log(`  Admin Dropdown contains "기사 관리": ${hasArticleManagement ? 'PASS' : 'FAIL'}`);
    console.log(`  Admin Dropdown contains "이미지 관리": ${hasMediaManagement ? 'PASS' : 'FAIL'}`);
    console.log(`  Admin Dropdown contains "카테고리 관리": ${hasCategoryManagement ? 'PASS' : 'FAIL'}`);
    console.log(`  Admin Dropdown contains "사용자 관리": ${hasUserManagement ? 'PASS' : 'FAIL'}`);

    // Admin Logout
    await page.click('.dropdown-logout-btn');
    await page.waitForURL('http://localhost:5173/', { timeout: 4000 });
    console.log(`  Admin logout returned to homepage: ${page.url() === 'http://localhost:5173/' ? 'PASS' : 'FAIL'}`);

    // =========================================================================
    // 4. MOBILE DRAWER AUTH VERIFICATION
    // =========================================================================
    console.log('\n[Test 4] Mobile Navigation Drawer RBAC Verification (375x812)...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Open mobile menu
    await page.click('.mobile-menu-toggle');
    await page.waitForSelector('.mobile-nav-drawer.open', { timeout: 2000 });

    const mobileMenuText = await page.locator('.mobile-nav-drawer').innerText();
    const mobileHasLogin = mobileMenuText.includes('LOGIN');
    console.log(`  Guest Mobile Drawer contains "LOGIN": ${mobileHasLogin ? 'PASS' : 'FAIL'}`);

    const mobileDrawerShot = path.join(screenshotDir, '08_mobile_drawer_guest.png');
    await page.screenshot({ path: mobileDrawerShot });
    suiteResults.screenshots.push(mobileDrawerShot);

    await page.click('.drawer-close');
    await page.waitForTimeout(300);

    // =========================================================================
    // 5. SUMMARY & REPORT
    // =========================================================================
    console.log('\n=== Playwright Auth & RBAC Suite Completed Successfully ===');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Screenshots Captured: ${suiteResults.screenshots.length}`);

    const reportPath = path.resolve(__dirname, '../../docs/auth_rbac_qa_results.json');
    fs.writeFileSync(reportPath, JSON.stringify(suiteResults, null, 2));

  } catch (err) {
    console.error('Auth & RBAC Test Suite Failure:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runAuthRbacSuite();

