# PRISM Company Web — M21 Authentication & USER / ADMIN RBAC Integration

## 1. 개요 (Executive Summary)

PRISM 웹사이트의 관리자 직접 진입 구조(`ADMIN` 버튼)를 폐지하고, 단일 통합 로그인(`/login`)을 기반으로 일반 사용자(`USER`)와 관리자(`ADMIN`)가 각각의 권한에 따라 격리된 기능에 접근할 수 있는 전사적 역할 기반 접근 제어(Role-Based Access Control, RBAC) 시스템을 구현하였습니다.

기존의 React 19 + Vite, SCSS, Node.js + Express, PostgreSQL(및 resilient 파일 영속 fallback) 아키텍처와 브랜드 아이덴티티(Ivory, Charcoal, Champagne Gold), 기존 기사·카테고리·미디어 자산 데이터베이스를 100% 보존하면서 인증·보안 계층을 업그레이드하였습니다.

---

## 2. 권한 모델 및 계정 체계

### 2.1 3계층 역할 정의 (Role Hierarchy)

| 역할 (Role) | 인증 상태 | 접근 가능한 경로 | 헤더 UI | 권한 및 기능 |
| :--- | :---: | :--- | :--- | :--- |
| **GUEST** | 미인증 | `/`, `/architecture`, `/travel`, `/art`, `/food`, `/stories/:slug`, `/gallery`, `/search`, `/login`, `/register` | `LOGIN` 버튼 | 공개 콘텐츠 열람, 검색, 로그인, 회원가입 |
| **USER** | 인증 완료 | 공개 경로 + `/account`, `/account/settings` | `MY ACCOUNT` 드롭다운 | 내 계정 정보 조회, 프로필 수정, 비밀번호 변경, 북마크 열람 |
| **ADMIN** | 인증 완료 | 공개 경로 + `/account` + `/admin/*` (대시보드, 기사, 미디어, 카테고리, 사용자, 설정) | `ADMIN DASHBOARD` 드롭다운 | CMS 기사 등록/수정/삭제, 미디어 업로드/추천/롤백, 사용자 계정 관리, 시스템 통계 |

### 2.2 사용자 데이터베이스 스키마 (`users` 테이블)

PostgreSQL DDL Migration: `server/db/migrations/004_create_users_table.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(32) NOT NULL DEFAULT 'user',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    avatar VARCHAR(255) DEFAULT '/images/avatars/user.svg',
    bookmarks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

> **영속성 및 Fallback**: PostgreSQL 미연결 시 `server/db/persistent_data.json`의 `users` 컬렉션으로 자동 연계되어 데이터 유실 없이 실시간 읽기/쓰기가 지원됩니다.

---

## 3. 인증 및 보안 아키텍처

### 3.1 비밀번호 암호화 및 검증 (scrypt + timingSafeEqual)
- 단방향 암호 해싱: Node.js `crypto.scryptSync` 및 16바이트 보안 난수 솔트(`salt`)를 사용하여 `${salt}:${derivedKey}` 포맷으로 안전하게 저장됩니다.
- 타이밍 공격 방지: 비밀번호 일치 여부는 `crypto.timingSafeEqual`을 통해 상수 시간(constant-time)으로 비교되어 사이드 채널 타이밍 공격을 원천 차단합니다.

### 3.2 세션 및 토큰 발급
- HMAC-SHA256 디지털 서명 기반의 경량 보안 토큰을 발급하여 24시간 유효기간(`iat`)을 검증합니다.
- 토큰은 `HttpOnly`, `SameSite: 'lax'`, `Secure` (Production 환경) 쿠키(`prism_auth_token`, `auth_token`, `admin_token`) 및 API 응답 Bearer Token으로 이중 전달되어 CSRF와 XSS 공격 위험을 완화합니다.
- 로그아웃 시 서버 측 및 클라이언트 측 쿠키/토큰을 즉시 무효화합니다.

### 3.3 공개 회원가입 보안 원칙 (Strict Role Enforcement)
- `/api/auth/register` 공개 엔드포인트는 클라이언트가 `role: 'admin'`을 페이로드로 주입하더라도 서버 측에서 이를 완전히 무시하고 오직 `user` 역할만을 강제 부여합니다.
- 신규 관리자 계정은 데이터베이스 초기 설정 또는 승인된 관리자 권한을 통해서만 프로비저닝됩니다.

---

## 4. RESTful API 명세

### 4.1 인증 API (`/api/auth`)

| 메서드 | 엔드포인트 | 접근 권한 | 요청 페이로드 | 응답 설명 |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/register` | Public | `{ username, email, password, name? }` | 신규 사용자 생성 (Role: `user`), 토큰 발급 (201 Created) |
| `POST` | `/api/auth/login` | Public | `{ identifier, password }` | 이메일 또는 사용자명으로 로그인, 토큰 및 쿠키 발급 (200 OK) |
| `POST` | `/api/auth/logout` | Public | 없음 | 세션 쿠키 삭제 및 무효화 (200 OK) |
| `GET` | `/api/auth/session` | Public | Header 또는 Cookie | 세션 유효성 확인 (`{ isAuthenticated, role, user }`) |
| `GET` | `/api/auth/me` | Authenticated | Bearer / Cookie | 현재 로그인된 사용자 정보 조회 |
| `PUT` | `/api/auth/profile` | Authenticated | `{ name, email?, avatar? }` | 사용자 프로필 정보 갱신 |
| `PUT` | `/api/auth/password` | Authenticated | `{ currentPassword, newPassword }` | 현재 비밀번호 확인 후 신규 비밀번호 변경 |

### 4.2 관리자 API (`/api/admin`)

모든 `/api/admin/*` 엔드포인트는 `requireAdmin` 미들웨어를 거치며, 비인증 요청은 `401 UNAUTHORIZED`, `user` 권한 요청은 `403 FORBIDDEN` 에러를 반환합니다.

| 메서드 | 엔드포인트 | 설명 |
| :--- | :--- | :--- |
| `GET` | `/api/admin/users` | 등록된 사용자 목록 조회 (역할 필터, 검색, 페이징 지원) |
| `PATCH` | `/api/admin/users/:id/status` | 사용자 활성/비활성 상태 또는 역할 조정 |
| `DELETE` | `/api/admin/users/:id` | 사용자 계정 삭제 (기본 관리자 계정 삭제 방지) |
| `GET` | `/api/admin/stats` | CMS aggregated 메트릭 |
| `POST/PATCH/DELETE` | `/api/admin/articles/*` | 기사 콘텐츠 관리 |
| `GET/POST/PUT/DELETE` | `/api/admin/media/*` | 미디어 자산 관리 |

---

## 5. UI/UX 및 프론트엔드 구현

### 5.1 헤더 변환 및 드롭다운 네비게이션
- **GUEST**: 상단 우측에 `LOGIN` 버튼(알약형 아웃라인, 호버 시 반전 효과) 배치, 클릭 시 `/login` 이동.
- **USER**: 상단 우측에 녹색 인디케이터가 포함된 `MY ACCOUNT` 버튼 표시.
  - 드롭다운: `내 계정 (/account)`, `계정 정보 수정 (/account/settings)`, `로그아웃`.
- **ADMIN**: 상단 우측에 샴페인 골드 인디케이터가 포함된 `ADMIN DASHBOARD` 버튼 표시.
  - 드롭다운: `관리자 대시보드`, `기사 관리`, `이미지 관리`, `카테고리 관리`, `사용자 관리`, `계정 정보`, `로그아웃`.
- **모바일 네비게이션 (`MobileNav.jsx`)**: 데스크톱과 100% 동일한 권한 규칙이 슬라이드 아웃 드로어에 적용됩니다.

### 5.2 전용 페이지 구성
1. **통합 로그인 (`/login`)**: PRISM 로고, Ivory/Charcoal 카드, 이메일/사용자명 입력, 비밀번호 표시/숨기기 토글, 회원가입 링크(`/register`), 오류 피드백, 로그인 후 역할에 따른 자동 라우팅(ADMIN → 대시보드, USER → 내 계정).
2. **회원가입 (`/register`)**: 실시간 유효성 검사(사용자명 3~30자 영숫자, 이메일 정규식, 비밀번호 8자 이상 영문+숫자 복합, 비밀번호 일치 확인).
3. **내 계정 (`/account`)**: 아바타, 이름, 가입일, 역할 뱃지, 회원 상태, 큐레이션 바로가기.
4. **계정 설정 (`/account/settings`)**: 프로필 변경 폼, 비밀번호 변경 폼.
5. **접근 권한 제한 (`403 FORBIDDEN` / `AccessDeniedPage`)**: 일반 사용자가 관리자 URL에 접근 시 안전한 차단 화면 및 홈/계정 복귀 버튼 제공.
6. **사용자 관리 (`/admin/users`)**: 관리자 전용 사용자 목록 테이블, 검색, 역할 필터, 계정 활성/비활성 토글, 계정 삭제.

---

## 6. 품질 보증 (QA) 및 자동화 테스트 결과

### 6.1 테스트 매트릭스 요약

```text
========================================================================
Test Suite                                  Status   Pass / Total   Time
========================================================================
1. Unit: Content Preservation               PASS     6 / 6 tests    88ms
2. API: PRISM Public & Admin REST APIs      PASS     16 / 16 tests  227ms
3. API: Auth, Session, RBAC Security        PASS     6 / 6 tests    442ms
4. E2E: Multipage Canonical Routes (10/10)  PASS     10 / 10 routes 4.8s
5. E2E: Viewports & Overflow (5/5)          PASS     5 / 5 vps      2.1s
6. E2E: Playwright Auth & RBAC Suite        PASS     8 / 8 phases   3.6s
   - Guest: Header LOGIN verification       PASS
   - User Registration: Strict role check   PASS
   - User: Header MY ACCOUNT & Dropdown     PASS
   - Security: User accessing /admin -> 403 PASS
   - Admin: Single Login -> /admin/dashboardPASS
   - Admin: Users Management page loaded    PASS
   - Mobile: 375x812 Drawer auth state      PASS
   - Screenshots captured (8 files)         PASS
7. Code Quality: ESLint                     PASS     0 errors / 0 warnings
8. Production Build: Vite Build             PASS     Built in 670ms
========================================================================
```

### 6.2 캡처된 증적 스크린샷 (`docs/screenshots/auth_rbac/`)
- `01_guest_homepage.png`: 헤더 `LOGIN` 버튼 확인
- `02_login_page.png`: `/login` 통합 로그인 화면
- `03_register_page.png`: `/register` 회원가입 화면
- `04_user_account_page.png`: `/account` 일반 사용자 내 계정 화면
- `05_user_access_denied_403.png`: 일반 사용자의 관리자 URL 접근 시 403 차단 화면
- `06_admin_dashboard.png`: 관리자 대시보드 진입 화면
- `07_admin_users_page.png`: `/admin/users` 사용자 관리 화면
- `08_mobile_drawer_guest.png`: 모바일 375px 드로어 `LOGIN` 링크 화면

