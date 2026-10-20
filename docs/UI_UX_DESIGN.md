# UI/UX 상세 디자인 및 인터랙션 명세서 (UI_UX_DESIGN.md)

프로젝트: `company` (PRISM)  
콘셉트: **High-End Architectural Editorial Web Experience**

---

## 1. UX 목표 및 원칙

1. **원작 보존의 미학**: 원본의 모든 텍스트, 브랜드, 이미지를 단 1자도 왜곡하지 않고, 이를 가장 돋보이게 하는 최고급 건축 매거진 스타일의 프레임을 제공한다.
2. **부드럽고 직관적인 인터랙션**: 페이지 전환, 모달 오픈, 호버 피드백 모두 하드한 전환 대신 0.25~0.35초의 부드러운 cubic-bezier 감속 곡선을 적용한다.
3. **완벽한 반응형 흐름**: 320px의 좁은 모바일 화면부터 2560px 이상의 대형 울트라와이드 모니터까지 글자 깨짐이나 가로 스크롤 없이 유려하게 흐르도록 레이아웃을 구성한다.
4. **키보드 및 스크린리더 포용성**: 마우스 없이 Tab, Shift+Tab, Enter, Space, Escape, 좌우 방향키만으로 100% 탐색 및 제어가 가능해야 한다.

---

## 2. 반응형 뷰포트 설계

### 2.1 Viewport 375 × 812 (Mobile Portrait)
- **Header**: 로고 좌측, 우측에 접근성 높은 햄버거 토글 버튼(48×48px 터치 영역).
- **Navigation**: 풀스크린 슬라이드 드로어 메뉴, 탭 인덱스 제어 및 배경 스크롤 락.
- **Hero**: 타이틀 크기 36px, 버튼 탭 크기 48px, 상하 패딩 40px/60px로 컴팩트하게 밀도 유지.
- **Content Cards**: 1열 수직 스택, 카드 간 간격 16px.
- **Gallery**: 2열 그리드(모바일 터치 시 가시성 우수) 또는 1열 스택.
- **Footer**: 중앙 정렬, 폰트 13px, 적정 줄간격.

### 2.2 Viewport 768 × 1024 (Tablet Portrait)
- **Header**: 로고 중앙 상단 또는 좌측, 네비게이션 가로 인라인 배치.
- **Hero**: 타이틀 크기 48px, 여백 60px/80px.
- **Content Cards**: 2열 나란히 배치 (`grid-template-columns: 1fr 1fr`).
- **Gallery**: 2열 그리드 (`grid-template-columns: repeat(2, 1fr)`), 갭 16px.
- **Footer**: 여백 24px, 단정한 디바이더.

### 2.3 Viewport 1280 × 800 & 1440 × 900 (Desktop)
- **Header**: 좌측 로고, 우측 가로 메뉴, Sticky 글래스모피즘 바.
- **Hero**: 풀와이드 컨테이너, 와이드 이미지 커버리지, 타이틀 56~64px.
- **Content Cards**: 2열 대칭 그리드, 넉넉한 40px 내부 패딩.
- **Gallery**: 4열 수평 파노라마 그리드 (`grid-template-columns: repeat(4, 1fr)`), 균등한 1:1 정방형 비율.
- **Footer**: 절제된 미니멀 레이아웃.

---

## 3. 세부 인터랙션 및 상태(State) 설계

### 3.1 버튼 및 링크 인터랙션
- **Rest**: 1.5px 반투명 보더, 라운드 필(Pill) 형태 (`border-radius: 9999px`), 부드러운 텍스트.
- **Hover**: 배경색 채움(Background Fill), 텍스트 색상 반전, `transform: translateY(-2px)`.
- **Active**: `transform: translateY(0px) scale(0.98)`.
- **Focus-Visible**: 3px의 선명한 골드(`--color-accent-champagne`) 아웃라인, 오프셋 2px.

### 3.2 갤러리 줌 & Lightbox 모달
1. **마우스 호버**:
   - 이미지가 `scale(1.04)`로 부드럽게 확대.
   - 은은한 오버레이와 돋보기/확대 아이콘 페이드인.
2. **클릭 및 엔터 키 액션**:
   - Lightbox 모달 활성화.
   - 이전/다음 이미지 탐색 화살표 버튼 제공.
   - 키보드 왼쪽/오른쪽 화살표로 이전/다음 사진 이동.
   - Escape 키 또는 바깥 영역 클릭 시 모달 닫힘.
   - 모달이 열리면 `body` 스크롤 고정(`overflow: hidden`), 닫히면 포커스가 클릭했던 이미지로 복귀.

### 3.3 Hero 'Read More' & Card 'Read More' 상세 모달
- 기존 사이트에서는 'Read More'가 `#` 또는 빈 문자열로 연결되어 있어 동작하지 않았음.
- **UX 개선**:
  - 임의의 외부 페이지를 만들지 않고, 해당 섹션의 실제 데이터(예: `Urban Strorkes` 포토그래퍼 Sebastian Weiss의 큐레이션 노트 및 원본 아티클 개요)를 보여주는 깔끔한 인-페이지 뷰어 모달 제공.
  - 닫기 버튼 및 ESC 키 지원.

### 3.4 Reduced Motion 지원
사용자가 OS에서 동작 줄이기(`prefers-reduced-motion: reduce`)를 설정한 경우:
- 모든 `transform`, 확대 애니메이션 비활성화.
- `transition-duration: 0.01ms`로 전환하여 즉각적인 화면 렌더링 보장.

---

## 4. 접근성(A11y) 보증 전략

1. **Heading 순서 교정**:
   - Hero 영역 시맨틱 구조:
     - `<span className="hero-badge">Editor's Choice</span>`
     - `<p className="hero-author">Sebastian Weiss</p>`
     - `<h1 className="hero-title">Urban Strorkes</h1>`
   - 스크린리더가 페이지의 메인 주제(`<h1>`)를 최상위로 인식하도록 지원.
2. **대체 텍스트(alt text)**:
   - `gallery-1.jpg`: "Spiral architectural concrete staircase design"
   - `gallery-2.jpg`: "Suspension cables of the Brooklyn Bridge perspective view"
   - `gallery-3.jpg`: "Geometric angular modern building roof structure"
   - `gallery-4.jpg`: "Curved modern skyscraper facade with window grid pattern"
   - `logo.png`: "PRISM"
3. **색상 대비 준수**:
   - 모든 텍스트와 배경의 명도 대비 비율 4.5:1 이상(대형 텍스트 3:1 이상) 달성.
