# News Article API

API lokal sederhana untuk CRUD feed berita (`news/data/` sharded store dan `news.json` mirror). Artikel dibuat/diedit oleh AI CLI atau tool lain; API ini hanya mengelola data.

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
- `POST /api/media` - upload gambar/video ke `news/assets/` (base64)

## Media (gambar/video)

Body JSON:

```json
{
  "filename": "diagram.png",
  "mimeType": "image/png",
  "data": "<base64 atau data URL>"
}
```

Response berisi `path` (`/news/assets/...`) dan `raw` GitHub raw URL. Setelah file di-commit/push, gunakan `path` atau `raw` di `images`/konten artikel.

## Contoh artikel

```bash
curl -X POST http://127.0.0.1:8787/api/articles \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"Fix N+1 Query",
    "slug":"fix-n1-query",
    "date":"2026-11-25",
    "category":"Backend",
    "excerpt":"Gunakan batch fetching.",
    "body":"## Masalah\n...",
    "images":["/news/assets/diagram-abc123.png"],
    "source":"ai",
    "model":"gemini-2.5-flash"
  }'
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

API menulis penyimpanan sharded di `news/data/` (`manifest.json`, `chunks/chunk-XXXX.json` tanpa `body`, dan `articles/<slug>.json`) serta menulis cerminan terbaru (maksimal 50 item) ke `news.json` terurut desc by date.
