# PRISM Backend Expansion & API Architecture

## 1. Node.js & Express Architecture

The backend operates on Node.js v24.x and Express with clean layered architecture:

```text
server/
  ├── src/
  │    ├── server.js               (HTTP bootstrap & port listener)
  │    ├── app.js                  (Express application, middleware, CORS, routes)
  │    ├── config/                 (env.js, database.js)
  │    ├── controllers/            (content.controller.js, admin.controller.js)
  │    ├── services/               (content.service.js, auth.service.js)
  │    ├── repositories/           (content.repository.js - Dual PostgreSQL / JSON)
  │    ├── middleware/             (auth.middleware.js, errorHandler.js)
  │    └── routes/                 (api.routes.js)
  ├── db/
  │    ├── migrations/             (001_initial_schema.sql, 002_multipage_extension.sql)
  │    ├── seeds/                  (002_multipage_content.json)
  │    └── persistent_data.json    (Local persistent storage fallback)
  └── tests/
       └── api.test.js             (11 Automated integration test scenarios)
```

---

## 2. API Contract & Endpoints Master Register

### 2.1 Public Editorial Endpoints

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/health` | Health telemetry & storage engine status | None |
| `GET` | `/api/site` | Global brand name, logo, copyright metadata | None |
| `GET` | `/api/home` | Complete homepage payload matching snapshot | None |
| `GET` | `/api/categories` | List all 4 discipline categories | None |
| `GET` | `/api/categories/:slug` | Category details with associated articles | None |
| `GET` | `/api/articles` | Filtered list of published monographs | `category`, `q`, `page`, `limit`, `sort` |
| `GET` | `/api/articles/:slug` | Full article narrative with related stories | None |
| `GET` | `/api/gallery` | Permanent photographic archive items | `category` |
| `GET` | `/api/search` | Multi-field full text search query | `q`, `category`, `page`, `limit` |

### 2.2 Administrative Endpoints (Protected by JWT)

| Method | Endpoint | Description | Auth Requirement |
|---|---|---|---|
| `POST` | `/api/admin/login` | Authenticates curator and issues JWT | Public (Rate-limited) |
| `POST` | `/api/admin/logout` | Clears authentication session | Public |
| `GET` | `/api/admin/me` | Returns current curator identity | Bearer Token / Cookie |
| `GET` | `/api/admin/stats` | Aggregated articles, views, and categories | Bearer Token / Cookie |
| `POST` | `/api/admin/articles` | Creates a new monograph | Bearer Token / Cookie |
| `PATCH`| `/api/admin/articles/:id`| Updates an existing monograph | Bearer Token / Cookie |
| `DELETE`|`/api/admin/articles/:id`| Deletes an article (core locked) | Bearer Token / Cookie |
| `GET` | `/api/admin/audit-logs` | Retrieves curator audit records | Bearer Token / Cookie |
