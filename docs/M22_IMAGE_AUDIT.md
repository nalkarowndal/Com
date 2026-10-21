# PRISM — M22 Media & Photographic Asset Audit Report

## 1. Executive Summary

This audit investigates the current state of visual asset utilization across the PRISM platform (`company`). PRISM features four distinct editorial verticals: **Architecture**, **Travel**, **Art**, and **Food**. However, due to early-stage development constraints, all ten published monographs and four gallery items currently reuse a pool of only **five baseline photographic files**.

This reliance on a single architectural asset pool creates severe visual and thematic dissonance—most acutely in the **Food** and **Art** verticals, where articles on artisanal sourdough bread and traditional Japanese dashi are illustrated with photos of brutalist cast-concrete staircases and high-rise curtain walls.

---

## 2. Inventory of Baseline Visual Assets

The project currently hosts the following five original photographic files in `/public/images/`:

| File Path | Dimensions | Visual Subject | Stylistic Signature | Preserved Status |
| :--- | :--- | :--- | :--- | :--- |
| `/images/logo.png` | 240 × 60 | PRISM Brand Identity | Minimalist typography | **Core Invariant (Locked)** |
| `/images/hero.jpg` | 1920 × 1080 | Modern European architectural facade | Smooth curved concrete, natural light (Sebastian Weiss) | **Core Invariant (Locked)** |
| `/images/gallery-1.jpg` | 1200 × 800 | Helical cast-concrete cantilevered staircase | Raw brutalism, spiral engineering | **Core Invariant (Locked)** |
| `/images/gallery-2.jpg` | 1200 × 800 | Monumental suspension bridge perspective | Industrial steel cables at dawn, river mist | **Core Invariant (Locked)** |
| `/images/gallery-3.jpg` | 1200 × 800 | Angular asymmetrical building roofline | Modern geometry, cloud reflections, skylight | **Core Invariant (Locked)** |
| `/images/gallery-4.jpg` | 1200 × 800 | Curved skyscraper glass curtain wall | Aluminum grids, evening horizon reflections | **Core Invariant (Locked)** |

---

## 3. Article Image Cross-Reference Matrix

The 10 baseline articles are currently mapped to the 5 baseline files as follows:

| Article ID & Slug | Category | Article Title & Content Theme | Current `imageSrc` | Thematic Alignment | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `hero-urban-strorkes`<br>`urban-strorkes` | Architecture | **Urban Strorkes**<br>Contemporary metropolitan form & organic geometry (Sebastian Weiss) | `/images/hero.jpg` | **Accurate Match** | None (Preserved) |
| `art-concrete-cantilevers`<br>`concrete-cantilevers` | Architecture | **Brutalist Echoes**<br>Suspended helical cast-concrete stairwells & brutalist dynamics | `/images/gallery-1.jpg` | **Accurate Match** | None (Preserved) |
| `art-facade-reflections`<br>`facade-reflections` | Architecture | **Curvature & Grid**<br>Parametric high-rise curtain walls and glass enclosures | `/images/gallery-4.jpg` | **Accurate Match** | None (Preserved) |
| `trv-bridge-horizons`<br>`suspension-horizons` | Travel | **Suspension Horizons**<br>Walking monumental suspension bridges at dawn | `/images/gallery-2.jpg` | **Accurate Match** | None (Preserved) |
| `trv-kyoto-pavilions`<br>`kyoto-pavilions` | Travel | **Timber and Moss**<br>Weathered hinoki cypress pavilions, raked gravel & moss in historic Kyoto | `/images/gallery-3.jpg` | **THEMATIC MISMATCH**<br>Displays modern angular Western building facade instead of historic timber temple / moss garden | **High** |
| `trv-aegean-dwellings`<br>`aegean-dwellings` | Travel | **Limestone Horizons**<br>White lime plaster, stone terraces, and Aegean Mediterranean coastal dwellings | `/images/gallery-1.jpg` | **THEMATIC MISMATCH**<br>Displays brutalist indoor spiral staircase instead of sun-drenched Aegean sea cliff architecture | **High** |
| `art-spatial-dimensions`<br>`spatial-dimensions` | Art | **Monochrome Volume**<br>Minimalist spatial sculpture & voids in pristine white-cube galleries | `/images/gallery-3.jpg` | **THEMATIC MISMATCH**<br>Displays exterior building facade rather than an interior sculptural gallery installation | **Medium** |
| `art-kinetic-shadows`<br>`kinetic-shadows` | Art | **Light as Medium**<br>Ephemeral projections, color fields, and chromatic gallery interventions | `/images/gallery-4.jpg` | **THEMATIC MISMATCH**<br>Displays high-rise exterior glazing rather than artistic chromatic light installations | **Medium** |
| `food-slow-harvest`<br>`slow-harvest` | Food | **Ancient Grains and Sourdough**<br>Stone-milled heirloom wheat, wild fermentation, wood-fired hearths | `/images/gallery-3.jpg` | **CRITICAL MISMATCH**<br>Displays angular office building facade for an article about artisanal sourdough breadmaking | **Critical** |
| `food-dashi-traditions`<br>`dashi-traditions` | Food | **The Architecture of Umami**<br>Aged kombu kelp, hand-shaved katsuobushi, mineral broths | `/images/gallery-1.jpg` | **CRITICAL MISMATCH**<br>Displays brutalist raw concrete staircase for an article about Japanese culinary dashi broth | **Critical** |

---

## 4. Category & Gallery Image Audit

### 4.1 Category Hero Images (`categories` collection)
- **Architecture (`cat-arch`)**: Uses `/images/hero.jpg` (Appropriate).
- **Travel (`cat-travel`)**: Uses `/images/gallery-2.jpg` (Suspension bridge cables; serviceable, but narrow in scope).
- **Art (`cat-art`)**: Uses `/images/gallery-1.jpg` (Spiral concrete stairwell used as the category masthead).
- **Food (`cat-food`)**: Uses `/images/gallery-3.jpg` (Angular office building roofline used as Food category masthead!).

### 4.2 Gallery Collection (`gallery_items`)
- `gallery-1`: `/images/gallery-1.jpg` (Architecture: Spiral staircase) — **Accurate**.
- `gallery-2`: `/images/gallery-2.jpg` (Travel: Suspension bridge) — **Accurate**.
- `gallery-3`: `/images/gallery-3.jpg` (Art: Angular facade labeled as art) — **Misaligned**.
- `gallery-4`: `/images/gallery-4.jpg` (Food: Skyscraper facade labeled as food!) — **Severe Dissonance**.

---

## 5. Codebase Hardcoded Paths & Anti-Patterns

1. **`EditorialCard.jsx` (Line 27)**:
   ```jsx
   <img src={imageSrc || '/images/hero.jpg'} ... />
   ```
   *Issue*: Any monograph lacking an image falls back to an architectural facade, even if the article belongs to the Food or Art category.

2. **`ArchitecturePage.jsx` (Line 93)**:
   ```jsx
   <img src="/images/hero.jpg" alt="Urban Strorkes by Sebastian Weiss" className="arch-hero-bg" />
   ```
   *Issue*: Hardcoded path ignores `category.heroImage` from the database.

3. **`TravelPage.jsx` (Lines 237, 241, 245)**:
   ```jsx
   <img src="/images/gallery-2.jpg" ... />
   <img src="/images/gallery-3.jpg" ... />
   <img src="/images/gallery-1.jpg" ... />
   ```
   *Issue*: Visual travel strip hardcodes the baseline gallery files instead of querying travel-tagged gallery items.

4. **`ArtPage.jsx` (Line 97)**:
   ```jsx
   src={featuredStory.imageSrc || '/images/gallery-3.jpg'}
   ```
   *Issue*: Hardcoded fallback to modern exterior architecture.

5. **`FoodPage.jsx` (Line 97)**:
   ```jsx
   src={featuredStory.imageSrc || '/images/gallery-3.jpg'}
   ```
   *Issue*: Hardcoded fallback to modern exterior architecture.

6. **`AdminMediaPage.jsx` (Lines 3–52)**:
   *Issue*: Completely static mock component rendering a hardcoded array of 6 items. Lacks any backend API integration, file uploading, search, or metadata editing.

7. **`server/src/controllers/admin.controller.js` (Lines 158–182)**:
   *Issue*: `uploadMedia` is a stub function returning dummy JSON without saving uploaded files to disk or registering metadata in the database.

---

## 6. Action Plan for M23 ~ M28

1. **Procure Category-Specific Curated Imagery (M23)**: Source high-resolution, openly licensed photography for the specific missing themes (Kyoto wooden architecture, Aegean coast, minimal white-cube art, light installations, sourdough bread, and Japanese dashi).
2. **Build Production Media Library (M24)**: Upgrade `server` with Multer file uploading, safe storage in `/public/images/uploads/`, metadata tracking, and duplicate hash/size detection.
3. **Database Schema & Relational Links (M25)**: Expand `MediaAsset` table with full licensing and technical metadata; create relational foreign keys (`coverImageId`, `heroImageId`, `mediaAssetId`).
4. **Editorial & Category UX Refinement (M26)**: Replace hardcoded fallbacks with category-neutral placeholders; display unique, thematic images per article; ensure WebP optimization and responsive lazy loading.
5. **AI Image Recommendation Assistant (M27)**: Implement keyword extraction and similarity ranking in the admin editor.
6. **Visual & Responsive Verification (M28)**: Validate all screens via Playwright, ensuring zero broken URLs and 100% preservation of original assets.
