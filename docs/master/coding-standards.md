# Standar Penulisan Kode (Coding Standard)

Dokumen ini mendefinisikan aturan, konvensi, dan standar pengembangan yang harus diikuti oleh seluruh pengembang dalam proyek Kasir Apotik.

---

## 1. Prinsip Umum (General Principles)

Setiap pengembang wajib mengikuti prinsip-prinsip dasar berikut:

- **TypeScript Strict Mode:** Selalu aktifkan tipe data yang ketat, hindari penggunaan tipe `any`.
- **Clean Architecture:** Pisahkan tanggung jawab komponen (separation of concerns).
- **Reusable Components:** Hindari duplikasi kode, buat komponen yang modular dan dapat digunakan kembali.
- **Readability Over Cleverness:** Prioritaskan kode yang mudah dibaca dan dipahami oleh orang lain.
- **Consistent Naming:** Ikuti konvensi penamaan yang telah disepakati.
- **DRY (Don't Repeat Yourself):** Jangan menuliskan logika yang sama berulang kali.

---

## 2. Standar TypeScript & Konvensi Penamaan

### Tipe Data

- Wajib menggunakan TypeScript strict mode (`strict: true`).
- Hindari deklarasi tipe `any`. Gunakan tipe data eksplisit atau `unknown` jika tipe tidak pasti.

```ts
// ❌ HINDARI
const data: any = fetchData();

//  REKOMENDASI
type Product = {
  id: string;
  name: string;
};
const data: Product = fetchData();
```

### Aturan Penamaan (Naming Convention)

| Elemen                 | Format                | Contoh                                           |
| :--------------------- | :-------------------- | :----------------------------------------------- |
| **Variabel & Fungsi**  | `camelCase`           | `const productName`, `function calculateTotal()` |
| **Komponen (Svelte)**  | `PascalCase`          | `ProductCard.svelte`, `CheckoutModal.svelte`     |
| **Konstanta**          | `UPPER_CASE`          | `const MAX_RETRY_COUNT = 3`                      |
| **Tabel Database**     | `snake_case` (plural) | `products`, `sale_items`, `stock_movements`      |
| **Folder / Direktori** | `kebab-case`          | `product-table/`, `auth-service/`                |

---

## 3. Standar API (REST Endpoints)

### Endpoint Design

REST API harus didesain secara konsisten menggunakan kata benda jamak (_plural nouns_):

- `GET /products` — Mendapatkan daftar produk
- `POST /products` — Membuat produk baru
- `GET /products/:id` — Mendapatkan detail produk tertentu
- `PATCH /products/:id` — Memperbarui sebagian data produk
- `DELETE /products/:id` — Menghapus produk

### Format Response

#### Success Response (200/201)

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "7a2bb6b1-c9b3-42f8-b234-e3de25287b90",
    "name": "Paracetamol 500mg"
  }
}
```

#### Error Response (400/401/403/500)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

---

## 4. Standar Validasi

Validasi data dilakukan di dua sisi (double-layer validation):

- **Frontend Validation:** Menggunakan **Zod** dan **Superforms** untuk validasi form sebelum dikirim ke server.
- **Backend Validation:** Menggunakan **class-validator** pada **DTO (Data Transfer Object)** untuk memverifikasi payload request secara ketat di pintu masuk API.

---

## 5. Standar Database & Prisma

### Aturan Skema Database

- Primary Key wajib menggunakan format **UUID**.
- Setiap tabel wajib memiliki kolom timestamp audit:
  - `created_at` (Waktu dibuat)
  - `updated_at` (Waktu terakhir diperbarui)

### Prisma Transactions

Untuk operasi yang memengaruhi mutasi keuangan atau inventori, wajib menggunakan Prisma Transaction (`$transaction`) untuk mencegah data _race condition_ atau ketidakkonsistenan data.

> [!IMPORTANT]
> Operasi transaksi wajib digunakan pada proses **Penjualan (Sales)**, **Manajemen Stok (Inventory)**, dan **Pembayaran (Payments)**.

```ts
await prisma.$transaction(async (tx) => {
  // 1. Kurangi stok obat
  // 2. Catat transaksi penjualan
  // 3. Tambahkan ke log stock_movements
});
```

---

## 6. Standar Frontend (SvelteKit)

### Pemisahan Logic (Separation of Concerns)

- Pisahkan kode tampilan (UI Components), logika interaksi, dan pemanggilan API.
- **Aturan Ukuran Komponen:** Komponen UI disarankan maksimal berukuran **200-300 baris kode**. Jika melebihi batas tersebut, lakukan ekstraksi komponen atau pisahkan logikanya ke helper/hook eksternal.

### State Management

- Gunakan **Svelte Store** untuk state UI lokal yang di-share antar-komponen.
- Gunakan **TanStack Query** untuk caching dan sinkronisasi data dari server.
- Hindari penggunaan global state yang tidak perlu.

### Styling

- Gunakan utilitas kelas **TailwindCSS**.
- Hindari penulisan _inline CSS style_ (`style="..."`) atau file CSS vanilla terpisah tanpa struktur.

---

## 7. Standar Backend (NestJS)

### Struktur Modul

Setiap fitur besar didefinisikan ke dalam modul mandiri dengan struktur minimal sebagai berikut:

```
module/
├── controller/    # HTTP Route handler & DTO validation
├── service/       # Tempat seluruh Logic Bisnis utama ditulis
├── dto/           # Validasi skema request data
└── repository/    # Query database (opsional jika dipisah dari service)
```

- **Business Logic:** Wajib diletakkan di **Service Layer**, tidak boleh di Controller atau Entity.
- **Data Transfer Object (DTO):** Semua endpoint yang menerima input wajib menggunakan DTO untuk mendefinisikan tipe data dan validasinya.

---

## 8. Keamanan & Kredensial

- **Password Hashing:** Wajib dienkripsi menggunakan library **bcrypt**.
- **Autentikasi:** Menggunakan **JWT (JSON Web Token)** untuk akses berdurasi singkat dan **Refresh Token** untuk pembaruan sesi.
- **Otorisasi:** Implementasi kontrol akses berbasis peran (**RBAC / Role-Based Access Control**).
- **Environment Variables:** Jangan pernah melakukan commit file `.env` berisi kredensial ke Git repository. Selalu sediakan dan perbarui file `.env.example` sebagai referensi.

---

## 9. Standar Git & Conventional Commits

### Penamaan Branch

Format penamaan branch yang diwajibkan:

- `feature/[nama-fitur]` (Contoh: `feature/product-module`)
- `fix/[deskripsi-bug]` (Contoh: `fix/login-bug`)
- `refactor/[nama-modul]` (Contoh: `refactor/inventory-service`)

### Commit Messages (Conventional Commits)

Ikuti panduan conventional commit saat menulis pesan commit:

- `feat: [deskripsi]` (Fitur baru, contoh: `feat: add inventory module`)
- `fix: [deskripsi]` (Perbaikan bug, contoh: `fix: resolve stock calculation bug`)
- `refactor: [deskripsi]` (Restrukturisasi kode tanpa mengubah fungsionalitas, contoh: `refactor: simplify auth service`)

---

## 10. Pengujian (Testing)

Setiap kode yang dibuat sebaiknya didukung oleh unit testing yang memadai:

- **Frontend Testing:** Menggunakan **Vitest** (Unit/Integration) dan **Playwright** (End-to-End).
- **Backend Testing:** Menggunakan **Jest** (Unit) dan **Supertest** (Integration/E2E).

---

## 11. Aturan Performa & Pemantauan

- **Hindari Query N+1:** Selalu gunakan _relation include_ atau _joint queries_ secara efisien pada Prisma.
- **Hindari Unnecessary Re-renders:** Di frontend Svelte, optimalkan reaktivitas variabel.
- **Monitoring Tools:**
  - Integrasikan **Sentry** untuk memonitor error di server production secara instan.
  - Sediakan **Docker Healthcheck** untuk verifikasi kesehatan kontainer.
  - Gunakan **PM2 Monitoring** jika tidak dijalankan dalam Docker di server target.

---

## 12. Rencana Skalabilitas Masa Depan (Future Scalability)

Sistem Kasir Apotik dirancang dari awal agar siap untuk dikembangkan dan diskalakan menjadi:

1. **Multi Cabang (Multi-tenant):** Mendukung sinkronisasi stok dan laporan di beberapa cabang apotik.
2. **Cloud SaaS Platform:** Dapat ditawarkan sebagai produk Software-as-a-Service dengan multi-database/skema terisolasi.
3. **Mobile Application Integration:** API yang fleksibel untuk diintegrasikan dengan aplikasi Android/iOS bagi kasir maupun owner.
4. **Microservices Migration:** Modul bisnis NestJS yang dirancang modular agar mudah dipecah menjadi layanan terpisah jika trafik meningkat.
5. **AI Stock Forecasting:** Memprediksi kebutuhan stok obat di masa mendatang berdasarkan data historis penjualan.

---

## Checklist Tinjauan Kode (Code Review Checklist)

Sebelum melakukan _Pull Request_ atau menggabungkan kode, pastikan kode memenuhi kriteria berikut:

- [ ] Apakah kodenya mudah dibaca (_readable_)?
- [ ] Apakah komponen/fungsi bersifat _reusable_?
- [ ] Apakah celah keamanan sudah ditangani dengan baik (_secure_)?
- [ ] Apakah penulisan tipe data sudah benar (no `any`)?
- [ ] Tidak ada duplikasi kode (_no duplicate code_).
- [ ] Tidak ada nilai sensitif/konfigurasi yang di-hardcode (_no hardcoded values_).
