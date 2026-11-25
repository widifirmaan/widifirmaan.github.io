# News Article API

API lokal sederhana untuk CRUD `news.json`. Artikel dibuat/diedit oleh AI CLI atau tool lain; API ini hanya mengelola data.

## Jalankan

```bash
node scripts/news-api.mjs
# optional
PORT=8787 HOST=127.0.0.1 NEWS_API_TOKEN=secret node scripts/news-api.mjs
```

Jika `NEWS_API_TOKEN` diset, kirim header `Authorization: Bearer <token>`.

## Endpoint

- `GET /api/articles` - list semua artikel
- `GET /api/articles/:id` - detail by `id` atau `slug`
- `POST /api/articles` - buat artikel
- `PUT /api/articles/:id` - update by `id` atau `slug`
- `DELETE /api/articles/:id` - hapus by `id` atau `slug`

## Contoh

```bash
curl http://127.0.0.1:8787/api/articles

curl -X POST http://127.0.0.1:8787/api/articles \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"Fix N+1 Query",
    "slug":"fix-n1-query",
    "date":"2026-11-25",
    "category":"Backend",
    "excerpt":"Gunakan batch fetching.",
    "body":"## Masalah\n...",
    "source":"ai",
    "model":"gemini-2.5-flash"
  }'

curl -X PUT http://127.0.0.1:8787/api/articles/fix-n1-query \
  -H 'Content-Type: application/json' \
  -d '{"excerpt":"Ringkasan diperbarui"}'

curl -X DELETE http://127.0.0.1:8787/api/articles/fix-n1-query
```

## Format item

```json
{
  "id": "news-fix-n1-query",
  "title": "Fix N+1 Query",
  "slug": "fix-n1-query",
  "date": "2026-11-25",
  "category": "Backend",
  "excerpt": "...",
  "images": [],
  "badges": [],
  "body": "markdown",
  "url": "",
  "source": "ai",
  "model": "gemini-2.5-flash"
}
```

API menulis `news.json` dengan `lastUpdated`, `total`, dan `items` terurut desc by date.
