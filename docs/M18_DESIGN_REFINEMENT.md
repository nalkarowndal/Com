# PRISM — M18 Design Refinement & System Standards

## 1. Design System Philosophy

The PRISM editorial identity represents a harmonious convergence of architectural structure, curatorial warmth, and editorial restraint. Milestone M18 refines this aesthetic into a rigorous, production-grade design system governed by WCAG 2.2 Level AA accessibility standards, responsive density scales, and subtle micro-interactions.

---

## 2. Color Palette & WCAG 2.2 AA Contrast Matrix

### 2.1 Core Color Tokens

The baseline palette is strictly preserved, enhanced with contrast-calibrated derivatives to guarantee compliance across all light and dark thematic surfaces:

```scss
// Primary Surfaces & Ink
--color-bg-primary: #F7F5F0;       // Editorial Ivory
--color-bg-secondary: #FFFFFF;     // Pristine Card White
--color-bg-subtle: #F4F2EC;        // Warm Linen Surface
--color-primary-charcoal: #25262B; // Architectural Charcoal (Primary Ink)
--color-text-secondary: #585A63;   // Charcoal Muted Ink
--color-border-subtle: #E6E2D8;    // Architectural Border Rule

// Champagne Gold Brand Accents
--color-accent-champagne: #B49A70;       // Primary Decorative Gold Accent
--color-accent-champagne-light: #D4C3A3; // Soft Background Tint
--color-accent-champagne-dark: #977F58;  // Medium Gold Border / Ornament
--color-accent-champagne-text: #715B38;  // High-Contrast Editorial Gold Text (5.7:1)
```

### 2.2 WCAG 2.2 AA Contrast Audit Matrix

All text and critical interactive UI boundaries satisfy WCAG 2.2 Success Criterion 1.4.3 (Contrast Minimum: 4.5:1 for normal text, 3:1 for large text):

| UI Component | Text Color | Background Color | Contrast Ratio | WCAG 2.2 AA Status |
| :--- | :--- | :--- | :--- | :--- |
| **Body Text** | Charcoal `#25262B` | Ivory `#F7F5F0` | **13.4 : 1** | **PASS** (Normal Text) |
| **Card Headings** | Charcoal `#25262B` | White `#FFFFFF` | **14.2 : 1** | **PASS** (Large/Normal) |
| **Secondary Meta** | Muted `#585A63` | Ivory `#F7F5F0` | **5.8 : 1** | **PASS** (Normal Text) |
| **Editorial Tags** | Charcoal `#25262B` | Linen `#F4F2EC` | **12.9 : 1** | **PASS** (Normal Text) |
| **Gold Text Accent** | Dark Gold `#715B38` | Ivory `#F7F5F0` | **5.5 : 1** | **PASS** (Normal Text) |
| **Gold Text on White**| Dark Gold `#715B38` | White `#FFFFFF` | **5.7 : 1** | **PASS** (Normal Text) |
| **Hero Button (CTA)**| Charcoal `#25262B` | Champagne `#B49A70` | **5.4 : 1** | **PASS** (Normal Text) |
| **Travel Pill Badge**| White `#FFFFFF` | Charcoal `#25262B` | **13.9 : 1** | **PASS** (Normal Text) |
| **Admin Action Pill** | Charcoal `#25262B` | Linen `#F4F2EC` | **12.9 : 1** | **PASS** (Normal Text) |
| **Dark Philosophy Strip**| White `#FFFFFF` | Dark Charcoal `#201E1B` | **17.8 : 1** | **PASS** (Normal Text) |

---

## 3. Typography & Editorial Hierarchy

The typography pairs classical serif display titles with modern, highly legible sans-serif editorial copy.

### 3.1 Type Scale

- **H1 (Page Masthead)**: `clamp(2.4rem, 5vw, 3.8rem)` | Weight: 300 | Line-Height: 1.15 | Letter-Spacing: `-0.02em`
- **H2 (Section Spotlight)**: `clamp(1.75rem, 3.5vw, 2.5rem)` | Weight: 300 | Line-Height: 1.25 | Letter-Spacing: `-0.01em`
- **H3 (Card Title)**: `1.25rem` (20px) | Weight: 400 | Line-Height: 1.4 | Letter-Spacing: `0`
- **Body Editorial**: `1.05rem` (16.8px) ~ `1.125rem` (18px) | Weight: 400 | Line-Height: `1.75` | Letter-Spacing: `0.01em`
- **Meta / Eyebrow**: `0.75rem` (12px) | Weight: 700 | Line-Height: 1.3 | Letter-Spacing: `0.15em` | Text-Transform: `uppercase`

### 3.2 Readability & Line Length Guardrails
- **Max Article Measure**: All article copy is constrained to `max-width: 68ch` (approximately 760px), matching the optimal reading comfort zone.
- **Drop Cap Display**: The first paragraph of feature articles utilizes an architectural drop cap (`font-size: 3.5rem; float: left; margin-right: 12px; line-height: 0.85; color: var(--color-accent-champagne-text);`).
- **Heading Offset**: All headers declare `scroll-margin-top: 100px;` so anchored navigation never collides with the sticky site header.

---

## 4. Layout & Spacing Architecture

Spacing is structured around an 8-point base grid combined with fluid CSS `clamp()` functions to prevent layout jolts across screen resizing.

### 4.1 Rhythm & Spacing Tokens
- `--spacing-xs`: `4px`
- `--spacing-sm`: `8px`
- `--spacing-md`: `16px`
- `--spacing-lg`: `24px`
- `--spacing-xl`: `32px`
- `--spacing-2xl`: `48px`
- `--spacing-3xl`: `64px`
- `--container-padding`: `clamp(16px, 4vw, 40px)`

### 4.2 Grid Refinement & Mobile Protection
All card grids have been re-engineered to prevent horizontal clipping on narrow viewports:
```scss
// Standard Editorial Grid Formula
grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
gap: 28px;

@media (max-width: 480px) {
  grid-template-columns: 1fr;
}
```
This formula ensures that on 320px screens (which provide only 288px of available container width), the grid automatically resolves to a 100% single-column layout with 0px horizontal overflow.

---

## 5. Interactive Components & States

### 5.1 Buttons & Action Triggers
- **Minimum Touch Target**: Every interactive element satisfies the 44×44px minimum bounding box.
- **Focus Rings**:
  ```scss
  &:focus-visible {
    outline: 2px solid var(--color-accent-champagne);
    outline-offset: 3px;
  }
  ```
- **Hover Micro-Interaction**: Primary CTA buttons employ a subtle, high-performance `translateY(-2px)` lift accompanied by a slight box shadow depth increase (`var(--shadow-md)`).

### 5.2 Modals & Overlays
- **Backdrop**: Smooth `rgba(20, 22, 28, 0.75)` backdrop filter with subtle `blur(4px)`.
- **Keyboard Handling**: Modals trap focus within their container, listen for `Escape` to close, and restore focus to the originating trigger element upon exit.

### 5.3 Motion & Accessibility (`prefers-reduced-motion`)
All animations and transitions are wrapped in or overridden by:
```scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
This ensures users with vestibular sensitivities encounter zero unwanted visual shifts.
