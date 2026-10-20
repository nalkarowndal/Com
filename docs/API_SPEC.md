# REST API 명세서 (API_SPEC.md)

프로젝트: `company` (PRISM)  
기본 Base URL: `http://localhost:4000/api`  
Content-Type: `application/json; charset=utf-8`

---

## 1. 표준 응답 규격 (Standard Response Envelope)

### 성공 응답 (200, 201)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-20T10:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### 오류 응답 (400, 401, 403, 404, 500)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "사용자 친화적 오류 메시지",
    "details": null
  },
  "meta": {
    "timestamp": "2026-10-20T10:00:00.000Z"
  }
}
```

---

## 2. 공개 API (Public Endpoints)

### 2.1 `GET /api/health`
- **설명**: 서버 상태 및 스토리지 연결 엔진 상태 확인.
- **응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptimeSeconds": 124.5,
    "storage": {
      "engine": "postgres",
      "connected": true
    },
    "timestamp": "2026-10-20T10:00:00.000Z"
  }
}
```

### 2.2 `GET /api/site`
- **설명**: 사이트 전역 메타데이터 및 설정 정보 반환.
- **응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "siteName": "company",
    "brand": {
      "name": "PRISM",
      "logoSrc": "/images/logo.png",
      "logoAlt": "Logo"
    },
    "copyright": "2026 Green Systems Incorporated. All rights reserved.",
    "footerDescription": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, necessitatibus!"
  }
}
```

### 2.3 `GET /api/home`
- **설명**: 메인 페이지 렌더링에 필요한 모든 종합 데이터(헤더 네비게이션, 히어로 아티클, 추천 카드 2종, 갤러리 4종, 푸터)를 단일 쿼리로 신속하게 반환.
- **응답 (200 OK)**:
```json
{
  "success": true,
  "data": {
    "site": {
      "name": "company",
      "logoSrc": "/images/logo.png",
      "logoAlt": "Logo"
    },
    "navigation": [
      { "id": "nav-1", "label": "Architecture", "href": "#", "order": 1 },
      { "id": "nav-2", "label": "Travel", "href": "#", "order": 2 },
      { "id": "nav-3", "label": "Art", "href": "#", "order": 3 },
      { "id": "nav-4", "label": "Food", "href": "#", "order": 4 }
    ],
    "hero": {
      "id": "hero-urban-strorkes",
      "slug": "urban-strorkes",
      "badge": "Editor's Choice",
      "author": "Sebastian Weiss",
      "title": "Urban Strorkes",
      "buttonText": "Read More",
      "imageSrc": "/images/hero.jpg"
    },
    "cards": [
      {
        "id": "card-1",
        "variant": "tan",
        "title": "Inspring Reads",
        "description": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus",
        "buttonText": "Read More",
        "link": ""
      },
      {
        "id": "card-2",
        "variant": "dark",
        "title": "Reflections",
        "description": "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus",
        "buttonText": "Read More",
        "link": ""
      }
    ],
    "gallery": [
      { "id": "gal-1", "src": "/images/gallery-1.jpg", "alt": "gallery-1.jpg", "order": 1 },
      { "id": "gal-2", "src": "/images/gallery-2.jpg", "alt": "gallery-2.jpg", "order": 2 },
      { "id": "gal-3", "src": "/images/gallery-3.jpg", "alt": "gallery-3.jpg", "order": 3 },
      { "id": "gal-4", "src": "/images/gallery-4.jpg", "alt": "gallery-4.jpg", "order": 4 }
    ],
    "footer": {
      "copyright": "2026 Green Systems Incorporated. All rights reserved.",
      "description": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, necessitatibus!"
    }
  }
}
```

### 2.4 `GET /api/categories`
- **설명**: 네비게이션 카테고리 목록 반환.
- **응답 (200 OK)**:
```json
{
  "success": true,
  "data": [
    { "id": "arch", "slug": "architecture", "name": "Architecture", "order": 1 },
    { "id": "travel", "slug": "travel", "name": "Travel", "order": 2 },
    { "id": "art", "slug": "art", "name": "Art", "order": 3 },
    { "id": "food", "slug": "food", "name": "Food", "order": 4 }
  ]
}
```

### 2.5 `GET /api/articles` & `GET /api/articles/:slug`
- **설명**: 아티클 목록 및 단일 아티클 상세 정보 반환 (`:slug` = `'urban-strorkes'`).

### 2.6 `GET /api/gallery`
- **설명**: 갤러리 이미지 4점 목록 반환.

---

## 3. 관리자 API (Admin Endpoints)

### 3.1 `POST /api/admin/login`
- **요청 바디**:
```json
{
  "username": "admin",
  "password": "SecurePassword123!"
}
```
- **응답 (200 OK)**:
  - `Set-Cookie`: `token=...; HttpOnly; SameSite=Strict; Path=/`

### 3.2 `POST /api/admin/logout`
- **응답 (200 OK)**: 쿠키 삭제.

### 3.3 `POST /api/admin/articles` & `PATCH /api/admin/articles/:id`
- **인증**: 쿠키 또는 Bearer 토큰 필수.
- **설명**: 아티클 수정 및 생성 (감사 로그 자동 기록).

### 3.4 `POST /api/admin/media`
- **인증**: 관리자 권한 필수.
- **설명**: 미디어 자산 등록/수정.
