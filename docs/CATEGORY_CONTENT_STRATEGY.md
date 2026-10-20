# PRISM Category Content Strategy & Provenance Rules

## 1. Editorial Vision & Taxonomy

PRISM is curated as a high-end architectural and cultural publication. Content is divided into four permanent disciplines, each reflecting a distinct editorial philosophy while maintaining a unified luxury aesthetic.

```text
PRISM Platform
  ├── Architecture  (Monographs, structural forms, brutalism, high-rise facades)
  ├── Travel        (Contemplative field notes, vernacular geographies, historic crossings)
  ├── Art           (White-cube spatial installations, sculptural void, light critiques)
  └── Food          (Artisanal grains, wild fermentation, umami broths, gastronomy essays)
```

---

## 2. Provenance & Factual Integrity Rules

To protect journalistic credibility and comply with copyright and ethical standards:

1. **Baseline Invariants (Untouchable)**:
   - "Sebastian Weiss" & "Urban Strorkes" are preserved exactly as defined in the project baseline.
   - Core media files (`/images/hero.jpg`, `/images/logo.png`, `/images/gallery-1~4.jpg`) are permanent assets.
2. **No Fabricated Commercial Entities**:
   - We do not fabricate fake corporate balance sheets, client contracts, employee rosters, or fake street addresses.
   - All editorial pieces focus on architectural principles, material studies, craftsmanship, and aesthetic criticism.
3. **Demo & Draft Clear Labeling**:
   - Any new editorial piece generated for the multi-page platform contains `isDemo: true`.
   - On the UI, this displays as a discreet champagne badge (`DEMO ARCHIVE` / `DEMO`), preventing confusion between verified historical monographs and editorial prototypes.
4. **Media Reuse & Optimization**:
   - Photographic assets reference existing repository imagery with specialized crops, responsive aspect ratios, and descriptive semantic alt text.

---

## 3. Discipline-Specific Guidelines

### 3.1 Architecture (`/architecture`)
- **Tone**: Critical, analytical, structural, geometric.
- **Key Themes**: Cantilever dynamics, cast-concrete brutalism, parametric curtain glazing, double-curved facades.
- **Visual Style**: Asymmetric grid, strong contrast, negative space, heavy use of black/charcoal accents.

### 3.2 Travel (`/travel`)
- **Tone**: Atmospheric, contemplative, geographical, field-diary.
- **Key Themes**: River mists on suspension bridges, hinoki cypress sanctuaries in Kyoto, vernacular lime-washed Aegean settlements.
- **Visual Style**: Panorama banners, warm tan accents (`#B9A88E`), 3-card photo strips.

### 3.3 Art (`/art`)
- **Tone**: Curatorial, philosophical, minimalist.
- **Key Themes**: Monochrome scale, white cube installations, void, circadian light projections.
- **Visual Style**: White gallery plaque styling (`NO. 03 Curatorial Spotlight`), subtle borders, ample white space.

### 3.4 Food (`/food`)
- **Tone**: Sensory, artisanal, historical craftsmanship.
- **Key Themes**: Wild sourdough fermentation, heirloom grains, mineral dashi broths, seasonal subtraction.
- **Visual Style**: Warm culinary spotlight, deep charcoal `#201E1B` manifesto footer, warm champagne badges.
