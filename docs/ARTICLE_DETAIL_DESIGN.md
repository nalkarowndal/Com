# PRISM Article Detail Page Design (`/stories/:slug`)

## 1. Editorial Vision

The Article Detail view expands the modal-based preview of the baseline website into a long-form monograph reader designed for deep reading and contemplation.

---

## 2. Layout Structure & Reading Ergonomics

```text
+--------------------------------------------------------+
| Breadcrumb: Home > Architecture > Urban Strorkes       |
| Category Badge | Badge Label | Demo Tag (if applicable)|
|                                                        |
| H1: Urban Strorkes                                     |
| Author: Sebastian Weiss · 1,420 reads | [Share Button] |
+--------------------------------------------------------+
| [Featured High-Definition Cover Image: /images/hero.jpg]|
| Caption: Urban Strorkes — Photography & Documentation  |
+--------------------------------------------------------+
| Lead Box: Acclaimed photographic exploration...        |
| (Champagne left border, 1.25rem serif/sans lead)       |
+--------------------------------------------------------+
| Drop Cap Paragraph:                                    |
| [U] rban Strorkes is an acclaimed photographic...      |
| Paragraph 2...                                         |
+--------------------------------------------------------+
| Tags: #Architecture #Minimalist #SebastianWeiss        |
+--------------------------------------------------------+
| [ <- Back to Architecture ]                            |
+--------------------------------------------------------+
| Related Monograph Studies:                             |
| [Card 1: Concrete Cantilevers] [Card 2: Facade Grid]   |
+--------------------------------------------------------+
```

---

## 3. Typographic System

1. **Optimal Reading Measure**:
   - `max-width: 860px` centered container.
   - Prevents excessive line lengths on ultra-wide screens (maintaining 65–75 characters per line).
2. **Drop Cap Implementation**:
   - `.drop-cap-paragraph::first-letter` styled in `Cinzel` serif font at `3.5rem` height, floating left with `color: var(--color-accent-champagne-dark)`.
3. **Paragraph Rhythm**:
   - Font size `1.125rem` with a generous line-height of `1.85` for reading comfort.
4. **Interactive Share Feature**:
   - Seamlessly copies the canonical URL to clipboard with visual feedback (`Link Copied!`).
5. **Baseline Invariant Guarantee**:
   - Accessing `/stories/urban-strorkes` guarantees that the exact baseline monograph text by Sebastian Weiss is rendered identically to the original project snapshot.
