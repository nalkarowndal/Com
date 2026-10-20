# company (PRISM) — High-End Architectural Editorial & Full-Stack Platform

> **PRISM Architectural & Editorial Magazine Platform**  
> React 19 + Vite 8 프론트엔드와 Node.js 24 + Express REST API 백엔드를 결합한 최고급 에디토리얼 포트폴리오 웹사이트입니다.

---

## 🏛️ 프로젝트 핵심 원칙: 콘텐츠 100% 불변 보존

본 프로젝트는 기존 `company` 프로젝트에 존재하던 모든 콘텐츠, 브랜드 로고, 이미지 자산, 고유 철자(`Urban Strorkes`, `Inspring Reads`), 및 저작권 표기를 단 1글자도 왜곡하거나 삭제하지 않고 완전히 보존한 상태에서 UI/UX와 백엔드 아키텍처를 엔터프라이즈 수준으로 전면 고도화하였습니다.

- **프로젝트 명**: `company`
- **브랜드 로고**: `PRISM` (`/images/logo.png`)
- **오리지널 콘텐츠**:
  - Hero: `Editor's Choice`, `Sebastian Weiss`, `Urban Strorkes`, `Read More`, `hero.jpg`
  - Cards: `Inspring Reads` (Tan Box), `Reflections` (Dark Box), 원본 설명문 및 버튼
  - Gallery: `gallery-1.jpg`, `gallery-2.jpg`, `gallery-3.jpg`, `gallery-4.jpg`
  - Footer: `2026 Green Systems Incorporated. All rights reserved.`
  - 자동화 스냅샷 검증: `tests/snapshots/contentSnapshot.json`

---

## ✨ 주요 고도화 및 신규 기능

1. **프리미엄 에디토리얼 디자인 시스템**:
   - 웜 아이보리(`#F7F5F0`) 배경, 다크 차콜(`#25262B`), 샴페인 골드(`#B49A70`) 조화
   - Google Fonts (`Plus Jakarta Sans` & `Cinzel`) 기반 유동 폰트 크기(`clamp()`)
   - CSS Grid & Flexbox 기반 모던 레이아웃 (기존 Float 그리드 완전 대체)
2. **반응형 4대 뷰포트 지원**:
   - 375×812 (모바일), 768×1024 (태블릿), 1280×800 (데스크톱), 1440×900 (와이드)
   - 전 해상도 가로 스크롤(Horizontal Overflow) `0px`
3. **리치 인터랙션 & 접근성 (WCAG 2.2 AA 준수)**:
   - Sticky 글래스모피즘 헤더 & 모바일 슬라이드 드로어 내비게이션
   - Hero 및 콘텐츠 카드 상세 모달 뷰어
   - 키보드 방향키 및 ESC 닫기를 지원하는 풀스크린 갤러리 Lightbox 모달
   - axe-core 자동화 접근성 검사 위반 0건 달성
4. **Node.js 24 + Express REST API 백엔드**:
   - `GET /api/health`, `/api/site`, `/api/home`, `/api/categories`, `/api/articles`, `/api/gallery`
   - PostgreSQL 지원 및 자동 내장 영속 파일 데이터베이스 폴백
   - Helmet 보안 헤더, CORS, Rate Limiting, 구조화된 로깅
5. **관리자(Admin) 콘텐츠 관리 시스템**:
   - JWT / HttpOnly 쿠키 기반 안전한 관리자 인증
   - 실시간 콘텐츠 조회, 편집, 감사 로그(Audit Log) 자동 기록

---

## 📁 디렉터리 구조

```text
company/
├── public/
│   ├── favicon.svg             # 파비콘
│   ├── icons.svg               # SVG 스프라이트
│   └── images/                 # 원본 이미지 자산 (hero.jpg, gallery-1~4.jpg, logo.png)
├── src/
│   ├── assets/scss/            # 디자인 토큰 및 모던 SCSS 모듈
│   ├── components/             # Header, Hero, Cards, Gallery, Lightbox, Modals
│   ├── hooks/                  # useHomeContent 등 커스텀 훅
│   ├── services/               # REST API 클라이언트
│   ├── data/                   # 베이스라인 콘텐츠 기본값
│   ├── App.jsx                 # 메인 애플리케이션
│   └── main.jsx
├── server/                     # Node.js 24 + Express REST API
│   ├── src/                    # app, server, config, routes, controllers, services, repositories
│   ├── db/                     # PostgreSQL 마이그레이션 및 초기 시드
│   └── package.json
├── tests/
│   ├── unit/                   # 콘텐츠 무결성 자동 비교 단위 테스트
│   ├── e2e/                    # Playwright 4대 뷰포트 & axe-core E2E 테스트
│   └── snapshots/              # 베이스라인 콘텐츠 JSON 스냅샷
├── docs/                       # 전체 아키텍처 및 QA 보고서 (14종)
├── package.json
└── vite.config.js
```

---

## 🚀 빠른 시작 (Quick Start)

### 1. 패키지 설치
```bash
# 프론트엔드 및 루트 도구 설치
npm install

# 백엔드 서버 의존성 설치
cd server && npm install && cd ..
```

### 2. 로컬 실행
```bash
# 터미널 1: 백엔드 API 서버 실행 (포트 4000)
npm run server

# 터미널 2: 프론트엔드 개발 서버 실행 (포트 5173)
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

---

## 🧪 테스트 실행

```bash
# 1. 콘텐츠 무결성 단위 테스트 (스냅샷 1:1 비교 검증)
npm run test:unit

# 2. 백엔드 REST API 통합 테스트
npm run test:api

# 3. Playwright 4대 뷰포트 & axe-core 접근성 E2E 테스트
npm run test:e2e
```

---

## 📚 상세 문서 목록 (`docs/`)

- [PROJECT_AUDIT.md](docs/PROJECT_AUDIT.md): 프로젝트 정밀 감사 보고서
- [CONTENT_INVENTORY.md](docs/CONTENT_INVENTORY.md): 콘텐츠 전수 조사표
- [CONTENT_PRESERVATION_REPORT.md](docs/CONTENT_PRESERVATION_REPORT.md): 콘텐츠 무결성 보존 보고서
- [UI_UX_DESIGN.md](docs/UI_UX_DESIGN.md): UI/UX 상세 디자인 및 인터랙션 명세서
- [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md): PRISM 디자인 시스템 명세서
- [FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md): 프론트엔드 아키텍처 명세서
- [BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md): 백엔드 아키텍처 명세서
- [DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md): 데이터베이스 설계 및 스키마 명세서
- [API_SPEC.md](docs/API_SPEC.md): REST API 명세서
- [DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md): 개발 단계 및 마일스톤 계획서
- [QA_PLAN.md](docs/QA_PLAN.md): 종합 품질 보증 및 테스트 계획서
- [VISUAL_QA_REPORT.md](docs/VISUAL_QA_REPORT.md): 시각 검수 및 반응형 QA 보고서
- [FINAL_QA_REPORT.md](docs/FINAL_QA_REPORT.md): 최종 종합 품질 검증 보고서
- [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md): 배포 및 운영 가이드라인

---

## 📄 라이선스 및 저작권

2026 Green Systems Incorporated. All rights reserved.
