# PRISM Media Asset Management API Specification

## 1. Overview
This specification details all REST API endpoints for the PRISM Media Management System, supporting public editorial delivery and authenticated administrative management.

All responses follow the standard PRISM JSON envelope format:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-10-21T00:00:00.000Z" }
}
```

---

## 2. Public Endpoints

### 2.1 Get Media Assets
- **URL**: `GET /api/media`
- **Auth**: None
- **Query Parameters**:
  - `category` (optional, string): Filter by category slug (`architecture`, `travel`, `art`, `food`)
  - `search` (optional, string): Search query against title, alt text, photographer
  - `page` (optional, integer, default: `1`)
  - `limit` (optional, integer, default: `50`)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "asset-food-sourdough",
      "src": "/images/library/food-slow-harvest.jpg",
      "filename": "food-slow-harvest.jpg",
      "categorySlug": "food",
      "title": "Rustic Sourdough Crust & Crumb",
      "alt": "Freshly baked artisan sourdough loaf showing open crumb structure",
      "photographer": "Wesual Click",
      "sourceName": "Unsplash Curated",
      "sourceUrl": "https://unsplash.com/photos/9lqGSjmWBbg",
      "licenseType": "Unsplash License",
      "width": 1200,
      "height": 798,
      "mimeType": "image/jpeg",
      "fileSize": 184500,
      "isOriginal": false,
      "isApproved": true
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 14, "totalPages": 1 }
}
```

---

## 3. Administrative Endpoints (Protected by JWT)

All administrative endpoints require the header `Authorization: Bearer <token>`.

### 3.1 List All Media Assets
- **URL**: `GET /api/admin/media`
- **Query Parameters**: `category`, `search`, `isApproved`, `isOriginal`, `page`, `limit`
- **Response**: `200 OK` with paginated media assets.

### 3.2 Get Media Asset Details (with Usage Relations)
- **URL**: `GET /api/admin/media/:id`
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "asset-food-sourdough",
    "src": "/images/library/food-slow-harvest.jpg",
    "title": "Rustic Sourdough Crust & Crumb",
    "usage": {
      "articles": [
        { "id": "art-food-sourdough", "slug": "sourdough-heritage", "title": "Sourdough Heritage: The Microbiology of Ancient Loaves" }
      ],
      "categories": [],
      "gallery": [],
      "totalUsage": 1
    }
  }
}
```

### 3.3 Upload Media Asset
- **URL**: `POST /api/admin/media/upload` (or `POST /api/admin/media`)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file` (binary, max 10MB)
  - `categorySlug` (string)
  - `title` (string)
  - `alt` (string)
  - `photographer` (string)
  - `sourceName` (string)
  - `licenseType` (string)
  - `licenseUrl` (string)
  - `ignoreDuplicate` (boolean, optional)
- **Responses**:
  - `201 Created`: Returns newly created asset record.
  - `400 Bad Request`: Validation failure.
  - `409 Conflict`: `DUPLICATE_MEDIA_DETECTED` with existing matching asset info.

### 3.4 Update Media Asset Metadata
- **URL**: `PUT /api/admin/media/:id`
- **Content-Type**: `application/json`
- **Body**: `{ "title": "...", "alt": "...", "categorySlug": "...", "photographer": "...", "licenseType": "...", "isApproved": true }`
- **Response**: `200 OK` with updated asset.

### 3.5 Delete Media Asset
- **URL**: `DELETE /api/admin/media/:id`
- **Responses**:
  - `200 OK`: `{ "success": true, "data": { "id": "...", "deleted": true } }`
  - `403 Forbidden`: `ORIGINAL_ASSET_PROTECTED` if asset is one of the 5 baseline assets (`isOriginal: true`).
  - `404 Not Found`: Media not found.

### 3.6 Check For Duplicates
- **URL**: `POST /api/admin/media/detect-duplicate`
- **Content-Type**: `application/json`
- **Body**: `{ "filename": "sample.jpg", "fileSize": 12345 }`
- **Response**: `200 OK`
```json
{
  "success": true,
  "isDuplicate": true,
  "match": { "id": "asset-hero", "title": "Urban Strorkes Facade Geometry" }
}
```

### 3.7 Intelligent Media Recommendation
- **URL**: `GET /api/admin/media/recommend`
- **Query Parameters**:
  - `categorySlug` (string)
  - `title` (string)
  - `tags` (string)
  - `content` (string excerpt)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "asset": {
        "id": "asset-food-sourdough",
        "title": "Rustic Sourdough Crust & Crumb",
        "src": "/images/library/food-slow-harvest.jpg",
        "categorySlug": "food"
      },
      "score": 40,
      "matchReason": "Category match (food); Matched keywords: sourdough"
    }
  ]
}
```

### 3.8 Rollback Entity Media to Baseline
- **URL**: `POST /api/admin/media/rollback`
- **Content-Type**: `application/json`
- **Body**: `{ "targetType": "article", "targetId": "art-food-sourdough" }`
- **Response**: `200 OK` (resets article imageSrc back to `/images/hero.jpg` and logs audit entry).
