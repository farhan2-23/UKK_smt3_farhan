# Dokumentasi Lengkap Daftar Command CLI: Prisma (v8 & v7) dan Next.js (Terbaru & v12)

Dokumen ini memuat seluruh daftar perintah CLI resmi yang terdaftar pada *Prisma ORM* (arsitektur *Prisma 8 Contract* maupun *Prisma 7/Standar) serta **Next.js* (*Versi Terbaru / App Router* dan *Versi 12 / Pages Router) beserta fungsi dan opsi (*flag) pentingnya.

---

## 1. Daftar Lengkap Command Prisma 8 (Contract-Based CLI)

Prisma 8 memisahkan kompilasi contract, perencanaan migrasi, dan eksekusi database ke dalam kelompok perintah contract, migration, dan db.

### A. Command Utama & Contract (prisma contract)
| Command | Opsi / Flag Penting | Penjelasan |
| :--- | :--- | :--- |
| npx prisma contract emit | --config <path>, --help | Mengompilasi src/prisma/contract.prisma menjadi contract.json dan menghasilkan tipe TypeScript (contract.d.ts). |
| npx prisma --version | -v | Menampilkan versi Prisma 8 CLI, engine, dan informasi environment. |
| npx prisma --help | -h | Menampilkan daftar seluruh kategori perintah yang tersedia pada Prisma 8 CLI. |

### B. Command Perencanaan Migrasi (prisma migration)
| Command | Opsi / Flag Penting | Penjelasan |
| :--- | :--- | :--- |
| npx prisma migration plan | --name <nama>, --from <hash>, --create-only | Menganalisis selisih contract.json dengan database, membuat folder migrasi baru, dan menampilkan preview DDL SQL. |
| npx prisma migration new | --name <nama> | Membuat file migrasi kosong (migration.ts) untuk ditulis secara manual (misalnya mengubah tipe kolom atau constraint). |
| npx prisma migration status | — | Mengecek riwayat dan status migrasi yang sudah diterapkan maupun yang masih tertunda. |

### C. Command Operasi Database (prisma db)
| Command | Opsi / Flag Penting | Penjelasan |
| :--- | :--- | :--- |
| npx prisma db migrate | --advance-ref <ref> (contoh: db) | Mengeksekusi rencana migrasi ke database dan memajukan referensi state database agar sinkron dengan contract. |
| npx prisma db update | — | Menyinkronkan perubahan contract.json langsung ke database tanpa membuat file migrasi (pengganti db push). |
| npx prisma db init | — | Menginisialisasi seluruh tabel dari contract pada database kosong tanpa mengubah tabel yang sudah ada. |
| npx prisma db introspect | — | Membaca struktur tabel database yang sudah ada (pengganti db pull). |
| npx prisma db seed | — | Menjalankan script seeding untuk mengisi data awal ke database. |
| npx prisma db execute | --file <path>, --stdin | Menjalankan perintah SQL mentah secara langsung ke database. |

### D. Bridge Kompatibilitas Prisma 7 di Proyek Prisma 8
| Command | Penjelasan |
| :--- | :--- |
| npm install --save-dev @prisma/prisma7@7 | Memasang CLI Prisma 7 secara berdampingan untuk proyek yang masih menyimpan riwayat migrasi lama Prisma 7. |
| npx prisma7 <command> | Menjalankan perintah migrasi lawas menggunakan CLI Prisma 7 (contoh: npx prisma7 migrate dev). |

---

## 2. Daftar Lengkap Command Prisma 7 / Standar (Semua Subcommand Terdaftar)

Pada Prisma versi standar (v5–v7), seluruh perintah berbasis file prisma/schema.prisma dan terbagi menjadi beberapa kelompok utama: *Root, *migrate*, *db*, *studio*, dan *platform**.

### A. Root & Schema Commands
| Command | Opsi / Flag Penting | Penjelasan |
| :--- | :--- | :--- |
| npx prisma init | --datasource-provider <provider>, --url <url>, --preview-feature <nama>, --output <path>, --with-model | Membuat direktori prisma/schema.prisma dan file .env awal untuk proyek baru. |
| npx prisma generate | --schema <path>, --watch, --data-proxy, --accelerate, --no-engine, --no-hints, --allow-no-models, --sql | Menghasilkan @prisma/client (serta query TypedSQL jika memakai --sql) agar dikenali TypeScript/JavaScript. |
| npx prisma validate | --schema <path>, --config <path> | Memvalidasi sintaks, tipe data, dan relasi antar-model di dalam schema.prisma. |
| npx prisma format | --schema <path>, --check | Merapikan format penulisan, indentasi, dan perataan kolom pada schema.prisma. |
| npx prisma version | -v, --version | Menampilkan versi Prisma CLI, Query Engine, Schema Engine, dan platform OS. |
| npx prisma debug | --schema <path> | Menampilkan informasi diagnostik konfigurasi Prisma dan environment untuk keperluan debugging. |
| npx prisma mcp | — | Menjalankan server Model Context Protocol (MCP) Prisma untuk integrasi AI tools. |

### B. Subcommand prisma migrate (Manajemen Migrasi)
| Command | Opsi / Flag Penting | Penjelasan |
| :--- | :--- | :--- |
| npx prisma migrate dev | --name <nama>, --create-only, --skip-seed, --skip-generate, --schema <path> | Membuat file migrasi SQL baru dari perubahan schema, menerapkannya ke database lokal, dan otomatis menjalankan prisma generate. |
| npx prisma migrate deploy | --schema <path> | Menerapkan seluruh file migrasi yang tertunda ke server production tanpa membuat migrasi baru. |
| npx prisma migrate reset | --force, --skip-seed, --skip-generate, --schema <path> | Menghapus database, membuat ulang dari awal, menjalankan semua migrasi, dan mengeksekusi db seed. |
| npx prisma migrate status | --schema <path> | Memeriksa apakah database sudah sinkron dengan folder prisma/migrations. |
| npx prisma migrate resolve | --applied <nama>, --rolled-back <nama>, --schema <path> | Menandai file migrasi tertentu sebagai sudah diterapkan atau dibatalkan saat terjadi konflik migrasi. |
| npx prisma migrate diff | --from-empty, --from-url, --from-schema-datamodel, --from-migrations, --to-empty, --to-url, --to-schema-datamodel, --to-migrations, --shadow-database-url, --script, --exit-code | Membandingkan dua sumber schema/database dan menghasilkan ringkasan perbedaan atau script SQL DDL-nya. |

### C. Subcommand prisma db (Operasi Database Langsung)
| Command | Opsi / Flag Penting | Penjelasan |
| :--- | :--- | :--- |
| npx prisma db push | --skip-generate, --force-reset, --accept-data-loss, --schema <path> | Mendorong perubahan schema.prisma langsung ke database tanpa membuat riwayat file migrasi. |
| npx prisma db pull | --force, --print, --composite-type-depth <n>, --schema <path> | Melakukan introspection pada database yang sudah ada dan menuliskan modelnya ke schema.prisma. |
| npx prisma db seed | --schema <path> | Mengeksekusi script seeding yang dikonfigurasi pada bagian "prisma": { "seed": "..." } di package.json. |
| npx prisma db execute | --file <path>, --stdin, --url <url>, --schema <path> | Menjalankan perintah SQL secara langsung ke database tanpa melalui schema Prisma. |

### D. Subcommand prisma studio (Database GUI)
| Command | Opsi / Flag Penting | Penjelasan |
| :--- | :--- | :--- |
| npx prisma studio | -p, --port <port>, -b, --browser <nama>, -n, --hostname <host>, --schema <path> | Membuka antarmuka web GUI di browser (http://localhost:5555) untuk melihat, menambah, dan mengedit data tabel. |

### E. Subcommand prisma platform (Prisma Data Platform / Accelerate / Pulse)
| Command | Penjelasan |
| :--- | :--- |
| npx prisma platform auth login | Login ke akun Prisma Data Platform melalui browser. |
| npx prisma platform auth logout | Keluar dari sesi akun Prisma Data Platform di CLI. |
| npx prisma platform auth show | Menampilkan informasi akun Prisma Data Platform yang sedang aktif. |
| npx prisma platform workspace show | Menampilkan daftar workspace yang tersedia pada akun. |
| npx prisma platform project create | Membuat proyek baru di Prisma Data Platform. |
| npx prisma platform project show | Menampilkan daftar proyek dalam workspace. |
| npx prisma platform project delete | Menghapus proyek dari Prisma Data Platform. |
| npx prisma platform environment create | Membuat environment baru (misalnya staging atau production) di dalam proyek. |
| npx prisma platform environment show | Menampilkan daftar environment pada proyek. |
| npx prisma platform environment delete | Menghapus environment tertentu dari proyek. |
| npx prisma platform apikey create | Membuat API key baru untuk koneksi layanan Prisma. |
| npx prisma platform apikey show | Menampilkan daftar API key yang aktif. |
| npx prisma platform apikey delete | Mencabut/menghapus API key tertentu. |
| npx prisma platform accelerate enable | Mengaktifkan fitur connection pooling & caching (Prisma Accelerate) pada environment. |
| npx prisma platform accelerate disable | Menonaktifkan layanan Prisma Accelerate. |
| npx prisma platform pulse enable | Mengaktifkan layanan real-time database events (Prisma Pulse). |
| npx prisma platform pulse disable | Menonaktifkan layanan Prisma Pulse. |
| npx prisma platform serviceToken create | Membuat service token untuk otomasi CI/CD. |
| npx prisma platform serviceToken show | Menampilkan daftar service token yang tersedia. |
| npx prisma platform serviceToken delete | Menghapus service token. |

---

## 3. Daftar Lengkap Command Next.js Terbaru (App Router: v13.4 – v16)

Next.js modern menggunakan direktori app/ (atau src/app/), mendukung *React Server Components, serta menggunakan bundler **Turbopack*.

### A. Inisialisasi Proyek (create-next-app)
| Command | Opsi / Flag Penting | Penjelasan |
| :--- | :--- | :--- |
| npx create-next-app@latest <nama-app> | --ts / --js, --tailwind / --no-tailwind, --eslint / --no-eslint, --app / --no-app, --src-dir / --no-src-dir, --turbopack / --no-turbopack, --import-alias <alias>, --use-npm / --use-pnpm / --use-yarn / --use-bun, --empty, --example <nama> | Membuat kerangka proyek Next.js versi terbaru lengkap dengan konfigurasi TypeScript, Tailwind CSS, ESLint, dan App Router. |

### B. Semua Command next CLI Terbaru
| Command | Opsi / Flag Penting | Penjelasan |
| :--- | :--- | :--- |
| npx next dev (npm run dev) | -p, --port <port>, -H, --hostname <host>, --turbo / --turbopack, --webpack, --experimental-https, --experimental-https-key <path>, --experimental-https-cert <path>, --experimental-https-ca <path>, --experimental-upload-trace <url> | Menjalankan server development lokal (default port 3000) dengan Fast Refresh dan dukungan Turbopack. |
| npx next build (npm run build) | --profile, --debug, --no-lint, --no-mangling, --experimental-app-only, --experimental-build-mode [compile\|generate] | Mengompilasi seluruh halaman, Server Components, dan API Routes menjadi bundel siap production di folder .next. |
| npx next start (npm run start) | -p, --port <port>, -H, --hostname <host>, --keepAliveTimeout <ms> | Menjalankan server production dari hasil kompilasi next build. |
| npx next lint (npm run lint) | --fix, --dir <dirs>, --file <files>, --ext <exts>, --max-warnings <n>, --no-cache, --quiet, --strict, --output-file <path>, --format <fmt> | Menjalankan pemeriksaan aturan ESLint pada seluruh proyek (catatan: mulai Next.js 16 digantikan langsung oleh npx eslint .). |
| npx next typegen | — | Menghasilkan definisi tipe TypeScript otomatis untuk seluruh rute App Router tanpa harus menjalankan next build penuh. |
| npx next info | — | Mencetak detail versi OS, Node.js, npm/pnpm/yarn, Next.js, React, dan paket relevan lainnya untuk keperluan debugging. |
| npx next telemetry | enable, disable, status | Mengaktifkan, menonaktifkan, atau mengecek status pengiriman data telemetri anonim ke tim Next.js. |
| npx next experimental-compile | — | Menjalankan tahap kompilasi kode saja pada mode modular build eksperimental. |
| npx next experimental-generate | — | Menjalankan tahap pembuatan halaman statis & metadata setelah proses experimental-compile. |

---

## 4. Daftar Lengkap Command Next.js 12 (Pages Router)

Next.js 12 menggunakan direktori pages/, bundler *Webpack*, dan mendukung ekspor statis melalui perintah CLI khusus (next export).

### A. Inisialisasi & Semua Command next CLI v12
| Command | Opsi / Flag Penting | Penjelasan |
| :--- | :--- | :--- |
| npx create-next-app@12 <nama-app> | --ts / --typescript, --use-npm, --use-yarn, --use-pnpm, --example <nama> | Membuat kerangka proyek khusus menggunakan Next.js versi 12 (Pages Router). |
| npx next dev (npm run dev) | -p, --port <port>, -H, --hostname <host> | Menjalankan server development Next.js 12 menggunakan Webpack di http://localhost:3000. |
| npx next build (npm run build) | --profile, --debug, --no-lint | Mengompilasi halaman pages/ dan API Routes pages/api/ ke dalam folder .next. |
| npx next start (npm run start) | -p, --port <port>, -H, --hostname <host>, --keepAliveTimeout <ms> | Menjalankan server Node.js production dari hasil build .next. |
| npx next export | -o, --outdir <dir>, -s, --silent, -t, --threads <n> | Mengekspor aplikasi menjadi file HTML/CSS/JS statis murni ke folder out/ (pada Next.js 14+ perintah ini dihapus dan diganti opsi output: 'export' di next.config.js). |
| npx next lint (npm run lint) | --fix, --dir <dirs>, --file <files>, --ext <exts>, --max-warnings <n>, --no-cache, --quiet, --strict | Menjalankan ESLint bawaan Next.js 12 untuk mengecek struktur halaman dan aturan React. |
| npx next info | — | Menampilkan informasi sistem dan versi dependensi proyek Next.js 12. |
| npx next telemetry | enable, disable, status | Mengatur status pengumpulan data telemetri Next.js. |

### B. Ringkasan Perbedaan Next.js Terbaru vs Next.js 12
| Aspek | Next.js Terbaru (App Router) | Next.js 12 (Pages Router) |
| :--- | :--- | :--- |
| *Direktori Routing* | app/ atau src/app/ | pages/ atau src/pages/ |
| *File Halaman* | app/users/page.tsx | pages/users/index.tsx atau pages/users.tsx |
| *File API Endpoint* | app/api/users/route.ts (export async function GET/POST) | pages/api/users.ts (export default function handler(req, res)) |
| *Komponen Default* | *Server Component* (tulis 'use client' untuk komponen interaktif) | *Client Component* (seluruh halaman berjalan sebagai komponen React standar) |
| *Bundler Dev* | *Turbopack* (--turbo / --turbopack) | *Webpack* |
| *Static Site Export* | output: 'export' di next.config.ts / next.config.mjs | Perintah CLI npx next export |
| *Validasi Tipe Rute* | npx next typegen | Tidak tersedia |