# PRISM — Image Sourcing & Licensing Policy

## 1. Principles of Editorial Asset Integrity

The PRISM platform is dedicated to curating architecture, travel, art, and gastronomy with the highest aesthetic and ethical standards. This policy governs how visual media is sourced, vetted, recorded, and published.

### Core Principles
1. **Verifiable Rights**: Every visual asset in the system must possess a clear, documented license permitting digital reproduction, self-hosting, and editorial publication.
2. **Attribution & Provenance**: Photographer names, original source links, license types, and verification timestamps must be stored permanently in the database.
3. **No Unclear or Scraping Sources**: Images harvested indiscriminately from search engines or social media without explicit licenses are strictly forbidden.
4. **AI Generation Transparency**: AI-synthesized imagery must be tagged with explicit metadata (`sourceName: "AI_GENERATED"`) and must never be disguised as authentic documentary photography.
5. **Permanent Preservation of Baseline Assets**: Baseline brand and founding monograph assets (`logo.png`, `hero.jpg`, `gallery-1~4.jpg`) are designated as **Core Invariant Assets** and are protected against deletion or destructive replacement.

---

## 2. Approved Image Sourcing Channels

| Provider / Channel | Permitted Licenses | Verification Requirements | Attribution Obligation |
| :--- | :--- | :--- | :--- |
| **Unsplash** | Unsplash Commercial License | Direct photo URL, photographer profile URL, photo ID | Yes ("Photo by [Name] on Unsplash") |
| **Pexels** | Pexels License | Direct photo URL, photographer profile URL | Yes ("Photo by [Name] on Pexels") |
| **Wikimedia Commons / Openverse** | CC0 1.0, CC-BY 4.0 | Wikimedia page URL, specific CC version | Mandatory per license specification |
| **Direct Commission / Artist Submission** | Exclusive / Non-Exclusive Editorial Rights | Written permission, photographer name, agreement date | Direct editorial credit |
| **Local Upload (Editorial Staff)** | Authorized Staff Upload | Admin username, license affirmation in upload form | Recorded in MediaAsset metadata |

---

## 3. Metadata Standards (Schema Compliance)

Every image asset registered in the database must supply the following fields:

```text
MediaAsset
├── id: String (UUID or slug-based identifier, e.g. "media-kyoto-pavilions")
├── src: String (Public URL path, e.g. "/images/library/travel-kyoto-pavilions.jpg")
├── filename: String (Safe alphanumeric filename)
├── categorySlug: String ('architecture' | 'travel' | 'art' | 'food')
├── title: String (Curatorial title describing the subject)
├── alt: String (Descriptive accessibility text for screen readers)
├── photographer: String (Full creator name, e.g. "Su San Lee")
├── sourceName: String ('Unsplash' | 'Pexels' | 'Wikimedia' | 'Commissioned' | 'Internal')
├── sourceUrl: String (Canonical page link to the original work)
├── licenseType: String ('Unsplash License' | 'Pexels License' | 'CC0' | 'Editorial Rights')
├── licenseUrl: String (Official license text URL)
├── licenseVerifiedAt: ISO String (Audit verification timestamp)
├── width: Integer (Pixel width, e.g. 1200)
├── height: Integer (Pixel height, e.g. 801)
├── mimeType: String ('image/jpeg' | 'image/png' | 'image/webp')
├── fileSize: Integer (Byte length)
├── isOriginal: Boolean (true for baseline founding assets; protected)
├── isApproved: Boolean (true once reviewed by chief editor/admin)
└── createdAt: ISO String (Creation date)
```

---

## 4. Ingestion & Quality Validation Workflow

1. **Pre-Ingestion Screening**:
   - Check resolution: Minimum 1200px width on long edge for editorial cards, 1920px for hero banners.
   - Quality check: Zero compression artifacts, proper exposure, coherent color temperature matching PRISM's warm Ivory/Charcoal tone.
2. **Duplicate Detection**:
   - Compare byte length, dimensions, and MD5 file hashes before saving to prevent duplicate uploads.
3. **Local Self-Hosting**:
   - High-resolution master saved into `/public/images/library/` (for curated system assets) or `/public/images/uploads/` (for admin staff uploads).
4. **Editorial Approval Gate**:
   - Assets are marked `isApproved: false` upon initial upload until verified by an administrator. Only approved assets can be linked as primary monograph covers.
