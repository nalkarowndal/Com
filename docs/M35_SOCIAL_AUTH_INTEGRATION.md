# PRISM Editorial Platform — English UI Unification & Google·Kakao Social Authentication Integration (M29–M35)

**Milestones Covered:** M29, M30, M31, M32, M33, M34, M35  
**Document Version:** 1.0.0  
**Status:** 100% Implemented, Verified, and Tested  
**Verification Date:** November 13, 2026  

---

## 1. Executive Summary

This development milestone accomplished the complete linguistic transformation of the PRISM Editorial Platform into natural, high-fashion editorial English and integrated official, brand-compliant Google and Kakao social authentication systems.

The core editorial content, original titles, photography collections, and dual-layer database architecture (PostgreSQL with automated fallback to resilient file-backed persistent storage) were preserved with 100% fidelity.

---

## 2. Key Architecture & Deliverables

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       PRISM Editorial Platform                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│        Frontend (React 19)      │             │        Backend (Node.js 24)     │
│  - 100% English Unified UI      │             │  - Express REST API             │
│  - Centralized i18n Dictionary  │             │  - Dual PostgreSQL / File DB    │
│  - Google Identity Services     │◄─── REST ───┤  - Social OAuth Token Exchange  │
│  - Official Kakao Login Button  │             │  - scrypt + HMAC-SHA256 Auth    │
│  - Role Guard (USER vs ADMIN)   │             │  - Strict RBAC & Anti-Hijack    │
└─────────────────────────────────┘             └─────────────────────────────────┘
```

### Major Milestones Summary

1. **M29: Complete English UI Unification**
   - Eliminated all user-facing Korean strings across headers, mobile drawers, dropdowns, and modals.
   - Preserved original monograph texts ("Urban Strorkes", "Nomadic Horizons", etc.) and brand identifiers.
   - Established `src/constants/uiStrings.js` for future multi-language localization (i18n).
   - Documented in [docs/M29_ENGLISH_UI_AUDIT.md](file:///d:/JSW_React/8_portfolio_123/company/docs/M29_ENGLISH_UI_AUDIT.md).

2. **M30: Enhanced Minimal Editorial Login UI**
   - Centered card matching PRISM design tokens (Ivory `#F7F5F0`, Charcoal `#25262B`, Champagne Gold `#B49A70`).
   - "Welcome Back / Sign in to continue exploring" layout.
   - Refined horizontal divider with "or".
   - Smooth focus transitions, password visibility reveal toggle, loading indicators, and error feedback alerts.

3. **M31: Google Identity Services (GIS)**
   - Official multi-colored 'G' logo with white background and `#DADCE0` neutral border.
   - Official typography: `Sign in with Google`.
   - Google GIS SDK integration (`https://accounts.google.com/gsi/client`) via `google.accounts.id.renderButton`.
   - Node.js backend validation: ID token signature, issuer (`accounts.google.com`), audience (`GOOGLE_CLIENT_ID`), and expiry verification.
   - Reader provisioning: creates new account with strict `user` role.

4. **M32: Kakao Official Social Login**
   - Conforms strictly to Kakao Developers Official Design Guidelines:
     - Background: `#FEE500`
     - Symbol: Official black speech bubble icon (`#000000`)
     - Label: `Login with Kakao`
     - Text color: Black 85% (`rgba(0, 0, 0, 0.85)`)
     - Border radius: `12px`
     - Height: `46px` (matching form elements)
   - OAuth 2.0 authorization code exchange with state CSRF protection.
   - Safe user provisioning with Kakao ID fallback if email consent is not granted.

5. **M33: Social Identity Schema & RBAC Protection**
   - New `social_identities` table with unique constraint on `(provider, provider_user_id)`.
   - Migration: `server/db/migrations/005_create_social_identities_table.sql`.
   - **Anti-Hijack Security:** Social logins can never automatically hijack or promote to `admin` accounts. Any attempt to use social login with an administrator's email triggers a `403 ADMIN_SOCIAL_FORBIDDEN` rejection.

6. **M34: Environment Variables & Security Isolation**
   - Zero hardcoded credentials.
   - Client secrets strictly isolated on the backend.
   - Comprehensive `.env.example` templates created in root and `server/`.
   - Informative configuration guide modal shown when external OAuth credentials are not yet configured in `.env`.
   - Seamless developer simulation mode enabling full end-to-end verification without live third-party developer console setups.

7. **M35: Comprehensive Automated QA**
   - Unit tests: 6/6 PASS (`npm run test:unit`).
   - API tests: 29/29 PASS (`npm run test:api`).
   - Social Auth E2E tests: 7/7 Phases PASS (`npm run test:social`).
   - RBAC E2E tests: 4/4 Phases PASS (`npm run test:rbac`).
   - Multi-page E2E tests: 10/10 Routes & 5 Viewports PASS (`npm run test:multipage`).
   - Lint & Build: 0 ESLint errors/warnings, production bundle built in 700ms.

---

## 3. String Unification Reference (M29)

| Context | Previous String (Korean) | Standardized English String |
|---|---|---|
| Admin Navigation Dropdown | 관리자 대시보드 | `Admin Dashboard` |
| Admin Navigation Dropdown | 기사 관리 | `Article Management` |
| Admin Navigation Dropdown | 이미지 관리 | `Media Library` |
| Admin Navigation Dropdown | 카테고리 관리 | `Category Management` |
| Admin Navigation Dropdown | 사용자 관리 | `User Management` |
| Admin Navigation Dropdown | 계정 정보 | `Account Settings` |
| User Navigation Dropdown | 내 계정 | `My Account` |
| User Navigation Dropdown | 계정 정보 수정 | `Account Settings` |
| Global Dropdowns & Drawers | 로그아웃 | `Sign Out` |
| Mobile Navigation Drawer | 관리자 대시보드 | `Admin Dashboard` |
| Mobile Navigation Drawer | 내 계정 | `My Account` |

---

## 4. Social Authentication Endpoints Reference

| Method | Endpoint | Access | Description |
|:---:|:---:|:---:|---|
| `GET` | `/api/auth/config` | Public | Returns public OAuth client IDs and configuration status (secrets omitted) |
| `POST` | `/api/auth/google` | Public | Validates Google ID token, provisions/retrieves reader, issues JWT |
| `POST` | `/api/auth/kakao` | Public | Exchanges authorization code, retrieves profile, provisions reader, issues JWT |
| `GET` | `/api/auth/kakao/authorize` | Public | Initiates server-side redirect to Kakao OAuth authorization page |
| `GET` | `/api/auth/kakao/callback` | Public | Handles browser OAuth redirect from Kakao, sets cookie, redirects to `/account` |

---

## 5. Visual QA Screenshots

### Social Authentication Interaction Screenshots (`docs/screenshots/social_auth/`)
- [01_enhanced_login_page.png](file:///d:/JSW_React/8_portfolio_123/company/docs/screenshots/social_auth/01_enhanced_login_page.png): Enhanced login page with Welcome Back, divider, Google GIS and Kakao official buttons.
- [02_google_oauth_modal.png](file:///d:/JSW_React/8_portfolio_123/company/docs/screenshots/social_auth/02_google_oauth_modal.png): Google OAuth setup and developer verification dialog.
- [03_google_reader_account.png](file:///d:/JSW_React/8_portfolio_123/company/docs/screenshots/social_auth/03_google_reader_account.png): User account page following Google sign-in with USER role.
- [04_kakao_user_403_denied.png](file:///d:/JSW_React/8_portfolio_123/company/docs/screenshots/social_auth/04_kakao_user_403_denied.png): 403 Forbidden Access Denied page when Kakao USER accesses `/admin`.
- [05_admin_header_dropdown_english.png](file:///d:/JSW_React/8_portfolio_123/company/docs/screenshots/social_auth/05_admin_header_dropdown_english.png): Administrator dropdown menu showing 100% unified English labels.
- [06_mobile_drawer_guest_english.png](file:///d:/JSW_React/8_portfolio_123/company/docs/screenshots/social_auth/06_mobile_drawer_guest_english.png): Mobile navigation drawer showing unified English items.
- [07_mobile_login_social_layout.png](file:///d:/JSW_React/8_portfolio_123/company/docs/screenshots/social_auth/07_mobile_login_social_layout.png): Responsive mobile login screen with stacked social buttons.

### Full-Site Complete Screenshots (`docs/screenshots-2/`)
The entire suite of 40 full-site interaction screenshots in [docs/screenshots-2](file:///d:/JSW_React/8_portfolio_123/company/docs/screenshots-2/) has been regenerated and updated.
