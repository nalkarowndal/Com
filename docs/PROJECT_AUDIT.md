# Company (PRISM) 프로젝트 정밀 감사 보고서 (PROJECT_AUDIT.md)

작성일시: 2026-10-20
대상 프로젝트: `company` (PRISM 브랜드 웹사이트)
검사 도구: Node.js 24.16.0, Vite 8.0.16, ESLint 10.3.0, Browser Subagent (Chromium)

---

## 1. 개요 및 프로젝트 기본 현황

- **프로젝트 명**: `company` (유지 필수)
- **브랜드 로고**: `PRISM` (`public/images/logo.png` - 골드 기하학 프리즘 심볼 + 텍스트)
- **현재 기술 스택**:
  - React 19.2.6
  - Vite 8.0.12 (설치된 버전 8.0.16)
  - Sass (Dart Sass 1.101.0)
  - ESLint 10.3.0 (flat config)
- **실행 환경**: Windows 11, Node.js v24.16.0 LTS

---

## 2. 컴포넌트 구성 분석

### 기존 컴포넌트 트리
```text
src/
├── main.jsx (StrictMode, style.scss import, createRoot)
├── App.jsx (Header, Hero row, Info boxes row, Gallery row, Footer)
└── include/
    ├── Header.jsx (div.row, logo.png, nav.style-nav > ul > 4 li items)
    └── Footer.jsx (footer > div.row > col > 2 x p.footer-text)
```

### 컴포넌트별 세부 분석
1. **`main.jsx`**:
   - `createRoot` 및 `StrictMode` 사용
   - 전역 스타일 `src/assets/scss/style.scss` 직접 임포트
2. **`Header.jsx`**:
   - `Header` 함수형 컴포넌트
   - 불필요한 빈 프래그먼트 `<></>` 래핑 존재
   - 로고 이미지 경로가 `images/logo.png`로 상대 경로 지정됨 (루트 기준 `/images/logo.png`로 수정 필요)
   - 네비게이션 항목: `Architecture`, `Travel`, `Art`, `Food` 4개 링크 모두 `href="#"`로 더미 처리
   - 모바일 네비게이션 버튼(햄버거 메뉴) 및 접근성 속성(`aria-label`, `aria-expanded` 등) 전무
3. **`App.jsx`**:
   - 단일 파일 내에 Hero, Info Boxes, Gallery가 모두 하드코딩되어 있음
   - 클래스명 체계가 부트스트랩 유사 float 그리드 (`row`, `col`, `col-md-one-half`, `col-lg-one-fourth`)
   - `a.button`의 링크가 `#` 또는 빈 문자열 `""`
   - 갤러리 이미지 4개(`images/gallery-1.jpg` ~ `4.jpg`)의 `alt` 속성이 모두 빈 문자열 `alt=""`
   - 시맨틱 마크업(`section`, `figure`, `article`) 부재 (단순 `div` 중첩)
4. **`Footer.jsx`**:
   - 불필요한 프래그먼트 `<></>` 래핑
   - 저작권 문구: `2026 Green Systems Incorporated. All rights reserved.`
   - 부가 설명: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, necessitatibus!`
   - 링크나 부가 정보 없는 단순 텍스트 구성

---

## 3. 콘텐츠 및 표시 순서 분석

전체 페이지의 표시 순서는 다음과 같으며, 이는 **반드시 100% 동일하게 보존**되어야 합니다:

1. **Header**:
   - 브랜드 로고: `PRISM` (이미지 `logo.png`)
   - 네비게이션 메뉴 (4개): `Architecture` → `Travel` → `Art` → `Food`
2. **Hero Section**:
   - 배지/소분류: `Editor's Choice`
   - 작가/아티스트: `Sebastian Weiss`
   - 메인 타이틀: `Urban Strorkes` (※ 원본 철자 'Strorkes' 그대로 보존)
   - 액션 버튼: `Read More`
   - 배경 이미지: `public/images/hero.jpg`
3. **Featured Content Section (Cards)**:
   - 카드 1 (Tan/Gold):
     - 제목: `Inspring Reads` (※ 원본 철자 'Inspring' 그대로 보존)
     - 본문: `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus`
     - 버튼: `Read More`
   - 카드 2 (Dark Charcoal):
     - 제목: `Reflections`
     - 본문: `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus`
     - 버튼: `Read More`
4. **Gallery Section**:
   - 갤러리 이미지 1: `gallery-1.jpg` (곡면 콘크리트 나선형 계단)
   - 갤러리 이미지 2: `gallery-2.jpg` (브루클린 브리지 서스펜션 원근 뷰)
   - 갤러리 이미지 3: `gallery-3.jpg` (각진 현대식 건축 파사드 기하학)
   - 갤러리 이미지 4: `gallery-4.jpg` (곡면 고층빌딩 외벽 그리드 패턴)
5. **Footer**:
   - 저작권: `2026 Green Systems Incorporated. All rights reserved.`
   - 설명 문구: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, necessitatibus!`

---

## 4. 기존 스타일링 및 반응형 처리 분석

### 스타일 아키텍처
- `style.scss`에서 `@import "reset"`, `@import "pad"`, `@import "pc"` 호출.
- **Sass @import 경고**: Dart Sass 3.0에서 폐지 예정인 `@import` 문법 사용으로 빌드 시 3건의 `DEPRECATION WARNING` 발생. 현대적인 `@use` 또는 CSS 모듈/Custom Properties 체계로 마이그레이션 필요.
- **Float 기반 그리드**:
  - `.row:before, .row:after { content:""; display:table; } .row:after { clear:both; }`
  - `.col { width: 100%; }`
  - 태블릿 (`@media (min-width: 768px)`): `.col { float: left; } .col-md-one-half { width: 50%; }`
  - 데스크톱 (`@media (min-width: 1024px)`): `.col-lg-one-fourth { width: 25%; }`
- **배경색 및 시각적 부조화**:
  - `body { background: #e6f4f8; }` (연한 청록색 하늘색 계열)이 적용되어 있어, 헤더/카드/건축 사진의 샴페인 골드 및 다크 차콜 톤과 부조화를 이룸.
  - 여백 및 패딩이 하드코딩되어 반응형 일관성이 부족함.
  - 버튼 호버/포커스 스타일이 없으며 시각적 피드백 부재.
- **주요 미디어 쿼리 중단점**:
  - 태블릿: `min-width: 768px` (최대 폭 `778px`)
  - 데스크톱: `min-width: 1024px` (최대 폭 `1200px`)
  - 1440px 이상 대형 모니터에 대한 정밀한 컨테이너 제약 부재

---

## 5. 이미지 자산 및 경로 분석

| 파일명 | 실제 저장 위치 | 기존 참조 경로 | 상태 및 문제점 |
|---|---|---|---|
| `logo.png` | `public/images/logo.png` (3.7KB) | `images/logo.png` | 상대 경로 사용. 루트 슬래시 `/images/logo.png` 필요 |
| `hero.jpg` | `public/images/hero.jpg` (162KB) | `images/hero.jpg` (SCSS) | SCSS 빌드 시 `didn't resolve at build time` 경고 발생. `/images/hero.jpg` 필요 |
| `gallery-1.jpg` | `public/images/gallery-1.jpg` (730KB) | `images/gallery-1.jpg` | `alt=""` 비어 있음, 용량 큼, 레이아웃 쉬프트(CLS) 유발 |
| `gallery-2.jpg` | `public/images/gallery-2.jpg` (1.2MB) | `images/gallery-2.jpg` | 1.2MB 고용량, 이미지 압축/최적화 필요 |
| `gallery-3.jpg` | `public/images/gallery-3.jpg` (719KB) | `images/gallery-3.jpg` | 719KB, 이미지 압축/최적화 필요 |
| `gallery-4.jpg` | `public/images/gallery-4.jpg` (656KB) | `images/gallery-4.jpg` | 656KB, 이미지 압축/최적화 필요 |
| `hero.png` | `src/assets/hero.png` (13KB) | 미사용 | 기존 미사용 자산 (보존) |
| `favicon.svg` | `public/favicon.svg` (9.5KB) | `/favicon.svg` | HTML 링크 정상 |
| `icons.svg` | `public/icons.svg` (5.0KB) | 미사용 스프라이트 | 기존 파일 보존 |

---

## 6. 접근성(A11y) 진단 (WCAG 2.2 AA 기준)

1. **Heading 계층 구조 오류**:
   - Hero 영역: `<h3>Editor's Choice</h3>` → `<h4>Sebastian Weiss</h4>` → `<h1>Urban Strorkes</h1>` 순서로 역전되어 스크린리더 논리 구조 위반.
   - 본문 영역: 카드들이 `<h2>Inspring Reads</h2>`, `<h2>Reflections</h2>`로 구성됨.
2. **이미지 대체 텍스트(alt text) 결여**:
   - 갤러리 이미지 4개 모두 `alt=""`로 장식용 이미지 처리되어 있어 시각장애인이 내용을 알 수 없음.
   - 로고 `alt="Logo"`는 브랜드명 식별 불가 (`alt="PRISM"` 필요).
3. **키보드 접근성 및 Focus Indicator 부재**:
   - 버튼(`a.button`)에 `:focus-visible` 아웃라인 스타일 미정의.
   - 탭 이동 시 현재 포커스 위치 파악 불가.
4. **모바일 네비게이션 접근성 부재**:
   - 화면 폭이 좁아지면 메뉴가 단순 세로로 나열되며 토글 버튼이나 드로어 메뉴가 없음.
5. **터치 타깃 크기**:
   - 푸터 텍스트 및 모바일 메뉴 링크의 터치 영역이 WCAG 권장(최소 44×44px)에 미달.
6. **색상 대비(Color Contrast)**:
   - 본문 흰색 텍스트와 `.info-box-tan` (#b9a88e) 간의 대비 비율은 약 2.6:1로 일반 텍스트 기준(4.5:1) 미달. 카드 텍스트의 가독성 및 명도 튜닝 필요.

---

## 7. 빌드 및 잠재적 런타임 오류 진단

1. **초기 node_modules 부재**:
   - 초기 체크아웃 상태에서 `npm install`이 실행되지 않은 상태였음 (해결 완료).
2. **Sass 빌드 경고**:
   - `@import` 구문 사용으로 Dart Sass 경고 발생.
3. **배경 이미지 경로 미해결 경고**:
   - SCSS 내 `url(images/hero.jpg)`가 빌드 타임에 Vite 리졸버에서 경고 발생.
4. **Windows PowerShell 스크립트 실행 정책**:
   - `npm.ps1` 실행 차단 이슈로 `npm.cmd` 또는 cmd 래핑 필요.

---

## 8. 반드시 보존해야 하는 핵심 기능 및 규칙

- **브랜드/프로젝트명**: `company` 및 `PRISM` 유지.
- **모든 텍스트의 무단 수정 금지**: `Urban Strorkes`, `Inspring Reads` 등 특이 철자 및 Lorem ipsum 보존.
- **이미지 교체 금지**: 기존 `hero.jpg` 및 `gallery-1.jpg` ~ `4.jpg` 원본 유지.
- **새로운 가상 콘텐츠 임의 생성 금지**: 존재하지 않는 글, 직원 소개, 연락처 등을 지어내지 않음.
- **콘텐츠 스냅샷 기반의 회귀 테스트 구축 필수**.

---

## 9. 감사 결론 및 개선 로드맵

현재 사이트는 HTML/CSS 기본 학습 단계의 단순한 정적 마크업에 머물러 있습니다.
M1부터 M7까지 단계별로:
- CSS Grid/Flexbox 및 정밀한 반응형 레이아웃 구현
- SCSS 최신 표준 모듈화 및 CSS Custom Properties 토큰 시스템 도입
- 접근성(WCAG 2.2 AA) 완벽 충족
- Lightbox 모달, 모바일 드로어 메뉴, 키보드 제어 등 풍부한 인터랙션 구현
- Node.js 24 + Express REST API 및 데이터베이스 계층 구축
- 관리자(Admin) 콘텐츠 관리 기능 분리 구축
- Playwright E2E, 시각 회귀 검사, axe-core 테스트 완비
로 성공적인 엔터프라이즈급 포트폴리오를 완성합니다.
