# PRISM Editorial Platform: M16 UI/UX 정밀 감사 보고서

## 1. 감사 개요

- **프로젝트 명**: `company` (PRISM Architectural & Editorial Magazine Platform)
- **감사 일시**: 2026-10-20
- **감사 대상 환경**: Node.js v24.16.0 / React 19 / Vite 8 / SCSS / React Router DOM v7 / Express REST API
- **감사 목적**: M0~M15 완료 후 실제 프로덕션 수준의 UI/UX 완성도, 기능 정합성, 웹 접근성(WCAG 2.2 AA), 코드 품질(ESLint) 및 보안 취약점을 정밀 진단하고 우선순위별 개선 계획 수립

---

## 2. 발견된 문제점 및 우선순위 분석 (ISSUE-001 ~ ISSUE-011)

| 이슈 번호 | 결함 영역 | 심각도 | 결함 현황 및 원인 분석 | 영향도 |
|---|---|---|---|---|
| **ISSUE-001** | `Breadcrumb.jsx` | **P1 (High)** | 컴포넌트 내부에서 `Home` 링크를 기본 생성함과 동시에 호출 페이지들(`ArchitecturePage` 등)에서도 `{ label: 'Home', href: '/' }`를 배열로 전달하여 `Home / Home / Architecture`로 2중 중복 렌더링됨. | 사용자 혼선, 사이트 계층 구조 왜곡 |
| **ISSUE-002** | `style.scss` 헤더 선택자 | **P1 (High)** | `header, .site-header` 선택자로 인해 기사 상세 헤더(`.article-header`), 페이지 헤더(`.page-header`), 관리자 탑바 등 모든 시맨틱 `<header>`가 Sticky, backdrop-filter, border-bottom 스타일 오염을 겪음. | 페이지 내부 헤더 레이아웃 왜곡, 포커스 가림 현상 |
| **ISSUE-003** | 카테고리 정렬 파라미터 | **P1 (High)** | UI 드롭다운은 `sort="views"`를 전송하지만, 백엔드 저장소(`content.repository.js`)는 `sort === 'popular'`만 검사하여 Most Read 정렬 선택 시 최신순으로 fallback됨. | 독자 조회수 정렬 불능 |
| **ISSUE-004** | 필터 & 페이지네이션 | **P0 (Critical)** | 서버에서 6개를 페이지네이션한 후 클라이언트에서 태그 필터를 적용하여, 다른 페이지에 존재하는 태그 아티클이 누락되거나 빈 화면이 노출됨. | 콘텐츠 탐색 단절, 페이징 왜곡 |
| **ISSUE-005** | `Pagination.jsx` 클래스 | **P2 (Medium)** | 페이지 번호 버튼에 `pagination-number` 클래스가 부여되어 있으나 SCSS는 `.pagination-btn`만 정의하여 기본 브라우저 버튼 스타일로 노출됨. 터치 타깃 44px 미달. | 모바일 조작성 저하, 디자인 불일치 |
| **ISSUE-006** | API 오류 및 빈 상태 UX | **P1 (High)** | 데이터 fetch 실패 시 단순 콘솔 로깅에 그치고 사용자 재시도(Retry) 버튼 및 스켈레톤 UI가 부재함. 빠른 필터 클릭 시 AbortController 레이스 컨디션 미대응. | 네트워크 지연 시 레이아웃 시프트, 오류 방치 |
| **ISSUE-007** | 모바일 드로어 접근성 | **P1 (High)** | 모바일 메뉴 오픈 시 포커스 트랩 부재, 배경 요소 탭 포커스 침투, 닫기 후 트리거 버튼으로의 포커스 복원 누락, 언마운트 시 body scroll lock 잔여 위험. | 키보드/스크린리더 사용자 조작 불가 |
| **ISSUE-008** | Gallery 접근성 & 모바일 | **P1 (High)** | 이미지 아이템이 `div role="button"`으로 구현되어 네이티브 버튼 동작 미지원. 캡션 정보가 호버에만 의존하여 모바일 터치 및 키보드 포커스 시 제목 식별 불가. | WCAG 2.2 비준수, 모바일 UX 저하 |
| **ISSUE-009** | 상세페이지 링크 UX | **P2 (Medium)** | 메인페이지 Hero 및 카드의 "Read More"가 `href="#"` 및 `preventDefault()`로 모달을 강제하여, 독립 URL(`/stories/urban-strorkes`) 공유 및 우클릭 새 탭 탐색 불가. | 플랫폼 탐색 동선 분절 |
| **ISSUE-010** | 관리자 로그인 보안 | **P0 (Critical)** | 로그인 폼에 관리자 비밀번호가 미리 채워져 있어 보안 취약점 유발. 비밀번호 표시/숨기기 토글 부재, 중복 제출 방지 미비. | 보안 정책 위반, 자격 증명 노출 |
| **ISSUE-011** | ESLint 오류 30개 | **P0 (Critical)** | ESLint 설정에서 Node/Browser 환경 분리 누락, 미사용 변수, Effect 내 동기적 setState, DOM 직접 수정 등 30개 린트 에러 발생. | CI 파이프라인 실패, 렌더링 성능 저하 |

---

## 3. 이미지 사용 현황 및 시각적 다채로움 분석

### 3.1 현재 이미지 사용 매핑표
- `/images/hero.jpg`: `hero-urban-strorkes` (Core Invariant)
- `/images/gallery-1.jpg`: `concrete-cantilevers`, `aegean-dwellings`, `dashi-traditions`
- `/images/gallery-2.jpg`: `suspension-horizons`
- `/images/gallery-3.jpg`: `kyoto-pavilions`, `spatial-dimensions`, `slow-harvest`
- `/images/gallery-4.jpg`: `facade-reflections`, `kinetic-shadows`

### 3.2 진단 결과
- 10개의 아티클이 5개의 베이스라인 이미지를 다중 재사용함에 따라, 특히 `gallery-3.jpg`(각진 파사드)가 Food의 `slow-harvest`(사워도우 빵) 및 Travel의 `kyoto-pavilions`(교토 사찰)에 동시 노출되어 카테고리 고유의 에디토리얼 정체성이 희석됨.
- **개선 방안**:
  - 기존 베이스라인 자산 5개(`/images/hero.jpg`, `/images/gallery-1~4.jpg`)는 100% 영구 보존.
  - 신규 데모 아티클을 위해 각 카테고리의 감성에 부합하는 전용 에디토리얼 이미지 자산(`/images/editorial/...`)을 보강하여 시각적 몰입도 향상.

---

## 4. M17~M21 개선 로드맵

1. **M17 (구조 및 기능 버그 해결)**:
   - Breadcrumb 중복 제거 및 `aria-current="page"` 적용
   - `style.scss`의 `.site-header` 스타일 오염 제거
   - `content.repository.js`에 `tag` 필터 및 `views` 정렬 일원화 구현
   - `Pagination.jsx` 클래스 정합성 및 터치 타깃 44px 확보
   - `AdminLoginPage.jsx` 사전 입력 비밀번호 제거 및 Show/Hide 토글 도입
   - `eslint.config.js` 환경 분리 및 30개 린트 오류 전면 해결
2. **M18 (디자인 시스템 리파인먼트)**:
   - WCAG 2.2 대비율 4.5:1 검증 및 색상 토큰 고도화
   - 타이포그래피 계층 정돈 및 여백 최적화
3. **M19 (전 페이지 UI/UX 고도화)**:
   - 10개 전 페이지의 로딩 스켈레톤, 재시도(Retry) UI, 모바일 반응형 뷰 정밀 개선
4. **M20 (브라우저 검수 및 E2E 자동화)**:
   - Playwright 기반 8대 해상도 검증 및 가로 스크롤 0px 확인
5. **M21 (최종 마감 및 안정화)**:
   - 무결성 검증, 최종 빌드, 완성 보고서 발행
