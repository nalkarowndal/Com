# company (PRISM) — Multi-Page Architectural & Editorial Platform (M8~M15)

> **PRISM Architectural & Editorial Magazine Platform**  
> React 19 + Vite 8 + React Router DOM v7 프론트엔드와 Node.js 24 + Express + Dual PostgreSQL/Persistent JSON 백엔드를 갖춘 완성형 멀티페이지 에디토리얼 플랫폼입니다.

---

## 🏛️ 프로젝트 핵심 원칙: 원본 콘텐츠 100% 보존

본 프로젝트는 기존 `company` 프로젝트에 존재하던 모든 콘텐츠, 브랜드 로고, 이미지 자산, 고유 철자(`Urban Strorkes`, `Inspring Reads`), 및 저작권 표기를 단 1글자도 왜곡하거나 삭제하지 않고 완전히 보존한 상태에서 완성형 멀티페이지 에디토리얼 플랫폼으로 발전시켰습니다.

- **프로젝트 명**: `company`
- **브랜드 로고**: `PRISM` (`/images/logo.png`)
- **오리지널 콘텐츠**:
  - Hero: `Editor's Choice`, `Sebastian Weiss`, `Urban Strorkes`, `Read More`, `hero.jpg`
  - Cards: `Inspring Reads` (Tan Box), `Reflections` (Dark Box), 원본 설명문 및 버튼
  - Gallery: `gallery-1.jpg`, `gallery-2.jpg`, `gallery-3.jpg`, `gallery-4.jpg`
  - Footer: `2026 Green Systems Incorporated. All rights reserved.`
  - 자동화 스냅샷 검증: `tests/snapshots/contentSnapshot.json`

---

## 🌐 10대 핵심 라우트 및 페이지 구성

```text
/
├── architecture           # 건축 전용 히어로, 모노그래프 스포트라이트, 비대칭 그리드
├── travel                 # 여행 파노라마 히어로, 지역 필터, 포토 저널 스트립
├── art                    # 화이트큐브 스포트라이트, 전시 플라크, 큐레이토리얼 노트
├── food                   # 미식 감각 스포트라이트, 테마 필터, 헤리티지 매니페스토
├── stories
│   └── :slug              # 아티클 상세 독서 뷰 (/stories/urban-strorkes 원본 보존, 드롭캡, 공유)
├── gallery                # 4대 카테고리 필터 탭, 반응형 정방형 그리드, 풀스크린 Lightbox
├── search                 # 실시간 쿼리 검색, 카테고리 필터, URL 쿼리 파라미터 양방향 동기화
├── admin
│   ├── login              # scrypt 솔트 해시 및 timingSafeEqual 인증 포털
│   ├── dashboard          # 4대 핵심 지표, 분야별 분포, 큐레이터 감사 추적(Audit Trail)
│   ├── articles           # 아티클 검색/필터, 원본 코어 삭제 방지 보호, CRUD
│   ├── articles/new       # 신규 모노그래프 작성 (자동 슬러그 생성, Demo 플래그)
│   ├── articles/:id/edit  # 모노그래프 수정 (DB 영속 반영)
│   ├── categories         # 4대 영구 분야 잠금 및 메타데이터 뷰어
│   ├── media              # 영구 사진 자산 규격 및 Alt 텍스트 인스펙션
│   └── settings           # 영속 저장소 텔레메트리, 보안 체크리스트
└── *                      # 맞춤형 Cinzel 404 페이지 (홈 및 검색 바로가기)
```

---

## 🔐 보안 및 인증 아키텍처 (M29~M34 Google & Kakao 소셜 로그인 통합)

1. **단방향 암호화**: `crypto.scryptSync` (16바이트 난수 솔트, 64바이트 파생 키).
2. **타이밍 공격 방어**: `crypto.timingSafeEqual` 비교.
3. **세션 보안**: HttpOnly Cookie 및 HMAC-SHA256 서명 JWT (24시간 만료).
4. **CORS & CSP**: 허가된 클라이언트 오리진으로 제한 (`http://localhost:5173`).
5. **소셜 인증 (OAuth 2.0 & GIS)**:
   - **Google Identity Services**: Google 공식 GSI 클라이언트 라이브러리 및 다색 G 로고 버튼 적용. 서버 측 ID Token 서명, 발행자, 만료 검증.
   - **Kakao Login**: 공식 `#FEE500` 배경, 12px 모서리 반경, 공식 말풍선 심볼, 85% 블랙 텍스트 적용. 인가 코드 교환 및 프로필 동기화.
   - **RBAC 보안**: 소셜 로그인 사용자는 기본적으로 일반 독자(`USER`) 권한으로만 생성/로그인되며, 관리자(`ADMIN`) 계정으로의 무단 승격이나 자동 병합이 원천 차단됩니다.
6. **관리자 계정**:
   - Username: `admin`
   - Access Key: `AdminSecurePassword2026!` (또는 개발 환경 `prism-admin-2026!`)

---

## 🛠️ 환경 변수 및 소셜 OAuth 설정 가이드

`.env.example`을 참고하여 `server/.env` 파일을 설정합니다.

```dotenv
# 포트 및 오리진 (로컬: http://localhost:5173 | 배포: https://com-web-x8qu.onrender.com)
PORT=4000
NODE_ENV=development
CLIENT_ORIGIN=https://com-web-x8qu.onrender.com
FRONTEND_ORIGIN=https://com-web-x8qu.onrender.com

# 데이터베이스
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/company_db

# 암호화 시크릿
JWT_SECRET=super_secret_editorial_prism_company_jwt_key_2026
SESSION_SECRET=super_secret_editorial_prism_session_key_2026

# 관리자 기본 계정
ADMIN_USERNAME=admin
ADMIN_PASSWORD=AdminSecurePassword2026!

# Google Identity Services (Google Cloud Console 발급)
# 1. Google Cloud Console > API 및 서비스 > 사용자 인증 정보
# 2. OAuth 2.0 클라이언트 ID (웹 애플리케이션) 생성
# 3. 승인된 자바스크립트 원본: http://localhost:5173 및 https://com-web-x8qu.onrender.com
# 4. 승인된 리디렉션 URI: http://localhost:5173/oauth/callback/google 및 https://com-web-x8qu.onrender.com/oauth/callback/google
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Kakao Developers (Kakao Developers 콘솔 발급)
# 1. Kakao Developers 콘솔 > 내 애플리케이션 생성
# 2. 앱 키 > REST API 키 복사
# 3. 플랫폼 > Web > 사이트 도메인: http://localhost:5173 및 https://com-web-x8qu.onrender.com 등록
# 4. 카카오 로그인 활성화 (ON)
# 5. 카카오 로그인 > Redirect URI 등록: http://localhost:5173/oauth/callback/kakao 및 https://com-web-x8qu.onrender.com/oauth/callback/kakao
# 6. 보안 > Client Secret 발급 및 활성화
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=https://com-web-x8qu.onrender.com/oauth/callback/kakao
```

> **개발 환경 안내**: 외부 OAuth 키(`GOOGLE_CLIENT_ID`, `KAKAO_REST_API_KEY`)가 설정되지 않은 로컬 개발 환경에서도 로그인 화면에서 공식 가이드 팝업 및 '시뮬레이션 로그인' 기능을 통해 백엔드 연동과 계정 프로비저닝 흐름을 100% 테스트할 수 있습니다.

---

## 🧪 자동화 테스트 및 QA 검증

```bash
# 1. 콘텐츠 무결성 단위 테스트 (스냅샷 1:1 비교)
npm run test:unit

# 2. 백엔드 REST API 11개 시나리오 통합 테스트
npm run test:api

# 3. 멀티페이지 10대 라우트, 5대 뷰포트 & Lightbox E2E 자동화 테스트
npm run test:multipage

# 4. 프로덕션 빌드 무결성 검증
npm run build
```

### 테스트 결과 요약:
- Unit Tests: **6/6 PASS**
- Backend API Tests: **11/11 PASS**
- Multi-Page Routes: **10/10 PASS**
- Responsive Viewports (375x812, 768x1024, 1280x800, 1440x900, 1920x1080): **5/5 PASS (0px 가로 스크롤)**
- WCAG 2.2 AA Accessibility (axe-core): **0 Critical Violations**

---

## 📚 상세 기술 문서 (`docs/`)

- [MULTIPAGE_AUDIT.md](docs/MULTIPAGE_AUDIT.md): M8 기술 부채 및 아키텍처 진단 보고서
- [ROUTING_ARCHITECTURE.md](docs/ROUTING_ARCHITECTURE.md): React Router DOM 라우팅 구조 명세
- [SITE_MAP.md](docs/SITE_MAP.md): 전 사이트 URL 맵 및 컴포넌트 매핑
- [PAGE_SPECIFICATIONS.md](docs/PAGE_SPECIFICATIONS.md): 10대 라우트별 상세 화면 명세
- [CATEGORY_CONTENT_STRATEGY.md](docs/CATEGORY_CONTENT_STRATEGY.md): 4대 카테고리 콘텐츠 및 출처 정책
- [NEW_CONTENT_INVENTORY.md](docs/NEW_CONTENT_INVENTORY.md): 원본 및 신규 콘텐츠 전수 조사표
- [MULTIPAGE_UI_UX.md](docs/MULTIPAGE_UI_UX.md): 전역 UI/UX 디자인 시스템 및 그리드 규격
- [ARTICLE_DETAIL_DESIGN.md](docs/ARTICLE_DETAIL_DESIGN.md): 아티클 상세 독서 뷰 및 타이포그래피
- [SEARCH_DESIGN.md](docs/SEARCH_DESIGN.md): 검색 엔진 및 URL 동기화 설계
- [ADMIN_DASHBOARD_DESIGN.md](docs/ADMIN_DASHBOARD_DESIGN.md): 관리자 대시보드 및 인증 설계
- [DATABASE_MIGRATION_PLAN.md](docs/DATABASE_MIGRATION_PLAN.md): DB 마이그레이션 및 이중 영속 엔진
- [BACKEND_EXTENSION.md](docs/BACKEND_EXTENSION.md): Express REST API 확장 명세
- [SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md): 보안 검토 및 암호화 감사 보고서
- [MULTIPAGE_QA_PLAN.md](docs/MULTIPAGE_QA_PLAN.md): 멀티페이지 종합 QA 계획서
- [MULTIPAGE_VISUAL_QA.md](docs/MULTIPAGE_VISUAL_QA.md): 시각 검수 및 스크린샷 보고서
- [M8_M15_DEVELOPMENT_REPORT.md](docs/M8_M15_DEVELOPMENT_REPORT.md): M8~M15 단계별 개발 완료 보고서
- [FINAL_MULTIPAGE_QA_REPORT.md](docs/FINAL_MULTIPAGE_QA_REPORT.md): 최종 종합 QA 인증 보고서

---

## 📄 라이선스 및 저작권

2026 Green Systems Incorporated. All rights reserved.
