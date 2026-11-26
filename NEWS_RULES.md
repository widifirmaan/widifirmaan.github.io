# News Rules

Aturan ini wajib dipakai oleh AI, CLI, maupun skrip apa pun yang membuat, menerjemahkan, mengedit, atau mempublikasikan artikel pada feed dan halaman berita di proyek ini.

## Gaya Penulisan (Article Writing Style)

- Gunakan bahasa jurnalistik: jelas, faktual, dinamis, aktif, dan langsung pada poin inti.
- Lakukan riset langsung ke sumber primer sebelum menulis (situs resmi proyek, repositori GitHub, README, dokumentasi, serta catatan rilis resmi). Dilarang menyimpulkan sesuatu tanpa bukti riset.
- Tautan referensi pihak ketiga yang dipakai hanya sebagai konteks riset tidak perlu dimasukkan ke isi artikel maupun field `url` apabila sumber primer resmi tersedia.
- Paragraf pembuka (`lead`) harus langsung menyatakan masalah, kemampuan inti, atau nilai praktis proyek tanpa mengulang redaksi judul.
- Gunakan 3 sampai 5 subjudul `##` yang deskriptif dan spesifik per topik, disusun dengan paragraf mengalir atau daftar kalimat bernas.
- Hindari format daftar berlabel bold kaku (`- **Label:** keterangan...`) dan hindari filler generik ("Di era digital...", "Penting untuk dicatat...", "Kesimpulannya...").
- Sertakan minimal 1 fenced code block dengan language tag yang sesuai (misalnya perintah instalasi resmi per OS, cara menjalankan aplikasi, atau contoh kode praktik di platform); isi code block harus benar, ringkas, relevan, dan dijelaskan singkat di bawah blok kode.
- **Tutorial Install/Pakai Resmi, Bukan Kompilasi**: Panduan pengguna wajib mengikuti instruksi instalasi dan penggunaan resmi dari README atau halaman Releases repositori (misalnya paket installer Windows/macOS/Linux, package manager resmi, rilis `.zip`/`.dmg`/`.msi`/`.AppImage`, atau langsung memakai URL aplikasi web produksi). Hindari mewajibkan pembaca melakukan build/kompilasi source code (`cargo run`, `./build.sh`, `npm run build`) kecuali proyek tersebut memang library atau tool developer yang belum menyediakan paket rilis.
- **Tutorial Lintas OS**: Untuk proyek multi-platform (Web, Windows, macOS, Linux), contoh tutorial, instalasi, dan perintah CLI dilarang hanya mengkhususkan satu sistem operasi. Sajikan langkah yang setara untuk semua OS yang didukung (atau gunakan perintah universal), kecuali proyek tersebut memang khusus satu platform.
- **Copywriting Berbasis Nilai (Product-First)**: Fokus pada masalah pembaca, manfaat nyata fitur, pengalaman pemakaian, serta ajakan langsung (CTA faktual ke aplikasi produksi atau repo resmi) alih-alih sekadar menumpuk nama file internal proyek; hindari buzzword hype kosong.
- Dilarang menggunakan emoji.
- Dilarang pola tanda hubung panjang (`—`) maupun `--` sebagai tanda baca jeda di dalam teks prosa (tanda `--` hanya sah di dalam code block atau inline command CLI). Gunakan koma, titik, atau pisahkan menjadi dua kalimat.
- Dilarang mengarang pengalaman pribadi, nama klien, pemberi kerja, kutipan, metrik, atau hasil uji tanpa sumber terverifikasi. Jangan menulis "sebagai AI" atau menyinggung prompt internal.
- Terapkan **transcreation**, bukan terjemahan kaku kata demi kata: versi `id`, `en`, dan `zh` wajib memakai alur kalimat alami di masing-masing bahasa, sementara nama proyek, perintah CLI, path file, simbol kode, angka benchmark, dan versi rilis harus konsisten di semua bahasa.

## Aturan Translasi dan Performa Web

- Bahasa yang didukung: `id` (Bahasa Indonesia sebagai default utama), `en` (English), dan `zh` (Simplified Chinese).
- Setiap artikel baru maupun pembaruan besar wajib menyertakan ketiga bahasa (`id` pada root artikel, serta `en` dan `zh` pada `locales`).
- **Pemisahan ketat dari translator global (`translations.js`)**: dilarang menggabungkan judul, ringkasan (`excerpt`), atau isi artikel (`body`) ke `translations.js`. File `translations.js` khusus menampung label UI antarmuka (navbar, hero/about homepage, label tombol/status halaman berita, dan footer) agar halaman utama tidak ikut lambat.
- **Lazy-load per bahasa untuk feed dinamis**:
  - Data utama `id` disimpan terpecah pada `news/data/manifest.json` dan `news/data/chunks/chunk-XXXX.json` (hanya ringkasan tanpa `body`).
  - Bahasa tambahan (`en`, `zh`) hanya menyimpan ringkasan feed di `news/data/i18n/<lang>/chunks/chunk-XXXX.json` tanpa menduplikasi file `articles/` per bahasa; isi artikel lengkap lintas bahasa tetap tersimpan tunggal pada `news/data/articles/<slug>.json`.
  - Pengunjung hanya mengunduh chunk bahasa yang sedang aktif; saat mengganti bahasa di `/news/`, hanya chunk bahasa tujuan yang diambil secara lazy.
- Pada halaman artikel statis, tombol bahasa (`ID` / `EN` / `中`) mengarahkan browser ke halaman statis khusus bahasa tersebut sehingga tiap halaman HTML hanya membawa 1 bahasa aktif dengan ukuran muat minimum.

## SEO Multibahasa dan Kategori

- `category` wajib diisi dan hanya boleh salah satu dari: `Backend`, `Frontend`, `DevOps`, `Database`, `Security`, `Performance`, `Tooling`, `AI`, `Open Source`.
- Struktur URL kanonik per bahasa bersifat tetap:
  - Bahasa Indonesia (`id`, sekaligus `x-default`): `/news/` dan `/news/<slug>/`
  - Bahasa Inggris (`en`): `/en/news/` dan `/en/news/<slug>/`
  - Bahasa Mandarin Sederhana (`zh`): `/zh/news/` dan `/zh/news/<slug>/`
- `slug` wajib kebab-case Inggris ASCII, pendek, deskriptif, unik, dan stabil di semua versi bahasa (jangan ubah slug setelah terbit kecuali dengan keputusan redirect eksplisit).
- Panjang `title` (spesifik, memuat topik utama secara alami, tanpa clickbait atau penomoran): `id` dan `en` maksimal 80 karakter; `zh` disarankan 18 sampai 45 karakter.
- Panjang `excerpt` (meta description yang menjelaskan manfaat nyata): `id` dan `en` 120 sampai 200 karakter; `zh` 60 sampai 110 karakter.
- Panjang `body`: `id` dan `en` 500 sampai 900 kata Markdown; `zh` sepadan secara substansi (sekitar 800 sampai 2200 karakter Han dengan kelengkapan bagian yang sama).
- `date` wajib berformat `YYYY-MM-DD`; `publishedAt` (ISO-8601 timestamp) disarankan untuk menjaga urutan artikel terbaru di hari yang sama agar tidak terurut alfabetis terbalik.
- `url` bersifat opsional dengan format `https://` menuju sumber resmi primer.
- Dilarang keyword stuffing; gunakan istilah teknis yang benar-benar dibahas di dalam isi artikel.
- Setiap halaman HTML statis per bahasa yang dihasilkan `node scripts/build-pages.mjs` (ke `_site/` via `.github/workflows/deploy-pages.yml`) wajib memiliki:
  - `<html lang="id|en|zh">` dan metadata `<title>` / `<meta name="description">` sesuai bahasa halaman.
  - Self-referencing `<link rel="canonical">`.
  - Tag `<link rel="alternate" hreflang="id|en|zh|x-default">` dua arah hanya untuk bahasa yang tersedia pada URL tersebut.
  - Tag Open Graph (`og:locale`, `og:locale:alternate`, `og:image`), Twitter Card, serta JSON-LD `TechArticle` (atau `CollectionPage`) dengan `inLanguage` sesuai bahasa halaman.
  - `sitemap.xml` dengan daftar `<xhtml:link rel="alternate" hreflang="...">` untuk setiap URL terindeks.

## Struktur Data Artikel

```json
{
  "id": "news-<slug>",
  "title": "Judul Bahasa Indonesia",
  "slug": "kebab-case",
  "date": "YYYY-MM-DD",
  "category": "Backend|Frontend|DevOps|Database|Security|Performance|Tooling|AI|Open Source",
  "excerpt": "Ringkasan meta description Bahasa Indonesia",
  "images": ["/news/assets/file.webp"],
  "badges": [],
  "body": "Markdown Bahasa Indonesia",
  "locales": {
    "en": {
      "title": "English Title",
      "excerpt": "English meta description summary.",
      "body": "English Markdown body"
    },
    "zh": {
      "title": "简体中文标题",
      "excerpt": "简体中文摘要描述。",
      "body": "简体中文 Markdown 正文"
    }
  },
  "url": "https://...",
  "source": "ai|manual",
  "model": "nama-model-jika-ai"
}
```

## Media dan Watermark

- **Search image, don't create**: cari dan gunakan gambar, foto, atau screenshot asli dari sumber resmi yang izinnya jelas (repositori resmi, dokumentasi resmi, rilis proyek, atau press kit). Dilarang men-generate gambar AI baru atau membuat ilustrasi/kolase buatan.
- **Wajib upload gambar untuk tutorial, compare, dan kebutuhan visual lainnya**: apabila artikel berita berisi langkah tutorial (tampilan launcher, IDE, setup, konfigurasi UI), perbandingan (`compare`, misalnya before/after, mode `Original` vs `HD`, grid vs table, dua tool/fitur), grafik benchmark, atau penjelasan antarmuka yang membutuhkan bukti visual, penulis/AI/CLI wajib mengunggah gambar nyata yang relevan untuk bagian tersebut. Jangan hanya menaruh 1 gambar hero di pembuka jika isi tutorial atau perbandingan membutuhkan gambar penjelas.
- Letakkan setiap gambar pendukung di bawah subjudul `##` yang relevan pada seluruh edisi bahasa (`id`, `en`, dan `zh`) dengan teks `alt` deskriptif sesuai bahasa halaman, serta cantumkan seluruh path gambar pada field `images` di JSON artikel.
- Gambar atau video artikel disimpan di `news/assets/` di repo (disarankan format WebP) dengan nama file kebab-case yang deskriptif.
- Semua gambar raster artikel (termasuk gambar tambahan untuk tutorial/compare dan upload lewat `POST /api/media`) wajib diberi watermark standar `news/assets/watermark.png` (1 teks `widifirmaan.web.id` transparan tepat di tengah gambar, tanpa pengulangan pola atau badge sudut) melalui `node scripts/apply-watermark.mjs <input> [output]`.
- Dilarang mengunggah gambar tanpa watermark, gambar hasil generate AI, gambar dengan overlay UI pihak ketiga (seperti player YouTube/watermark situs lain), atau screenshot sensitif.
- **Audit media wajib**: sebelum publish, pastikan setiap gambar benar-benar tersimpan di `news/assets/` (atau diproses saat build Issue), ber-watermark `widifirmaan.web.id`, konsisten across `id`/`en`/`zh`, tampil proporsional di mobile (`320px`) sampai desktop (`1280px`), dan lolos `npm run audit:news`.

## API Lokal, Mode Zero-Push (GitHub Issues), dan Penyimpanan Sharded

- **Mode Zero-Push lewat GitHub Issues**: Untuk menerbitkan artikel baru tanpa `git commit` atau `git push` file ke branch `master`, buat Issue memakai template `.github/ISSUE_TEMPLATE/news-article.md`, tempel/drag screenshot langsung ke editor Issue, lalu pasang label `news:published`.
  - Hanya Issue buatan pemilik repositori (`github.repository_owner`) dengan label `news:published` yang diproses oleh `scripts/sync-issue-articles.mjs` di workflow `.github/workflows/deploy-pages.yml`.
  - Screenshot yang diunggah ke Issue otomatis diunduh saat build, diberi 1 watermark `widifirmaan.web.id` transparan di tengah lewat `scripts/apply-watermark.mjs`, dan masuk ke `_site/news/assets/`.
  - Mengubah isi Issue otomatis memperbarui situs, sedangkan mencabut label `news:published` menghapus artikel dari hasil build.
- **Mode Repo & API Lokal**:
  - CRUD artikel lokal: `node scripts/news-api.mjs` (`GET/POST/PUT/DELETE /api/articles`), upload media ke `news/assets/` lewat `POST /api/media`.
  - File sumber tunggal artikel per slug tersimpan di `news/data/articles/<slug>.json` (memuat `id` serta `locales.{en,zh}`), sedangkan `news.json` menyimpan cerminan maksimal 50 artikel untuk kompatibilitas CMS lokal `news/audit/`.
  - File indeks turunan (`news/data/manifest.json`, `news/data/chunks/`, `news/data/i18n/`) tidak lagi perlu di-commit ke Git (masuk `.gitignore`) dan langsung dibuat bersih ke `_site/news/data/` saat `node scripts/build-pages.mjs` berjalan (lokal maupun di GitHub Actions).
  - Setelah menambah atau mengubah file artikel di repo, cukup jalankan `node scripts/build-pages.mjs` untuk memverifikasi `_site/` lalu commit/push file sumber artikel (`news/data/articles/` + aset baru) tanpa membengkakkan diff dengan file turunan; jangan commit `_site/`, `.build-issues/`, atau `news/audit/`.

## Checklist Sebelum Publish

- [ ] Tersedia versi `id`, `en`, dan `zh` yang alami (transcreation, bukan terjemahan kaku), dan isi artikel tidak dicampur ke `translations.js`.
- [ ] Tidak ada emoji, tidak ada em dash (`—`), dan tidak ada pola `--` di luar code block.
- [ ] Bahasa jurnalistik, dinamis, faktual, hasil riset sumber primer tanpa mengarang klaim.
- [ ] Tidak menyertakan tautan blog pihak ketiga jika sumber resmi primer tersedia.
- [ ] Slug kebab-case Inggris konsisten, tanggal valid (`YYYY-MM-DD`), kategori masuk daftar resmi (`Open Source`, `Tooling`, dll.).
- [ ] Judul dan excerpt memenuhi batas karakter SEO untuk setiap bahasa tanpa clickbait atau keyword stuffing.
- [ ] Gambar berasal dari pencarian sumber resmi/terverifikasi (bukan hasil generate/create) dan memakai 1 watermark `widifirmaan.web.id` transparan di tengah.
- [ ] Bagian tutorial, perbandingan (`compare`), UI, atau konsep yang membutuhkan visual sudah dilengkapi gambar nyata terunggah di `news/assets/`, ditempatkan pada subjudul relevan di `id`, `en`, dan `zh`, serta terdaftar di `images[]`.
- [ ] `npm run audit:news` dan `node scripts/build-pages.mjs` lulus tanpa error, menghasilkan halaman `id`, `en`, `zh`, tag `canonical` + `hreflang`, dan `sitemap.xml` dengan seluruh gambar valid dan proporsional.
- [ ] `source` dan `model` terisi untuk konten AI.
