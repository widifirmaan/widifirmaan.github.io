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

## SEO dan Kategori

- `category` wajib diisi dan hanya boleh salah satu: `Backend`, `Frontend`, `DevOps`, `Database`, `Security`, `Performance`, `Tooling`, `AI`.
- `title` harus memuat topik utama secara alami; hindari clickbait, hindari judul duplikat.
- `excerpt` berfungsi sebagai meta description: 120-200 karakter, ringkas, menjelaskan manfaat/hasil yang didapat pembaca.
- `slug` wajib kebab-case Inggris, pendek, deskriptif, unik, dan stabil (jangan diubah setelah dipublikasikan kecuali ada redirect/keputusan eksplisit).
- `date` wajib format `YYYY-MM-DD` dan mencerminkan tanggal publikasi/update yang valid.
- `url` opsional untuk sumber eksternal; jika diisi harus `https://` valid dan relevan.
- Gambar di `images[]` harus punya konteks di artikel; gunakan nama file deskriptif kebab-case sebelum upload/watermark.
- Jangan keyword stuffing. Gunakan istilah teknis yang memang dibahas di body.
- Jika artikel punya halaman statis tersendiri di masa depan, halaman itu wajib punya canonical, meta title/description, Open Graph/Twitter card, dan structured data `Article`/`TechArticle`.
- Saat menambah/mengubah halaman publik yang dapat diindeks, perbarui `sitemap.xml` (`<loc>`, `<lastmod>`, `<changefreq>`, `<priority>` sesuai halaman). Feed `/news/` tetap ada di sitemap.

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

## API Lokal dan Penyimpanan Sharded

- CRUD artikel: `node scripts/news-api.mjs` (`GET/POST/PUT/DELETE /api/articles`).
- Upload media base64: `POST /api/media` menyimpan ke `news/assets/` dan mengembalikan path repo.
- Penyimpanan publik memakai skema sharded di `news/data/` (`manifest.json`, `chunks/chunk-XXXX.json` berisi ringkasan tanpa `body` dengan nomor tertinggi sebagai terbaru, dan `articles/<slug>.json` berisi artikel lengkap untuk lazy load), sementara `news.json` menyimpan cerminan maksimal 50 artikel terbaru untuk kompatibilitas CMS lokal dan fallback.
- Jalankan `node scripts/news-store.mjs --rebuild` bila perlu menyinkronkan ulang `news/data/` dari `news.json`.
- Setelah upload media dan update feed (`news.json` + `news/data/`), commit dan push file terkait ke GitHub.

## Checklist Sebelum Publish

- [ ] Tidak ada emoji.
- [ ] Tidak ada em dash / pola tanda hubung khas AI.
- [ ] Bahasa jurnalistik, faktual, tidak mengada-ada.
- [ ] Slug unik, tanggal valid, kategori valid.
- [ ] Title/excerpt memenuhi aturan SEO, tidak clickbait, tidak keyword stuffing.
- [ ] `sitemap.xml` diperbarui jika ada halaman publik baru/perubahan URL yang dapat diindeks.
- [ ] Gambar memiliki watermark WDPORT.
- [ ] `source` dan `model` terisi untuk konten AI.
