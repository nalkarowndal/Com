# 멀티페이지 확장 및 기술 부채 감사 보고서 (MULTIPAGE_AUDIT.md)

작성일자: 2026-10-20  
프로젝트: `company` (PRISM)  
마일스톤: M8 — 현황 정밀 진단 및 기반 안정화

---

## 1. 개요

M0~M7을 통해 단일 메인페이지를 중심으로 한 UI/UX 고도화, 기초 Express REST API, 데이터베이스 구조가 확립되었습니다.
그러나 실제 사용 가능한 멀티페이지 플랫폼으로 확장하기에 앞서, 기존 구현에 내재된 구조적 기술 부채 9건(A~I)을 정밀 진단하고 명확한 해결 방안을 수립합니다.

---

## 2. 기존 기술 부채 9대 항목 진단 및 해결 방안

### A. React Router 부재
- **진단**: `package.json` 및 `src/App.jsx`에 라우팅 패키지가 설치/구성되어 있지 않아 메인페이지(`HomePage`)만 렌더링되고 있었음.
- **해결 방안**: `react-router-dom` v7을 도입하고 `createBrowserRouter`, `RouterProvider`, `Outlet`, `ScrollRestoration`을 적용하여 `/`, `/architecture`, `/travel`, `/art`, `/food`, `/stories/:slug`, `/gallery`, `/search`, `/admin/*` 등 완전한 독립 라우트 체계를 구축함.

### B. 내비게이션 `preventDefault()`로 인한 이동 불가
- **진단**: `Header.jsx`와 `MobileNav.jsx`의 메뉴 링크 클릭 이벤트 핸들러에서 `e.preventDefault()`를 호출하고 `href="#"`로 고정되어 있어 실제 페이지 전환이 차단되었음.
- **해결 방안**: `Link` 및 `NavLink`를 도입하여 `/architecture` 등으로 실제 URL 경로 이동을 수행하고, 현재 활성 페이지에 `aria-current="page"` 및 활성 인디케이터 클래스를 부여함.

### C. 관리자 모달 저장 시 서버 DB 미반영 (React 로컬 상태에만 머묾)
- **진단**: 기존 `AdminModal.jsx`의 저장이 부모 컴포넌트의 `updateContentFromAdmin` 로컬 상태만 갱신하고 `apiUpdateArticle`을 비동기 호출하여 서버 DB에 영속화하지 않았음.
- **해결 방안**: 실제 REST API(`PATCH /api/admin/articles/:id`, `PATCH /api/admin/cards/:id`)를 호출하고, 서버 DB 갱신 성공 시 상태를 리프레시하도록 데이터 흐름을 완전 자동화함.

### D. 관리자 UI 미인증 상태에서 "Authenticated" 허위 표시
- **진단**: 로그인 폼 없이 단순히 모달을 열면 `Authenticated` 배지가 노출되어 실제 백엔드 인증 없이 관리 화면에 접근 가능한 것처럼 보였음.
- **해결 방안**: `/admin/login` 로그인 뷰를 정식 구축하고, 백엔드 세션 토큰(`admin_token`) 검증 후 권한이 확인된 사용자에게만 관리자 대시보드(`/admin/dashboard`) 접근을 허용하는 보호 라우트(`ProtectedRoute`)를 구현함.

### E. PostgreSQL vs 파일 영속 저장소 구현 불일치
- **진단**: `contentRepository.updateArticle`, `updateFeaturedCard`, `createAuditLog`가 `activeEngine === 'postgres'` 상태에서도 오직 `fileDbCache`만 업데이트하고 실제 PostgreSQL 테이블에는 `UPDATE` 쿼리를 실행하지 않았음.
- **해결 방안**: `contentRepository` 내 모든 CUD(Create, Update, Delete) 메서드에 PostgreSQL 분기 쿼리를 구현하여 두 스토리지 엔진 모두에서 완전한 영속성이 보장되도록 정합성을 일치시킴.

### F. PostgreSQL 테이블 생성 후 원본 콘텐츠 미적재
- **진단**: `database.js`의 `initDatabase()`에서 `CREATE TABLE IF NOT EXISTS`만 실행하고, 테이블이 빈 상태일 때 `001_initial_content.json`의 원본 데이터를 PostgreSQL에 `INSERT`하는 시드 로직이 누락되어 있었음.
- **해결 방안**: `seedPostgresDatabase()` 루틴을 추가하여 PostgreSQL 테이블이 비어 있을 경우 자동으로 베이스라인 콘텐츠를 적재하도록 구현함.

### G. 콘텐츠 보존 스냅샷의 `href: "#"` 고정 검사 문제
- **진단**: `contentSnapshot.json`의 메뉴 `href`가 `#`로 고정되어 있어 라우팅 도입 시 기존 단위 테스트가 실패할 위험이 있음.
- **해결 방안**: 원본 스냅샷은 그대로 보존하고, 테스트 코드에서 "스냅샷의 원래 값(`'#'`) 또는 실제 라우팅 경로(`'/architecture'`, `'/travel'` 등)"를 유효성으로 인정하는 라우팅 마이그레이션 규칙을 명시적으로 적용함.

### H. 환경 변수 및 인증 비밀값 보안 점검
- **진단**: `.env.example` 및 `.env` 파일에 비밀키와 고정 관리자 비밀번호가 포함되어 있었음.
- **해결 방안**: `SECURITY_REVIEW.md` 작성, 비밀번호 단방향 솔트 해시(PBKDF2/scrypt) 적용, 타이밍 공격 방지 `crypto.timingSafeEqual`, `.env.example`의 플레이스홀더화, 프로덕션 보안 경고 강화.

### I. 테스트 코드와 배포 가이드의 고정 자격증명
- **진단**: 배포 가이드와 테스트 코드에 고정된 비밀번호가 노출되어 있었음.
- **해결 방안**: 동적 또는 테스트 격리용 자격증명 환경 변수 참조로 변경하고, 배포 가이드에 무작위 비밀키 생성 명령을 안내함.

---

## 3. 마이그레이션 실행 계획

1. **보안 계층 강화**: `auth.service.js` 패스워드 해싱 및 토큰 서명 타이밍 검증.
2. **저장소 정합성 확보**: `content.repository.js`의 PostgreSQL CUD 쿼리 및 시드 로직 완성.
3. **스냅샷 검증 갱신**: 라우팅 전환을 수용하는 단위 테스트 검증.
4. **React Router v7 구조 전면 가동**: 멀티페이지 뼈대 구축 및 서브페이지 순차 개발.
