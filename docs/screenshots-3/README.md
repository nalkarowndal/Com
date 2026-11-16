# PRISM Architectural & Editorial Platform — QA Verification Screenshots (screenshots-3)

본 디렉터리는 PRISM 웹 플랫폼의 **영문 UI 전면 통일(M29)**, **Google Identity Services & Kakao 소셜 로그인 연동(M30~M34)**, **소셜 버튼 규격(40px) 및 중앙 정렬 일치**, **사용자(USER) 및 관리자(ADMIN) 권한 분리(RBAC)**, 그리고 **반응형 멀티 뷰포트 검수(M35)**를 위한 공식 QA 검수 산출물 패키지입니다.

총 **43개**의 고해상도 페이지 및 인터랙션 스크린샷과 검수 데이터가 수록되어 있습니다.

## 📋 QA 검수 카테고리 요약

1. **Public Pages & Interactions (01~13)**: 메인 홈, 카테고리(4종), 기사 상세, 갤러리 아카이브, 검색 필터, 404 및 모달/라이트박스 상호작용
2. **Authentication & Form States (14~19)**: 통합 로그인, 비밀번호 토글, 유효성 오류, 회원가입 검증 및 소셜 버튼 상세
3. **Regular User Experience (20~25)**: 일반 독자 로그인 상태, 마이페이지 드롭다운(영문), 계정 설정 및 403 관리자 접근 차단 보안
4. **Administrator CMS Experience (26~34)**: 관리자 대시보드, 기사 관리, 신규 편집기, 카테고리, 미디어 라이브러리, 사용자 관리, 시스템 설정
5. **Responsive Multi-Viewport (35~42)**: 태블릿(768px) 및 모바일(375px) 화면, 모바일 내비게이션 드로어(게스트/유저/어드민)
6. **Social OAuth & Security (43)**: 카카오 공식 OAuth 인가 화면 및 보안 검증

## 🖼️ 전체 스크린샷 목록 (Manifest Matrix)

| 번호 | 카테고리 | 라우트 | 해상도 | 파일명 | 상세 설명 | 링크 |
| :---: | :--- | :--- | :---: | :--- | :--- | :---: |
| 01 | Public Pages | `/` | 1280x800 | `01_home_guest.png` | Home page (Guest) with brand header, LOGIN button, hero section, and cards | [보기](./01_home_guest.png) |
| 02 | Public Interactions | `/` | 1280x800 | `02_home_hero_synopsis_modal.png` | Home page with Quick Synopsis modal dialog open | [보기](./02_home_hero_synopsis_modal.png) |
| 03 | Public Interactions | `/` | 1280x800 | `03_home_gallery_lightbox.png` | Home page with Gallery Lightbox modal dialog open | [보기](./03_home_gallery_lightbox.png) |
| 04 | Category Pages | `/architecture` | 1280x800 | `04_architecture_page.png` | Architecture Category page showing hero banner and editorial collection grid | [보기](./04_architecture_page.png) |
| 05 | Category Pages | `/travel` | 1280x800 | `05_travel_page.png` | Travel Category page showing hero banner and editorial collection grid | [보기](./05_travel_page.png) |
| 06 | Category Pages | `/art` | 1280x800 | `06_art_page.png` | Art Category page showing hero banner and editorial collection grid | [보기](./06_art_page.png) |
| 07 | Category Pages | `/food` | 1280x800 | `07_food_page.png` | Food Category page showing hero banner and editorial collection grid | [보기](./07_food_page.png) |
| 08 | Story Detail | `/stories/urban-strorkes` | 1280x800 | `08_story_detail_urban_strorkes.png` | Article detail page for "Urban Strorkes" monograph | [보기](./08_story_detail_urban_strorkes.png) |
| 09 | Gallery | `/gallery` | 1280x800 | `09_gallery_archive_page.png` | Gallery archive page with category filtering tabs and full photo collection | [보기](./09_gallery_archive_page.png) |
| 10 | Gallery Interactions | `/gallery` | 1280x800 | `10_gallery_archive_lightbox.png` | Gallery archive page with Lightbox image viewer active | [보기](./10_gallery_archive_lightbox.png) |
| 11 | Search | `/search` | 1280x800 | `11_search_page_default.png` | Search page initial state with search query input | [보기](./11_search_page_default.png) |
| 12 | Search Interactions | `/search?q=concrete` | 1280x800 | `12_search_page_with_query.png` | Search page with filtered query "concrete" and matched articles | [보기](./12_search_page_with_query.png) |
| 13 | Error Pages | `/404` | 1280x800 | `13_not_found_404.png` | 404 Not Found error page with return to homepage button | [보기](./13_not_found_404.png) |
| 14 | Authentication | `/login` | 1280x800 | `14_login_page_default.png` | Unified Login page default state showing centered Google & Kakao buttons | [보기](./14_login_page_default.png) |
| 15 | Authentication Interactions | `/login` | 1280x800 | `15_login_page_password_revealed.png` | Login page with credentials filled and password visibility toggled on | [보기](./15_login_page_password_revealed.png) |
| 16 | Authentication Interactions | `/login` | 1280x800 | `16_login_page_error_state.png` | Login page displaying invalid credentials error alert | [보기](./16_login_page_error_state.png) |
| 17 | Social Authentication | `/login` | Element | `17_login_page_social_buttons_detail.png` | Close-up of unified Google and Kakao login buttons with matching 40px height, 4px radius, and centered icons | [보기](./17_login_page_social_buttons_detail.png) |
| 18 | Authentication | `/register` | 1280x800 | `18_register_page_default.png` | Register account page initial form state | [보기](./18_register_page_default.png) |
| 19 | Authentication Interactions | `/register` | 1280x800 | `19_register_page_validation_error.png` | Register page displaying client-side validation error message | [보기](./19_register_page_validation_error.png) |
| 20 | User Experience | `/` | 1280x800 | `20_user_home_logged_in.png` | Home page viewed by authenticated USER showing "MY ACCOUNT" header button | [보기](./20_user_home_logged_in.png) |
| 21 | User Interactions | `/` | 1280x800 | `21_user_header_dropdown_open.png` | User header dropdown open with "My Account", "Account Settings", "Sign Out" | [보기](./21_user_header_dropdown_open.png) |
| 22 | User Pages | `/account` | 1280x800 | `22_user_account_overview.png` | My Account profile overview page for standard reader | [보기](./22_user_account_overview.png) |
| 23 | User Pages | `/account/settings` | 1280x800 | `23_user_account_settings.png` | Account settings page with profile editor and password change form | [보기](./23_user_account_settings.png) |
| 24 | User Interactions | `/account/settings` | 1280x800 | `24_user_account_settings_saved.png` | Account settings displaying "Profile updated successfully" alert banner | [보기](./24_user_account_settings_saved.png) |
| 25 | Security / RBAC | `/admin/dashboard` | 1280x800 | `25_user_admin_access_denied_403.png` | 403 Forbidden Access Denied page when regular USER attempts to access /admin | [보기](./25_user_admin_access_denied_403.png) |
| 26 | Admin Experience | `/` | 1280x800 | `26_admin_home_logged_in.png` | Home page viewed by ADMIN with "ADMIN DASHBOARD" gold button in header | [보기](./26_admin_home_logged_in.png) |
| 27 | Admin Interactions | `/` | 1280x800 | `27_admin_header_dropdown_open.png` | Admin header dropdown open with full CMS navigation links | [보기](./27_admin_header_dropdown_open.png) |
| 28 | Admin CMS | `/admin/dashboard` | 1280x800 | `28_admin_dashboard.png` | Admin CMS Dashboard with system analytics and editorial metrics | [보기](./28_admin_dashboard.png) |
| 29 | Admin CMS | `/admin/articles` | 1280x800 | `29_admin_articles_list.png` | Admin Monograph / Articles management data table | [보기](./29_admin_articles_list.png) |
| 30 | Admin CMS | `/admin/articles/new` | 1280x800 | `30_admin_article_new_editor.png` | Admin article creation and editorial drafting workspace | [보기](./30_admin_article_new_editor.png) |
| 31 | Admin CMS | `/admin/categories` | 1280x800 | `31_admin_categories_list.png` | Admin editorial categories management page | [보기](./31_admin_categories_list.png) |
| 32 | Admin CMS | `/admin/media` | 1280x800 | `32_admin_media_assets.png` | Admin Media Assets catalog with metadata inspection and upload | [보기](./32_admin_media_assets.png) |
| 33 | Admin CMS | `/admin/users` | 1280x800 | `33_admin_users_management.png` | Admin User Directory and RBAC management table | [보기](./33_admin_users_management.png) |
| 34 | Admin CMS | `/admin/settings` | 1280x800 | `34_admin_system_settings.png` | Admin platform and database storage settings | [보기](./34_admin_system_settings.png) |
| 35 | Responsive Tablet | `/login` | 768x1024 | `35_tablet_login_page.png` | Tablet (768x1024) Login page showing responsive centered Google and Kakao buttons | [보기](./35_tablet_login_page.png) |
| 36 | Responsive Mobile | `/` | 375x812 | `36_mobile_home_guest.png` | Mobile Home page (375px) showing responsive header and hamburger toggle | [보기](./36_mobile_home_guest.png) |
| 37 | Mobile Interactions | `/` | 375x812 | `37_mobile_drawer_guest.png` | Mobile navigation drawer for Guest showing "LOGIN →" link | [보기](./37_mobile_drawer_guest.png) |
| 38 | Responsive Mobile | `/login` | 375x812 | `38_mobile_login_page.png` | Mobile Login page with touch-optimized input layout and centered social buttons | [보기](./38_mobile_login_page.png) |
| 39 | Responsive Mobile | `/account` | 375x812 | `39_mobile_account_page.png` | Mobile My Account page view | [보기](./39_mobile_account_page.png) |
| 40 | Mobile Interactions | `/account` | 375x812 | `40_mobile_drawer_user.png` | Mobile navigation drawer for logged-in USER showing "MY ACCOUNT" and settings | [보기](./40_mobile_drawer_user.png) |
| 41 | Responsive Mobile | `/admin/dashboard` | 375x812 | `41_mobile_admin_dashboard.png` | Mobile Admin Dashboard responsive view | [보기](./41_mobile_admin_dashboard.png) |
| 42 | Mobile Interactions | `/architecture` | 375x812 | `42_mobile_drawer_admin.png` | Mobile navigation drawer for logged-in ADMIN showing "ADMINISTRATION" section | [보기](./42_mobile_drawer_admin.png) |
| 43 | Social OAuth Flow | `Kakao Authorize` | 1280x800 | `43_kakao_oauth_redirect_screen.png` | Live official Kakao OAuth login and consent authentication page | [보기](./43_kakao_oauth_redirect_screen.png) |

---

## 🔍 주요 검수 포인트

* **소셜 버튼 크기 및 아이콘 위치 1:1 일치**: 구글('Sign in with Google')과 카카오('Login with Kakao') 버튼이 모두 40px 높이, 4px 모서리 곡률, 100% 가로 폭으로 대칭되며, 양사 아이콘이 텍스트와 함께 중앙에 정렬됩니다.
* **영문 UI 순도 100%**: 헤더, 드롭다운, 모바일 드로어, 버튼, 폼 레이블 등 모든 시스템 UI 문구가 자연스러운 영문으로 통일되었습니다.
* **RBAC 권한 통제**: 일반 독자(USER)는 관리자 페이지 접근 시 403 Forbidden으로 엄격 차단되며 관리자 메뉴가 노출되지 않습니다.
* **멀티 뷰포트 무결성**: 375px 모바일, 768px 태블릿, 1280px 데스크톱 전 구간에서 수평 스크롤(오버플로 0px) 없이 유려하게 반응합니다.
