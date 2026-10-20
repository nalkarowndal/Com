# PRISM Search Engine & Discovery Architecture (`/search`)

## 1. System Architecture

The PRISM Search page allows visitors to discover articles, monographs, and authors across the entire platform. Rather than using an artificial client-only filter, the search engine connects directly to the Node.js REST API (`GET /api/search`).

---

## 2. URL Parameter Synchronization

Every search interaction synchronizes bidirectionally with browser URL search parameters:

- Query: `/search?q=concrete`
- Query with discipline filter: `/search?q=design&category=art`
- Paginated results: `/search?q=modern&page=2`

### Benefits:
- Direct link sharing of curated search queries.
- Browser back/forward navigation correctly restores previous search criteria.
- Bookmarkable search states.

---

## 3. Backend Query Pipeline

In `server/src/repositories/content.repository.js`, search terms are matched against:
1. `article.title` (Case-insensitive substring match)
2. `article.excerpt` (Lead summary matching)
3. `article.content` (Full monograph narrative matching)
4. `article.tags` (Keyword taxonomy matching)
5. `article.author` (Curator/photographer matching)

### Database Query Syntax:
In PostgreSQL mode:
```sql
SELECT * FROM articles
WHERE (
  title ILIKE $1 OR
  excerpt ILIKE $1 OR
  content ILIKE $1 OR
  tags ILIKE $1 OR
  author ILIKE $1
)
AND ($2 = 'all' OR category_slug = $2)
ORDER BY published_at DESC
LIMIT $3 OFFSET $4;
```

---

## 4. UI States & Feedback

1. **Active Searching**: Shows loading spinner.
2. **Result Count Status**: Displays exact tally (e.g. `Found 2 articles for "concrete" in ARCHITECTURE`).
3. **Empty State**: Renders clean SVG iconography and helpful suggested queries (e.g., "Urban Strorkes", "Concrete", "Kyoto").
4. **Pagination**: Numerical page buttons with active state and smooth scroll-to-top behavior.
