# 프론트엔드 아키텍처 명세서 (FRONTEND_ARCHITECTURE.md)

프로젝트: `company` (PRISM)  
핵심 프레임워크: React 19.x + Vite 8.x + Sass/CSS Custom Properties

---

## 1. 아키텍처 개요 및 설계 원칙

1. **표현 계층과 데이터 계층의 분리**:
   - 컴포넌트는 오직 화면 렌더링과 사용자 인터랙션만을 담당.
   - 데이터 페칭, 캐싱, 상태 관리는 독립된 서비스(`src/services/`)와 커스텀 훅(`src/hooks/`)으로 캡슐화.
2. **콘텐츠 불변성 보장 (Content Immutability)**:
   - 서버 API 또는 로컬 데이터 소스 모두 베이스라인 스냅샷(`contentSnapshot.json`)의 무결성을 엄격히 준수.
3. **무결점 폴백(Resilient Fallback)**:
   - 백엔드 서버가 구동 중이지 않더라도 프론트엔드는 베이스라인 로컬 정적 데이터를 통해 100% 정상 화면을 렌더링할 수 있는 오프라인/개발 복원력 보유.

---

## 2. 디렉터리 구조

```text
src/
├── assets/
│   ├── scss/
│   │   ├── _variables.scss     # 디자인 토큰, 색상, 간격
│   │   ├── _typography.scss    # 폰트, 헤딩, 유동 폰트 크기
│   │   ├── _mixins.scss        # 반응형 미디어 쿼리, 플렉스/그리드 유틸
│   │   ├── _reset.scss         # 모던 CSS 리셋
│   │   └── style.scss          # 통합 SCSS 엔트리포인트
│   ├── hero.png                # 기존 자산 보존
│   ├── react.svg               # 기존 자산 보존
│   └── vite.svg                # 기존 자산 보존
├── components/
│   ├── common/
│   │   ├── Button.jsx          # 범용 접근성 버튼
│   │   ├── Modal.jsx           # 키보드 ESC 및 포커스 트랩 모달
│   │   ├── LoadingSkeleton.jsx # 로딩 플레이스홀더
│   │   └── ErrorNotice.jsx     # 에러 피드백 UI
│   ├── layout/
│   │   ├── Header.jsx          # 데스크톱/모바일 반응형 네비게이션 헤더
│   │   ├── MobileNav.jsx       # 모바일 햄버거 드로어 메뉴
│   │   └── Footer.jsx          # 저작권 및 푸터 문구 컴포넌트
│   ├── hero/
│   │   └── HeroSection.jsx     # 히어로 배너, 작가, 타이틀, 버튼
│   ├── content/
│   │   ├── FeaturedSection.jsx # 추천 콘텐츠 그리드 컨테이너
│   │   └── ContentCard.jsx     # Tan / Dark 카드 개별 렌더러
│   ├── gallery/
│   │   ├── GalleryGrid.jsx     # 4열 반응형 갤러리 그리드
│   │   ├── GalleryItem.jsx     # 개별 갤러리 이미지 카드
│   │   └── Lightbox.jsx        # 전체화면 이미지 라이트박스 뷰어
│   └── admin/
│       └── AdminPanel.jsx      # 관리자 로그인 및 콘텐츠 관리 대시보드
├── hooks/
│   ├── useHomeContent.js       # 홈 콘텐츠 API/로컬 페칭 훅
│   ├── useLightbox.js          # 라이트박스 인덱스 및 키보드 이벤트 훅
│   └── useMediaQuery.js        # 반응형 화면 크기 감지 훅
├── services/
│   └── api.js                  # Axios/Fetch 기반 백엔드 REST API 클라이언트
├── data/
│   └── defaultContent.js       # 베이스라인 콘텐츠 기본값 (스냅샷 미러)
├── App.jsx                     # 메인 애플리케이션 컴포넌트
└── main.jsx                    # 리액트 루트 마운트
```

---

## 3. 상태 관리 (State Management)

- **UI 로컬 상태**:
  - `activeLightboxIndex`: 열린 이미지의 인덱스 (`null` 또는 `0~3`)
  - `isMobileNavOpen`: 모바일 메뉴 열림/닫힘 (`boolean`)
  - `activeModal`: Hero/Card Read More 모달 활성 상태
- **서버 데이터 상태 (`useHomeContent`)**:
  - `data`: 헤더, 히어로, 카드, 갤러리, 푸터 전체 데이터
  - `isLoading`: 초기 데이터 로드 중 여부
  - `isError`: API 장애 여부
  - `source`: `'api'` 또는 `'fallback'` (투명한 데이터 출처 표시)

---

## 4. 접근성 및 키보드 내비게이션 아키텍처

- **포커스 트랩 (Focus Trap)**: 모바일 드로어 및 Lightbox 모달 오픈 시 포커스가 모달 내부에서만 순환하도록 제어.
- **ARIA 속성 체계**:
  - 헤더 토글: `aria-expanded={isOpen}`, `aria-controls="mobile-nav"`, `aria-label="Toggle navigation menu"`
  - 모달: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"`
  - 갤러리 썸네일: `role="button"`, `tabIndex="0"`, `aria-label="View larger image ..."`
- **키보드 이벤트 바인딩**:
  - `Escape`: 활성화된 모든 모달 및 드로어 즉시 닫기
  - `ArrowLeft` / `ArrowRight`: 라이트박스 이전/다음 이미지 순환 이동
