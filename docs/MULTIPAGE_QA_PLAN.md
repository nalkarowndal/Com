# PRISM Multi-Page QA Plan & Test Automation Strategy

## 1. Quality Assurance Objectives

To ensure enterprise-grade stability and portfolio excellence, PRISM employs a 4-tier testing hierarchy:

1. **Tier 1: Unit Tests (Content Preservation Invariants)**:
   - Validates that zero baseline texts, logos, authors, or copyrights are corrupted.
   - Script: `npm run test:unit` (`tests/unit/contentPreservation.test.js`).
2. **Tier 2: Backend API Integration Tests**:
   - Tests all 11 REST endpoints, query parameters, pagination, scrypt authentication, and DB persistence.
   - Script: `npm run test:api` (`server/tests/api.test.js`).
3. **Tier 3: Multi-Page E2E & Visual Automation Suite**:
   - Tests all 10 canonical routes, 5 responsive viewports, horizontal overflow (0px), Lightbox interaction, and search parameter sync.
   - Script: `npm run test:multipage` (`tests/e2e/multipage.test.mjs`).
4. **Tier 4: Accessibility & Standards Compliance**:
   - axe-core WCAG 2.2 AA audit automated inside Playwright.

---

## 2. Tested Viewports Matrix

| Viewport Name | Resolution | Target Form Factor | Test Criteria |
|---|---|---|---|
| `mobile_375x812` | 375 x 812 | iPhone X / SE | 0px horizontal overflow, hamburger drawer functional |
| `tablet_768x1024` | 768 x 1024 | iPad Portrait | Balanced 2-column grid, legible font measure |
| `desktop_1280x800` | 1280 x 800 | MacBook / Laptop | Canonical desktop layout, sticky header active |
| `desktop_wide_1440x900` | 1440 x 900 | High-Res Monitor | Centered 1280px max-width container, balanced gutters |
| `desktop_fullhd_1920x1080`| 1920 x 1080 | Full HD Display | Crisp typography, ultra-wide margins |

---

## 3. Automation Pipeline & GitHub Actions

The CI workflow (`.github/workflows/ci.yml`) runs on every commit and pull request:

```text
Push / Pull Request
       │
       ▼
1. Install Dependencies (`npm ci`)
       │
       ▼
2. ESLint Code Linting (`npm run lint`)
       │
       ▼
3. Unit Tests (`npm run test:unit`) ──> 6/6 PASS
       │
       ▼
4. API Integration Tests (`npm run test:api`) ──> 11/11 PASS
       │
       ▼
5. Production Bundle Build (`npm run build`) ──> 0 Errors (900ms)
       │
       ▼
6. Playwright Multi-Page QA (`npm run test:multipage`) ──> 10/10 Routes PASS, 5 Viewports PASS
       │
       ▼
7. axe-core WCAG 2.2 AA Audit ──> 0 Critical Violations
```
