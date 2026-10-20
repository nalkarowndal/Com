# PRISM 디자인 시스템 명세서 (DESIGN_SYSTEM.md)

브랜드: **PRISM** (프로젝트: `company`)  
디자인 콘셉트: **High-End Architectural Editorial & Minimalist Portfolio**  
적용 표준: WCAG 2.2 Level AA 준수, Mobile-First 반응형

---

## 1. 디자인 철학 및 비주얼 아이덴티티

- **Editorial Precision**: 정밀한 여백, 섬세한 타이포그래피 계층, 건축 도면과 예술 잡지(Editorial Magazine)의 격조 높은 시각 구조.
- **Architectural Minimalism**: 불필요한 장식을 배제하고 기하학적 형태와 질감, 음영, 황금비율 레이아웃에 집중.
- **Subtle Modern Interaction**: 과도하지 않은 부드러운 전환(Smooth Transitions), 반응형 인터랙션, 모바일 친화적 터치 피드백.

---

## 2. 디자인 토큰 (Design Tokens)

### 2.1 컬러 팔레트 (Color Palette)

| 토큰명 | CSS 변수 | HEX 코드 | 용도 및 접근성 기준 |
|---|---|---|---|
| **Primary Charcoal** | `--color-primary-charcoal` | `#25262B` | 메인 텍스트, 딥 다크 배경 요소, 고대비 헤딩 |
| **Background Ivory** | `--color-bg-ivory` | `#F7F5F0` | 메인 페이지 배경 (연한 웜 아이보리로 고급스러운 지면 질감 제공) |
| **Accent Champagne** | `--color-accent-champagne` | `#B49A70` | 브랜드 골드/샴페인 포인트, 활성 메뉴 인디케이터, 테두리 강조 |
| **Pure White** | `--color-white` | `#FFFFFF` | 카드 배경, 버튼 텍스트, 모달 서피스 |
| **Text Primary** | `--color-text-primary` | `#25262B` | 본문 기본 텍스트 (아이보리 배경 기준 대비 11.8:1, AAA 통과) |
| **Text Secondary** | `--color-text-secondary` | `#5A5E67` | 부가 설명, 메타 정보 (아이보리 배경 기준 대비 5.8:1, AA 통과) |
| **Card Tan (Original)** | `--color-card-tan` | `#B9A88E` | Inspring Reads 카드 원본 색상 보존 (내부 텍스트 대비 최적화) |
| **Card Tan Darkened** | `--color-card-tan-dark` | `#96846B` | 고대비 텍스트 배경용 최적화 쉐이드 |
| **Card Dark (Original)** | `--color-card-dark` | `#2D2D35` | Reflections 카드 원본 색상 보존 |
| **Surface Dark Alt** | `--color-surface-dark` | `#1E1F24` | 딥 다크 모달, 히어로 오버레이 그라데이션 |
| **Border Subtle** | `--color-border-subtle` | `rgba(37, 38, 43, 0.12)` | 정갈한 디바이더, 미세 경계선 |
| **Focus Ring** | `--color-focus-ring` | `#B49A70` | 키보드 내비게이션 아웃라인 (3px solid, offset 2px) |

### 2.2 타이포그래피 (Typography)

- **Primary Sans-Serif**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - 세련되고 가독성이 우수한 기하학적 산세리프
- **Display Accent / Serif**: `'Cinzel', 'Playfair Display', Georgia, serif` (히어로 및 헤딩 포인트에 절제된 사용)

#### 스케일 (Fluid Clamp 기반)
- **Display Hero H1**: `clamp(2.5rem, 6vw + 1rem, 4.5rem)` (40px ~ 72px)
  - `font-weight: 300`, `letter-spacing: 0.08em`, `text-transform: uppercase`
- **Section Heading H2**: `clamp(1.75rem, 3vw + 0.5rem, 2.5rem)` (28px ~ 40px)
  - `font-weight: 300`, `letter-spacing: 0.06em`, `text-transform: uppercase`
- **Badge / Category H3**: `clamp(0.85rem, 1vw + 0.5rem, 1rem)` (14px ~ 16px)
  - `font-weight: 500`, `letter-spacing: 0.15em`, `text-transform: uppercase`
- **Subheading / Author H4**: `clamp(1rem, 1.2vw + 0.5rem, 1.25rem)` (16px ~ 20px)
  - `font-weight: 400`, `letter-spacing: 0.04em`
- **Body Text**: `clamp(0.95rem, 0.8vw + 0.6rem, 1.05rem)` (15px ~ 17px)
  - `font-weight: 400`, `line-height: 1.7`
- **Caption / Meta**: `0.8125rem` (13px)
  - `font-weight: 400`, `letter-spacing: 0.02em`

### 2.3 간격 시스템 (Spacing Scale)

| 단위명 | 크기 | 용도 |
|---|---|---|
| `space-1` | 4px (0.25rem) | 마이크로 갭, 뱃지 패딩 |
| `space-2` | 8px (0.5rem) | 인라인 아이콘 간격, 작은 버튼 여백 |
| `space-3` | 12px (0.75rem) | 텍스트 요소 간 최소 여백 |
| `space-4` | 16px (1rem) | 기본 패딩, 카드 내부 그리드 갭 |
| `space-6` | 24px (1.5rem) | 일반 컴포넌트 패딩, 모바일 섹션 갭 |
| `space-8` | 32px (2rem) | 헤더 패딩, 카드 패딩 |
| `space-12` | 48px (3rem) | 섹션 상하 여백 (태블릿) |
| `space-16` | 64px (4rem) | 섹션 상하 여백 (데스크톱) |
| `space-24` | 96px (6rem) | 주요 랜드마크 구분 여백 |

### 2.4 컨테이너 및 브레이크포인트 (Layout & Breakpoints)

- **Max Content Width**: `1360px` (좌우 패딩 `clamp(16px, 4vw, 48px)`)
- **Breakpoints**:
  - `Mobile Small`: `< 375px`
  - `Mobile`: `375px ~ 767px`
  - `Tablet`: `768px ~ 1023px`
  - `Desktop`: `1024px ~ 1399px`
  - `Desktop Wide`: `>= 1400px`

### 2.5 섀도우 및 서피스 (Shadows & Elevation)

- **Elevation 1 (Card Rest)**: `0 4px 20px -2px rgba(37, 38, 43, 0.06)`
- **Elevation 2 (Card Hover)**: `0 12px 32px -4px rgba(37, 38, 43, 0.12)`
- **Elevation 3 (Modal / Lightbox)**: `0 24px 64px -8px rgba(0, 0, 0, 0.35)`
- **Backdrop Blur**: `backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);`

---

## 3. 컴포넌트별 디자인 가이드라인

### 3.1 Header
- **위치 및 동작**: 상단 고정(Sticky Header), 스크롤 시 반투명 아이보리 글래스모피즘(`rgba(247, 245, 240, 0.88)`) 배경 및 미세 보더.
- **로고**: 좌측 정렬 (데스크톱), 가로 폭 적정 비율 유지(`width: 130px`, `height: auto`), 고선명 렌더링.
- **메뉴**: 우측 수평 정렬, 은은한 밑줄 호버 애니메이션, 현재 선택 상태 표시.
- **모바일**: 햄버거 토글 버튼(WCAG 최소 44x44px 터치 영역), 부드러운 우측 드로어 메뉴, 포커스 트랩.

### 3.2 Hero Section
- **비주얼**: `hero.jpg` 전면 배치 + 건축적 텍스처를 살리는 선형 그라데이션 오버레이(`linear-gradient(to right, rgba(37,38,43,0.85) 0%, rgba(37,38,43,0.3) 60%, rgba(37,38,43,0.15) 100%)`).
- **타이포그래피 배치**: `Editor's Choice` 골드 뱃지 → `Sebastian Weiss` 작가명 → 대형 `Urban Strorkes` 타이틀 → Pill 모양의 `Read More` 버튼.
- **인터랙션**: 호버 시 반전 애니메이션(배경 채움), 클릭 시 실제 기사/모달 정보 뷰어 연동.

### 3.3 Featured Content Cards
- **구조**: CSS Grid 2열 (모바일 1열).
- **카드 1 (Inspring Reads)**: 오리지널 Tan 골드 톤 기반 프리미엄 서피스, 엠보싱 효과의 섬세한 테두리, 우측 하단 Read More 정렬.
- **카드 2 (Reflections)**: 오리지널 Dark 차콜 톤 기반 깊이감 있는 서피스, 은은한 조명 효과.
- **호버 효과**: `transform: translateY(-4px)`, 부드러운 그림자 확장.

### 3.4 Gallery Grid & Lightbox
- **그리드**: 모바일 1열(또는 2열), 태블릿 2열, 데스크톱 4열 CSS Grid.
- **비율(Aspect Ratio)**: `aspect-ratio: 1 / 1` (스퀘어) 또는 `4 / 5`로 일관성 유지.
- **오버플로 제어**: `overflow: hidden`, 호버 시 이미지 1.05배 은은한 줌 확대.
- **Lightbox**:
  - 클릭 시 원본 고해상도 이미지를 중앙에 띄우는 전체화면 모달.
  - 이전/다음 이미지 내비게이션 (좌우 화살표 키보드 및 버튼 지원).
  - ESC 키 또는 오버레이 클릭 시 닫힘.
  - 스크린리더를 위한 `role="dialog"`, `aria-modal="true"`, 명확한 포커스 복원.

### 3.5 Footer
- **스타일**: 상단에 섬세한 1px 디바이더(`border-top: 1px solid rgba(37,38,43,0.1)`).
- **정렬**: 중앙 또는 균형 잡힌 텍스트 정렬, 2개 문구 사이의 안정적 라인 높이, 저작권 문구의 높은 가독성.
