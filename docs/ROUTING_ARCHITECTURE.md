# 멀티페이지 라우팅 아키텍처 명세서 (ROUTING_ARCHITECTURE.md)

작성일자: 2026-10-20  
프레임워크: **React 19.x + Vite 8.x + React Router DOM v7**  
설계 패턴: **Nested Layouts, Data-Driven Routes & Protected Administration**

---

## 1. 라우트 계층 구조 (Route Hierarchy)

```text
Root Router
│
├── PublicLayout (공개 사용자 레이아웃)
│   ├── /                          -> HomePage (기존 메인페이지 원본 100% 보존)
│   ├── /architecture              -> ArchitecturePage (건축 에디토리얼)
│   ├── /travel                    -> TravelPage (여행 에디토리얼 & 컬렉션)
│   ├── /art                       -> ArtPage (현대미술 전시 & 작품 갤러리)
│   ├── /food                      -> FoodPage (미식 문화 & 헤리티지 에세이)
│   ├── /stories/:slug             -> ArticleDetailPage (아티클 정식 독립 상세)
│   ├── /gallery                   -> GalleryPage (카테고리별 갤러리 & Lightbox)
│   ├── /search                    -> SearchPage (실시간 키워드·카테고리 검색)
│   └── *                          -> NotFoundPage (404 친화적 오류 화면)
│
└── AdminLayout (관리자 보호 레이아웃)
    ├── /admin/login               -> AdminLoginPage (공개 로그인)
    ├── /admin/dashboard           -> AdminDashboardPage (통계 및 요약)
    ├── /admin/articles            -> AdminArticlesPage (아티클 CRUD 목록)
    ├── /admin/articles/new        -> AdminArticleEditPage (신규 작성)
    ├── /admin/articles/:id/edit   -> AdminArticleEditPage (기존 수정)
    ├── /admin/media               -> AdminMediaPage (미디어 자산 관리)
    └── /admin/settings            -> AdminSettingsPage (사이트 설정 & 감사 로그)
```

---

## 2. 라우팅 기능 및 사용자 경험 (UX)

1. **Scroll Restoration**: 페이지 이동 시 스크롤 위치를 상단(0, 0)으로 자동 복원.
2. **Active Navigation Indicator**: 현재 활성화된 카테고리 메뉴에 시각적 샴페인 골드 인디케이터 및 `aria-current="page"` 부여.
3. **SPA Fallback & Deep Linking**: 사용자가 브라우저 새로고침, 뒤로가기, 직접 URL 입력 시에도 올바른 페이지를 렌더링.
4. **URL 동기화**: 검색 페이지의 쿼리 파라미터(`?q=...&category=...&page=...`)를 주소창과 실시간 양방향 동기화.
5. **보호 라우트 (Protected Routes)**: 비인가 사용자가 `/admin/dashboard`에 접근할 경우 자동으로 `/admin/login?redirect=...`로 안전하게 리다이렉트.
