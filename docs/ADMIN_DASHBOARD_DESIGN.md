# PRISM Editorial Administration Dashboard Design

## 1. Administrative Architecture

The PRISM CMS provides an operational back-office for editorial staff. Unlike earlier prototypes that only modified ephemeral in-memory React state, this system provides real database persistence, cryptographic session verification, and immutable audit tracking.

---

## 2. Authentication & Authorization Flow

```text
[Curator] 
    │
    ▼ Enters username & password
[AdminLoginPage (/admin/login)]
    │
    ▼ POST /api/admin/login { username, password }
[AuthService (server/src/services/auth.service.js)]
    ├── Retrieves password hash from environment / DB
    ├── Computes scrypt key derivation (16-byte random salt, 64-byte key)
    ├── Timing-safe comparison via crypto.timingSafeEqual()
    └── Generates signed HMAC-SHA256 JWT token with 24h expiry
    │
    ▼ HTTP 200 { token, user } + HttpOnly cookie
[AdminLayout Session Guard (/admin/*)]
    ├── Verifies session via GET /api/admin/me
    ├── Grants access to Dashboard, Articles, Media, Categories, Settings
    └── If unauthenticated: redirects to /admin/login with redirect state
```

---

## 3. Administrative Modules

### 3.1 Intelligence Dashboard (`/admin/dashboard`)
- **Key Metrics**:
  - Total Articles
  - Active Disciplines (Locked to 4)
  - Permanent Gallery Works (Locked to 4)
  - Total Reader Engagements (Aggregated views)
- **Discipline Distribution**: Real-time count of articles per category.
- **Curator Audit Trail**: Table recording timestamp, curator username, operation (`CREATE`, `UPDATE`, `DELETE`), target entity, and payload details.

### 3.2 Monograph Management (`/admin/articles`)
- Master table with inline search and category filter.
- Columns: Title & slug, Category, Author, Views, Status (Published/Draft), Type (Core Archive vs Demo).
- Actions:
  - Live View link (opens `/stories/:slug` in new tab).
  - Edit link (`/admin/articles/:id/edit`).
  - Delete with inline confirmation dialog.
  - **Core Protection**: The baseline hero article (`hero-urban-strorkes`) has its delete button disabled to prevent accidental removal of project invariants.

### 3.3 Article Composer (`/admin/articles/new` & `/:id/edit`)
- Responsive multi-column form with automatic slug generation from title.
- Discipline dropdown, cover media selector, lead abstract textarea, full narrative editor.
- Boolean toggles: Published, Featured, and Demo Archive.
- Submissions trigger real database mutations via `POST /api/admin/articles` or `PATCH /api/admin/articles/:id`.

### 3.4 Media & Category Protections
- Media (`/admin/media`): Displays permanent asset dimensions, alt text, and locked preservation status.
- Categories (`/admin/categories`): Displays the 4 foundational categories with active order indices.
