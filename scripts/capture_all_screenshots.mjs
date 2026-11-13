import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '../docs/screenshots-2');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function captureAll() {
  console.log('=== Starting Complete Full-Site Interaction Screenshot Capture ===');
  console.log(`Target Output Directory: ${outputDir}\n`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const manifest = [];
  const recordScreenshot = (filename, description) => {
    manifest.push({ filename, description });
    console.log(`[Captured] ${filename} - ${description}`);
  };

  try {
    // =========================================================================
    // 1. PUBLIC PAGES & INTERACTIONS (GUEST)
    // =========================================================================
    console.log('\n--- 1. Public Pages (Guest) ---');
    const guestContext = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const guestPage = await guestContext.newPage();

    await guestPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await guestPage.waitForTimeout(500);
    await guestPage.screenshot({ path: path.join(outputDir, '01_home_guest.png'), fullPage: true });
    recordScreenshot('01_home_guest.png', 'Home page (Guest) with brand header, LOGIN button, hero section, and cards');

    // Hero Synopsis Modal interaction
    const synopsisBtn = guestPage.locator('.hero-synopsis-btn');
    if (await synopsisBtn.isVisible()) {
      await synopsisBtn.click();
      await guestPage.waitForSelector('.modal-dialog', { timeout: 3000 });
      await guestPage.waitForTimeout(300);
      await guestPage.screenshot({ path: path.join(outputDir, '02_home_hero_synopsis_modal.png') });
      recordScreenshot('02_home_hero_synopsis_modal.png', 'Home page with Quick Synopsis modal dialog open');
      await guestPage.keyboard.press('Escape');
      await guestPage.waitForTimeout(300);
    }

    // Home Gallery Lightbox interaction
    const firstGalleryItem = guestPage.locator('.gallery-card').first();
    if (await firstGalleryItem.isVisible()) {
      await firstGalleryItem.click();
      await guestPage.waitForSelector('.lightbox-dialog', { timeout: 3000 });
      await guestPage.waitForTimeout(300);
      await guestPage.screenshot({ path: path.join(outputDir, '03_home_gallery_lightbox.png') });
      recordScreenshot('03_home_gallery_lightbox.png', 'Home page with Gallery Lightbox modal dialog open');
      await guestPage.keyboard.press('Escape');
      await guestPage.waitForTimeout(300);
    }

    // Category Pages
    const categories = [
      { slug: 'architecture', filename: '04_architecture_page.png', title: 'Architecture Category' },
      { slug: 'travel', filename: '05_travel_page.png', title: 'Travel Category' },
      { slug: 'art', filename: '06_art_page.png', title: 'Art Category' },
      { slug: 'food', filename: '07_food_page.png', title: 'Food Category' }
    ];

    for (const cat of categories) {
      await guestPage.goto(`http://localhost:5173/${cat.slug}`, { waitUntil: 'networkidle' });
      await guestPage.waitForTimeout(400);
      await guestPage.screenshot({ path: path.join(outputDir, cat.filename), fullPage: true });
      recordScreenshot(cat.filename, `${cat.title} page showing hero banner and editorial collection grid`);
    }

    // Article Detail Page
    await guestPage.goto('http://localhost:5173/stories/urban-strorkes', { waitUntil: 'networkidle' });
    await guestPage.waitForTimeout(400);
    await guestPage.screenshot({ path: path.join(outputDir, '08_story_detail_urban_strorkes.png'), fullPage: true });
    recordScreenshot('08_story_detail_urban_strorkes.png', 'Article detail page for "Urban Strorkes" monograph');

    // Gallery Archive Page
    await guestPage.goto('http://localhost:5173/gallery', { waitUntil: 'networkidle' });
    await guestPage.waitForTimeout(400);
    await guestPage.screenshot({ path: path.join(outputDir, '09_gallery_archive_page.png'), fullPage: true });
    recordScreenshot('09_gallery_archive_page.png', 'Gallery archive page with category filtering tabs and full photo collection');

    // Gallery Archive Lightbox
    const archiveItem = guestPage.locator('.gallery-archive-item').first();
    if (await archiveItem.isVisible()) {
      await archiveItem.click();
      await guestPage.waitForSelector('.lightbox-dialog', { timeout: 3000 });
      await guestPage.waitForTimeout(300);
      await guestPage.screenshot({ path: path.join(outputDir, '10_gallery_archive_lightbox.png') });
      recordScreenshot('10_gallery_archive_lightbox.png', 'Gallery archive page with Lightbox image viewer active');
      await guestPage.keyboard.press('Escape');
      await guestPage.waitForTimeout(300);
    }

    // Search Page - Default state
    await guestPage.goto('http://localhost:5173/search', { waitUntil: 'networkidle' });
    await guestPage.waitForTimeout(400);
    await guestPage.screenshot({ path: path.join(outputDir, '11_search_page_default.png'), fullPage: true });
    recordScreenshot('11_search_page_default.png', 'Search page initial state with search query input');

    // Search Page - Active query & results
    await guestPage.goto('http://localhost:5173/search?q=concrete&category=architecture', { waitUntil: 'networkidle' });
    await guestPage.waitForTimeout(400);
    await guestPage.screenshot({ path: path.join(outputDir, '12_search_page_with_query.png'), fullPage: true });
    recordScreenshot('12_search_page_with_query.png', 'Search page with filtered query "concrete" and matched articles');

    // 404 Not Found Page
    await guestPage.goto('http://localhost:5173/random-unknown-404', { waitUntil: 'networkidle' });
    await guestPage.waitForTimeout(400);
    await guestPage.screenshot({ path: path.join(outputDir, '13_not_found_404.png'), fullPage: true });
    recordScreenshot('13_not_found_404.png', '404 Not Found error page with return to homepage button');

    // =========================================================================
    // 2. AUTHENTICATION & FORM VALIDATION STATES
    // =========================================================================
    console.log('\n--- 2. Authentication Pages & Form States ---');
    await guestPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await guestPage.waitForTimeout(400);
    await guestPage.screenshot({ path: path.join(outputDir, '14_login_page_default.png'), fullPage: true });
    recordScreenshot('14_login_page_default.png', 'Unified Login page default state');

    // Login Form - Filled with password toggle
    await guestPage.locator('#login-username').fill('reader@prism.company.io');
    await guestPage.locator('#login-password').fill('UserSecurePassword2026!');
    await guestPage.locator('.btn-toggle-password').click();
    await guestPage.waitForTimeout(200);
    await guestPage.screenshot({ path: path.join(outputDir, '15_login_page_password_revealed.png'), fullPage: true });
    recordScreenshot('15_login_page_password_revealed.png', 'Login page with credentials filled and password visibility toggled on');

    // Login Form - Error state
    await guestPage.locator('#login-password').fill('WrongPassword123!');
    await guestPage.locator('button[type="submit"]').click();
    await guestPage.waitForSelector('.auth-error-alert', { timeout: 4000 });
    await guestPage.waitForTimeout(300);
    await guestPage.screenshot({ path: path.join(outputDir, '16_login_page_error_state.png'), fullPage: true });
    recordScreenshot('16_login_page_error_state.png', 'Login page displaying invalid credentials error alert');

    // Register Page - Default state
    await guestPage.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
    await guestPage.waitForTimeout(400);
    await guestPage.screenshot({ path: path.join(outputDir, '17_register_page_default.png'), fullPage: true });
    recordScreenshot('17_register_page_default.png', 'Register account page initial form state');

    // Register Page - Validation error state
    await guestPage.locator('#reg-username').fill('ab'); // too short
    await guestPage.locator('#reg-email').fill('invalid-email');
    await guestPage.locator('#reg-password').fill('short');
    await guestPage.locator('#reg-confirm-password').fill('mismatch');
    await guestPage.locator('button[type="submit"]').click();
    await guestPage.waitForSelector('.auth-error-alert', { timeout: 4000 });
    await guestPage.waitForTimeout(300);
    await guestPage.screenshot({ path: path.join(outputDir, '18_register_page_validation_error.png'), fullPage: true });
    recordScreenshot('18_register_page_validation_error.png', 'Register page displaying client-side validation error message');

    await guestContext.close();

    // =========================================================================
    // 3. REGULAR USER (USER) STATES & INTERACTIONS
    // =========================================================================
    console.log('\n--- 3. Regular User (USER) Experience ---');
    const userContext = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const userPage = await userContext.newPage();

    await userPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await userPage.locator('#login-username').fill('user');
    await userPage.locator('#login-password').fill('UserSecurePassword2026!');
    await userPage.waitForTimeout(200);
    await userPage.locator('button[type="submit"]').click();
    await userPage.waitForURL('**/account', { timeout: 8000 });
    await userPage.waitForTimeout(400);

    // User logged in on Homepage
    await userPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await userPage.waitForTimeout(400);
    await userPage.screenshot({ path: path.join(outputDir, '19_user_home_logged_in.png'), fullPage: true });
    recordScreenshot('19_user_home_logged_in.png', 'Home page viewed by authenticated USER showing "MY ACCOUNT" header button');

    // User Header Dropdown opened
    await userPage.locator('.header-actions .user-badge-btn').click();
    await userPage.waitForSelector('.header-dropdown-menu', { timeout: 3000 });
    await userPage.waitForTimeout(200);
    await userPage.screenshot({ path: path.join(outputDir, '20_user_header_dropdown_open.png') });
    recordScreenshot('20_user_header_dropdown_open.png', 'User header dropdown open with "내 계정", "계정 정보 수정", "로그아웃"');

    // User Account Page
    await userPage.goto('http://localhost:5173/account', { waitUntil: 'networkidle' });
    await userPage.waitForTimeout(400);
    await userPage.screenshot({ path: path.join(outputDir, '21_user_account_overview.png'), fullPage: true });
    recordScreenshot('21_user_account_overview.png', 'My Account profile overview page for standard reader');

    // User Account Settings Page
    await userPage.goto('http://localhost:5173/account/settings', { waitUntil: 'networkidle' });
    await userPage.waitForTimeout(400);
    await userPage.screenshot({ path: path.join(outputDir, '22_user_account_settings.png'), fullPage: true });
    recordScreenshot('22_user_account_settings.png', 'Account settings page with profile editor and password change form');

    // Save profile change for feedback banner
    await userPage.locator('#settings-name').fill('Jane Reader (Verified)');
    await userPage.locator('.btn-settings-save').first().click();
    await userPage.waitForSelector('.alert-success', { timeout: 4000 });
    await userPage.waitForTimeout(300);
    await userPage.screenshot({ path: path.join(outputDir, '23_user_account_settings_saved.png'), fullPage: true });
    recordScreenshot('23_user_account_settings_saved.png', 'Account settings displaying "Profile updated successfully" alert banner');

    // Security Verification: Regular User accessing /admin/dashboard -> 403 Forbidden
    await userPage.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle' });
    await userPage.waitForTimeout(400);
    await userPage.screenshot({ path: path.join(outputDir, '24_user_admin_access_denied_403.png'), fullPage: true });
    recordScreenshot('24_user_admin_access_denied_403.png', '403 Forbidden Access Denied page when regular USER attempts to access /admin');

    await userContext.close();

    // =========================================================================
    // 4. ADMINISTRATOR (ADMIN) STATES & INTERACTIONS
    // =========================================================================
    console.log('\n--- 4. Administrator (ADMIN) Experience ---');
    const adminContext = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const adminPage = await adminContext.newPage();

    await adminPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await adminPage.locator('#login-username').fill('admin');
    await adminPage.locator('#login-password').fill('AdminSecurePassword2026!');
    await adminPage.waitForTimeout(200);
    await adminPage.locator('button[type="submit"]').click();
    await adminPage.waitForURL('**/admin/dashboard', { timeout: 8000 });
    await adminPage.waitForTimeout(400);

    // Admin viewed on Homepage
    await adminPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(400);
    await adminPage.screenshot({ path: path.join(outputDir, '25_admin_home_logged_in.png'), fullPage: true });
    recordScreenshot('25_admin_home_logged_in.png', 'Home page viewed by ADMIN with "ADMIN DASHBOARD" gold button in header');

    // Admin Header Dropdown opened
    await adminPage.locator('.header-actions .admin-badge-btn').click();
    await adminPage.waitForSelector('.header-dropdown-menu', { timeout: 3000 });
    await adminPage.waitForTimeout(200);
    await adminPage.screenshot({ path: path.join(outputDir, '26_admin_header_dropdown_open.png') });
    recordScreenshot('26_admin_header_dropdown_open.png', 'Admin header dropdown open with full CMS navigation links');

    // Admin Dashboard
    await adminPage.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(400);
    await adminPage.screenshot({ path: path.join(outputDir, '27_admin_dashboard.png'), fullPage: true });
    recordScreenshot('27_admin_dashboard.png', 'Admin CMS Dashboard with system analytics and editorial metrics');

    // Admin Articles List
    await adminPage.goto('http://localhost:5173/admin/articles', { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(400);
    await adminPage.screenshot({ path: path.join(outputDir, '28_admin_articles_list.png'), fullPage: true });
    recordScreenshot('28_admin_articles_list.png', 'Admin Monograph / Articles management data table');

    // Admin Article New Editor
    await adminPage.goto('http://localhost:5173/admin/articles/new', { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(400);
    await adminPage.screenshot({ path: path.join(outputDir, '29_admin_article_new_editor.png'), fullPage: true });
    recordScreenshot('29_admin_article_new_editor.png', 'Admin article creation and editorial drafting workspace');

    // Admin Categories List
    await adminPage.goto('http://localhost:5173/admin/categories', { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(400);
    await adminPage.screenshot({ path: path.join(outputDir, '30_admin_categories_list.png'), fullPage: true });
    recordScreenshot('30_admin_categories_list.png', 'Admin editorial categories management page');

    // Admin Media Assets
    await adminPage.goto('http://localhost:5173/admin/media', { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(400);
    await adminPage.screenshot({ path: path.join(outputDir, '31_admin_media_assets.png'), fullPage: true });
    recordScreenshot('31_admin_media_assets.png', 'Admin Media Assets catalog with metadata inspection and upload');

    // Admin Users Directory
    await adminPage.goto('http://localhost:5173/admin/users', { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(400);
    await adminPage.screenshot({ path: path.join(outputDir, '32_admin_users_management.png'), fullPage: true });
    recordScreenshot('32_admin_users_management.png', 'Admin User Directory and RBAC management table');

    // Admin Settings
    await adminPage.goto('http://localhost:5173/admin/settings', { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(400);
    await adminPage.screenshot({ path: path.join(outputDir, '33_admin_system_settings.png'), fullPage: true });
    recordScreenshot('33_admin_system_settings.png', 'Admin platform and database storage settings');

    await adminContext.close();

    // =========================================================================
    // 5. MOBILE VIEWPORT & DRAWER INTERACTIONS (375x812)
    // =========================================================================
    console.log('\n--- 5. Mobile Viewport & Drawer Interactions (375x812) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();

    // Mobile Guest Home
    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: path.join(outputDir, '34_mobile_home_guest.png') });
    recordScreenshot('34_mobile_home_guest.png', 'Mobile Home page (375px) showing responsive header and hamburger toggle');

    // Mobile Guest Drawer
    await mobilePage.locator('.mobile-menu-toggle').click();
    await mobilePage.waitForSelector('.mobile-nav-drawer.open', { timeout: 3000 });
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(outputDir, '35_mobile_drawer_guest.png') });
    recordScreenshot('35_mobile_drawer_guest.png', 'Mobile navigation drawer for Guest showing "LOGIN →" link');

    // Mobile Login
    await mobilePage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(400);
    await mobilePage.screenshot({ path: path.join(outputDir, '38_mobile_login_page.png') });
    recordScreenshot('38_mobile_login_page.png', 'Mobile Login page with touch-optimized input layout');

    // Mobile User Logged in & Drawer
    await mobilePage.locator('#login-username').fill('user');
    await mobilePage.locator('#login-password').fill('UserSecurePassword2026!');
    await mobilePage.locator('button[type="submit"]').click();
    await mobilePage.waitForURL('**/account', { timeout: 8000 });
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(outputDir, '39_mobile_account_page.png') });
    recordScreenshot('39_mobile_account_page.png', 'Mobile My Account page view');

    await mobilePage.locator('.mobile-menu-toggle').click();
    await mobilePage.waitForSelector('.mobile-nav-drawer.open', { timeout: 3000 });
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(outputDir, '36_mobile_drawer_user.png') });
    recordScreenshot('36_mobile_drawer_user.png', 'Mobile navigation drawer for logged-in USER showing "MY ACCOUNT" and settings');
    await mobilePage.locator('.drawer-close').click();
    await mobilePage.waitForTimeout(300);

    // Mobile Admin Login & Drawer
    await mobilePage.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await mobilePage.locator('#login-username').fill('admin');
    await mobilePage.locator('#login-password').fill('AdminSecurePassword2026!');
    await mobilePage.locator('button[type="submit"]').click();
    await mobilePage.waitForURL('**/admin/dashboard', { timeout: 8000 });
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(outputDir, '40_mobile_admin_dashboard.png') });
    recordScreenshot('40_mobile_admin_dashboard.png', 'Mobile Admin Dashboard responsive view');

    // Mobile Admin Drawer on Public Page
    await mobilePage.goto('http://localhost:5173/architecture', { waitUntil: 'networkidle' });
    await mobilePage.locator('.mobile-menu-toggle').click();
    await mobilePage.waitForSelector('.mobile-nav-drawer.open', { timeout: 3000 });
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(outputDir, '37_mobile_drawer_admin.png') });
    recordScreenshot('37_mobile_drawer_admin.png', 'Mobile navigation drawer for logged-in ADMIN showing "ADMINISTRATION" section');

    console.log(`\n=== All ${manifest.length} Screenshots Successfully Captured! ===`);

    // Write index markdown and json manifest in docs/screenshots-2
    const manifestPath = path.join(outputDir, 'screenshots_manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    let readmeContent = `# PRISM Company Web — Complete Site Interaction Screenshots (screenshots-2)\n\n`;
    readmeContent += `총 **${manifest.length}개**의 전체 페이지 및 상호작용 상태 스크린샷 모음입니다.\n\n`;
    readmeContent += `| 번호 | 파일명 | 설명 | 링크 |\n| :--- | :--- | :--- | :---: |\n`;
    manifest.forEach((item, index) => {
      readmeContent += `| ${index + 1} | \`${item.filename}\` | ${item.description} | [${item.filename}](./${item.filename}) |\n`;
    });
    fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent, 'utf-8');

    await mobileContext.close();

  } catch (err) {
    console.error('Screenshot capture failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

captureAll();
