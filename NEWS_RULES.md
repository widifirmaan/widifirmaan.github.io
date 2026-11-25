# News Rules

Aturan ini wajib dipakai oleh AI/CLI/script apa pun yang membuat, mengedit, atau mempublikasikan artikel di folder/news feed proyek ini.

## Gaya Penulisan

- Gunakan bahasa jurnalistik: jelas, faktual, ringkas, aktif, dan terverifikasi.
- Dilarang menggunakan emoji.
- Dilarang pola tanda hubung panjang khas AI (`—`, `--` sebagai pengganti kalimat). Gunakan koma, titik, atau pisahkan kalimat.
- Dilarang filler generik: "Di era digital...", "Penting untuk dicatat...", "Kesimpulannya..." tanpa isi konkret.
- Dilarang klaim palsu: pengalaman pribadi, klien, employer, metrik, benchmark, kutipan, atau "sudah diuji" jika tidak ada bukti.
- Jangan menulis "sebagai AI" atau menyebut prompt internal.
- Judul spesifik, maksimal 80 karakter, tanpa clickbait/no numbering.
- Excerpt 120-200 karakter, menjelaskan manfaat nyata.
- Body 500-900 kata Markdown, minimal 3 subjudul `##`, minimal 1 fenced code block dengan language tag.
- Kode harus minimal, benar, dan relevan. Jelaskan kode.

## Struktur Data Artikel

```json
{
  "id": "news-<slug>",
  "title": "...",
  "slug": "kebab-case",
  "date": "YYYY-MM-DD",
  "category": "Backend|Frontend|DevOps|Database|Security|Performance|Tooling|AI",
  "excerpt": "...",
  "images": ["/news/assets/file.png"],
  "badges": [],
  "body": "Markdown",
  "url": "",
  "source": "ai|manual",
  "model": "nama-model-jika-ai"
}
```

## Media dan Watermark

- Gambar/video artikel disimpan di `news/assets/` di repo, lalu di-commit/push agar ter-host di GitHub.
- Semua gambar artikel wajib diberi watermark sebelum publish.
- Gunakan watermark standar: `news/assets/watermark.png`.
- Terapkan watermark: `node scripts/apply-watermark.mjs <input> [output]`.
- Jangan mengunggah gambar tanpa watermark, gambar hak cipta tidak jelas, atau screenshot sensitif.

## API Lokal

- CRUD artikel: `node scripts/news-api.mjs` (`GET/POST/PUT/DELETE /api/articles`).
- Upload media base64: `POST /api/media` menyimpan ke `news/assets/` dan mengembalikan path repo.
- Setelah upload media dan update `news.json`, commit file terkait.

## Checklist Sebelum Publish

- [ ] Tidak ada emoji.
- [ ] Tidak ada em dash / pola tanda hubung khas AI.
- [ ] Bahasa jurnalistik, faktual, tidak mengada-ada.
- [ ] Slug unik, tanggal valid, kategori valid.
- [ ] Gambar memiliki watermark WDPORT.
- [ ] `source` dan `model` terisi untuk konten AI.
