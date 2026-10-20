# PRISM Multi-Page Specifications

## 1. Overview & Architecture

The PRISM platform (`company`) has transitioned from a single-page marketing site to a multi-page architectural and editorial publication. Every page operates with standalone URL routing, dynamic API querying, responsive layout constraints, and accessibility compliance.

---

## 2. Route Specifications

| Route | View Component | Layout | Data Loader / API Endpoint | Invariant Constraints |
|---|---|---|---|---|
| `/` | `HomePage.jsx` | `PublicLayout.jsx` | `GET /api/home` | Exact baseline texts (`Urban Strorkes`, `Inspring Reads`, `Reflections`, `Sebastian Weiss`, copyright) |
| `/architecture` | `ArchitecturePage.jsx` | `PublicLayout.jsx` | `GET /api/categories/architecture`, `GET /api/articles?category=architecture` | Preserves Sebastian Weiss monograph as anchor |
| `/travel` | `TravelPage.jsx` | `PublicLayout.jsx` | `GET /api/categories/travel`, `GET /api/articles?category=travel` | Regional tags, field notes styling |
| `/art` | `ArtPage.jsx` | `PublicLayout.jsx` | `GET /api/categories/art`, `GET /api/articles?category=art` | White-cube gallery aesthetics, curatorial plaques |
| `/food` | `FoodPage.jsx` | `PublicLayout.jsx` | `GET /api/categories/food`, `GET /api/articles?category=food` | Artisanal heritage, culinary essays |
| `/stories/:slug` | `ArticleDetailPage.jsx` | `PublicLayout.jsx` | `GET /api/articles/:slug` | `/stories/urban-strorkes` baseline text preserved |
| `/gallery` | `GalleryPage.jsx` | `PublicLayout.jsx` | `GET /api/gallery?category=...` | 4 baseline images preserved in exact order |
| `/search` | `SearchPage.jsx` | `PublicLayout.jsx` | `GET /api/search?q=...&category=...` | URL search param sync, empty state with keyword hints |
| `/admin/login` | `AdminLoginPage.jsx` | Standalone | `POST /api/admin/login` | scrypt crypto verification, timing-safe |
| `/admin/dashboard` | `AdminDashboardPage.jsx` | `AdminLayout.jsx` | `GET /api/admin/stats`, `GET /api/admin/audit-logs` | Auth guard via `apiAdminGetMe()` |
| `/admin/articles` | `AdminArticlesPage.jsx` | `AdminLayout.jsx` | `GET /api/articles?limit=100`, `DELETE /api/admin/articles/:id` | Filter, CRUD, delete protection on core hero |
| `/admin/articles/new` | `AdminArticleEditPage.jsx`| `AdminLayout.jsx` | `POST /api/admin/articles` | Creates new record with `isDemo: true` |
| `/admin/articles/:id/edit`| `AdminArticleEditPage.jsx`| `AdminLayout.jsx` | `PATCH /api/admin/articles/:id` | Preserves existing fields, creates audit record |
| `/admin/categories` | `AdminCategoriesPage.jsx`| `AdminLayout.jsx` | `GET /api/categories` | Locked core categories display |
| `/admin/media` | `AdminMediaPage.jsx` | `AdminLayout.jsx` | Media catalog | Alt text inspection, locked status display |
| `/admin/settings` | `AdminSettingsPage.jsx` | `AdminLayout.jsx` | `GET /api/health` | Persistent storage telemetry, security checklist |
| `*` | `NotFoundPage.jsx` | `PublicLayout.jsx` | Client fallback | 404 header, return to home, search link |

---

## 3. Component Hierarchy

```text
<RouterProvider router={router}>
  ├── PublicLayout
  │     ├── Header (Logo, NavLinks, SearchBtn, AdminBtn, MobileNavToggle)
  │     ├── ScrollRestoration
  │     ├── <Outlet />
  │     │     ├── HomePage (HeroSection, FeaturedSection, GalleryGrid)
  │     │     ├── ArchitecturePage (Breadcrumb, PageHeader, HeroBanner, Filters, EditorialGrid, Philosophy)
  │     │     ├── TravelPage (Breadcrumb, PageHeader, PanoramaHero, RegionalFilters, CardsGrid, PhotoStrip)
  │     │     ├── ArtPage (Breadcrumb, PageHeader, SpotlightHero, MediumFilters, ArtGrid, Statement)
  │     │     ├── FoodPage (Breadcrumb, PageHeader, CulinaryHero, ThemeFilters, FoodGrid, Manifesto)
  │     │     ├── ArticleDetailPage (Breadcrumb, Header, CoverMedia, LeadBox, DropCapBody, Tags, Related)
  │     │     ├── GalleryPage (Breadcrumb, PageHeader, FilterTabs, ArchiveGrid, LightboxModal)
  │     │     ├── SearchPage (Breadcrumb, PageHeader, QueryForm, CountBar, ResultsGrid, Pagination)
  │     │     └── NotFoundPage (Cinzel 404, ReturnHomeBtn, SearchArchiveBtn)
  │     ├── Footer (Preserved Copyright, Preserved Description)
  │     └── AdminModal (Quick edit fallback)
  │
  ├── AdminLoginPage (Standalone Card, Logo, Scrypt Verification, BackHomeLink)
  │
  └── AdminLayout (Auth Guard, Sidebar, Topbar, Session Context)
        └── <Outlet />
              ├── AdminDashboardPage (MetricsGrid, Breakdown, QuickActions, AuditTrail)
              ├── AdminArticlesPage (FilterBar, ArticlesTable, DeleteSafeguard)
              ├── AdminArticleEditPage (FormGrid, SlugGen, ImagePicker, Checkboxes)
              ├── AdminCategoriesPage (CoreCategoriesLockedGrid)
              ├── AdminMediaPage (AssetGrid, AltInspectionLightbox)
              └── AdminSettingsPage (HealthStatus, PersistenceEngine, SecurityChecklist)
```

---

## 4. Invariant Preservation Guarantee

Under no circumstance does navigating between subpages alter or overwrite the baseline content stored in `tests/snapshots/contentSnapshot.json`. All new records introduced across Architecture, Travel, Art, and Food are registered as independent records with distinct IDs and slugs, explicitly marked with `isDemo: true`.
