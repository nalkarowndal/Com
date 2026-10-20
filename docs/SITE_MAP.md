# 사이트맵 및 URL 설계 명세서 (SITE_MAP.md)

프로젝트: `company` (PRISM)  
사이트 성격: High-End Architectural Editorial & Portfolio Platform

---

## 1. 공개 웹사이트 맵 (Public Sitemap)

| 경로 | 페이지 명칭 | 설명 | 주요 컴포넌트 |
|---|---|---|---|
| `/` | Home | 기존 메인페이지 (100% 원본 콘텐츠) | HeroSection, FeaturedSection, GalleryGrid |
| `/architecture` | Architecture | 건축 중심 에디토리얼, 모노그래프, 파사드 분석 | ArchitectureHero, EditorialGrid, FilterPanel |
| `/travel` | Travel | 장소와 여정, 교각, 역사적 유산 탐색 | TravelPanoramaHero, LocationGrid, TravelGallery |
| `/art` | Art | 현대미술, 전시 리뷰, 미니멀리즘 조각 비평 | WhiteCubeHeader, ArtworkGrid, ExhibitionSpotlight |
| `/food` | Food | 미식 문화, 발효 헤리티지, 우마미 기하학 | CulinaryHero, RecipeStoryGrid, GastronomyNotes |
| `/stories/:slug` | Story Detail | 기사 정식 독립 상세페이지 (예: `urban-strorkes`) | StoryHeader, RichBody, RelatedStories, ShareBar |
| `/gallery` | Gallery | 건축·여행·예술·미식 갤러리 아카이브 | CategoryFilter, AspectGrid, LightboxModal |
| `/search` | Search | 사이트 전역 에디토리얼 검색 | SearchInput, FilterBar, ResultsGrid, Pagination |
| `/*` | 404 Not Found | 친화적 페이지 안내 및 홈 복귀 네비게이션 | ErrorHeading, SafeRedirectButton |

---

## 2. 관리자 사이트 맵 (Admin Sitemap)

| 경로 | 화면 명칭 | 기능 | 인증 필요 |
|---|---|---|:---:|
| `/admin/login` | Admin Login | 관리자 자격증명 로그인 및 세션 쿠키 발급 | No (공개) |
| `/admin/dashboard` | Dashboard | 등록 콘텐츠 현황, 카테고리별 통계, 최근 활동 | **Yes** |
| `/admin/articles` | Article Management | 전체 기사 목록, 게시/임시저장 상태 변경, 삭제 | **Yes** |
| `/admin/articles/new` | New Article | 신규 에디토리얼 아티클 작성 | **Yes** |
| `/admin/articles/:id/edit`| Edit Article | 기존 기사 내용, 카테고리, 뱃지, 발췌문 수정 | **Yes** |
| `/admin/media` | Media Management | 미디어 자산 등록, 대체 텍스트 관리 | **Yes** |
| `/admin/settings` | Settings & Audit Logs | 저작권 문구 수정 및 시스템 감사 로그 열람 | **Yes** |
