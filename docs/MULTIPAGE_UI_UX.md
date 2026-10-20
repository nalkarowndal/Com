# PRISM Multi-Page UI/UX Design System

## 1. Unified Brand Experience

PRISM maintains an architectural editorial language across all 10 canonical views. The visual hierarchy relies on generous negative space, refined typography, subtle micro-interactions, and a cohesive color palette.

### 1.1 Color Palette
- **Ivory Base** (`#F7F5F0`): Background across all public pages, preventing stark digital white glare.
- **Charcoal Text & Accents** (`#25262B`): Primary typography and anchor buttons.
- **Champagne Gold** (`#B49A70` / `#977F58`): Editorial badges, category labels, and hover highlights.
- **Card Hues**: Warm tan (`#B9A88E`) and deep slate (`#2D2D35`) for featured cards.

### 1.2 Typography Hierarchy
- **Brand Serif**: `Cinzel` for page header titles, 404 numerical display, and editorial blockquotes.
- **Body & Interface**: `Plus Jakarta Sans` for body copy, navigational links, metadata, and tables.

---

## 2. Global UI Components

### 2.1 Sticky Header & Active Routing
- Built with `<NavLink>` from `react-router-dom`.
- The active category automatically receives the `.active` CSS state (champagne bottom indicator).
- Includes direct links to:
  - PRISM Logo (`/`)
  - Disciplines: Architecture (`/architecture`), Travel (`/travel`), Art (`/art`), Food (`/food`)
  - Gallery (`/gallery`)
  - Search overlay/page (`/search`)
  - Admin Portal quick launcher (`/admin/dashboard`)
  - Mobile Menu Hamburger Toggle

### 2.2 Breadcrumb System
- Accessible `<nav aria-label="Breadcrumb">` on all subpages.
- Structured as `Home > [Category] > [Monograph Title]`.

### 2.3 Editorial Card System (`EditorialCard.jsx`)
- Responsive image wrapper with subtle `transform: scale(1.05)` on hover.
- Category tag, author attribution, 3-line excerpt truncation, and keyword tags.
- Dedicated category variants (`architecture`, `travel`, `art`, `food`).

---

## 3. Responsive Layout Matrix

| Viewport | Device Class | Grid Configuration | Navigation Presentation |
|---|---|---|---|
| `375 x 812` | Mobile | 1-column vertical stack | Slide-out overlay drawer (`MobileNav.jsx`) |
| `768 x 1024` | Tablet | 2-column editorial grid | Condensed desktop header with search button |
| `1280 x 800` | Desktop | Asymmetric 12-column architecture grid | Full desktop navigation bar |
| `1440 x 900` | Desktop Wide | 3-column masonry | Max container constraint (1280px) centered |
| `1920 x 1080` | Full HD | Ultra-wide balanced layout | Auto-margin horizontal gutters |
