# PRD — PHASE 4 POS / Kasir (Vibe Coding Ready)

## Project

PharmaPOS — Sistem Kasir & Inventory Apotik

---

# Context

Phase 4 fokus membangun sistem POS (Point of Sale) untuk operasional kasir apotik.

POS harus:

- cepat
- stabil
- mudah digunakan
- realtime
- mendukung barcode scanner
- terintegrasi inventory

Karena POS akan digunakan setiap hari oleh kasir, UX menjadi prioritas utama.

---

# Objective

Membangun sistem transaksi kasir lengkap meliputi:

- penjualan
- cart
- pembayaran
- cetak struk
- retur penjualan

dengan:

- realtime stock deduction
- barcode scanner
- thermal print
- hold transaction
- multi payment

---

# Scope

# Included

## POS Modules

- sales
- cart
- payment
- receipt
- return

---

## Features

- barcode scanner
- quick search
- hold transaction
- multi payment
- thermal print
- realtime stock update
- auto stock deduction

---

# Excluded

Belum termasuk:

- QRIS integration
- online payment gateway
- offline sync
- customer loyalty
- promo engine
- shift kasir

---

# Technical Direction

# Frontend

Gunakan:

- SvelteKit
- TanStack Query
- TanStack Table
- Zod validation

---

# Backend

Gunakan:

- NestJS
- Prisma
- Prisma transaction

---

# Database

Gunakan:

- PostgreSQL

---

# Core Principles

# IMPORTANT

## POS harus:

- cepat
- minim klik
- keyboard friendly
- scanner friendly

---

## Semua transaksi wajib:

- mengurangi stok otomatis
- membuat stock movement
- memiliki audit actor
- memiliki receipt

---

# MODULE 1 — Sales Transaction

# Objective

Membuat transaksi penjualan utama.

---

# Features

## Create Sale

Kasir dapat:

- scan barcode
- tambah produk
- ubah quantity
- hapus item
- apply discount
- checkout

---

# Validation Rules

## Rules

- stok tidak boleh minus
- quantity wajib valid
- produk expired tidak boleh dijual

---

# Sale Status

- DRAFT
- HOLD
- COMPLETED
- CANCELLED
- RETURNED

---

# Database Schema

# sales

| field          | type      |
| -------------- | --------- |
| id             | uuid      |
| invoice_number | string    |
| cashier_id     | uuid      |
| subtotal       | decimal   |
| discount       | decimal   |
| tax            | decimal   |
| total          | decimal   |
| payment_method | string    |
| status         | enum      |
| notes          | text      |
| created_at     | timestamp |

---

# sale_items

| field      | type    |
| ---------- | ------- |
| id         | uuid    |
| sale_id    | uuid    |
| product_id | uuid    |
| batch_id   | uuid    |
| quantity   | integer |
| price      | decimal |
| subtotal   | decimal |

---

# Deliverables

✅ Sales transaction berjalan
✅ Invoice generation berjalan
✅ Validation berjalan

---

# MODULE 2 — Cart System

# Objective

Membangun keranjang transaksi POS.

---

# Features

## Cart Features

- add item
- remove item
- update quantity
- calculate subtotal
- calculate total

---

# Cart Formula

## Total Belanja

\text{Total} = (\text{Subtotal} - \text{Discount}) + \text{Tax}

---

# Rules

## Quantity Rules

- quantity minimum 1
- quantity tidak boleh melebihi stok

---

# Deliverables

✅ Cart calculation berjalan
✅ Quantity validation berjalan

---

# MODULE 3 — Barcode Scanner

# Objective

Mempercepat input produk.

---

# Features

## Barcode Input

Scanner bekerja sebagai:

- keyboard input listener

---

# Flow

```txt id="q3vmdn"
Scan Barcode
   ↓
Find Product
   ↓
Add To Cart
   ↓
Update Cart
```

---

# Validation

## Rules

Jika barcode tidak ditemukan:

- tampilkan error alert

---

# Deliverables

✅ Barcode scanner berjalan
✅ Fast product lookup berjalan

---

# MODULE 4 — Payment System

# Objective

Mengelola pembayaran transaksi.

---

# Payment Methods

- CASH
- TRANSFER
- QRIS (future)
- E-WALLET (future)

---

# Features

## Cash Payment

- input nominal bayar
- calculate kembalian

---

# Formula

## Kembalian

\text{Change} = \text{Cash Paid} - \text{Total Payment}

---

# Validation

## Rules

- nominal bayar tidak boleh kurang dari total

---

# Deliverables

✅ Cash payment berjalan
✅ Change calculation berjalan

---

# MODULE 5 — Hold Transaction

# Objective

Menyimpan transaksi sementara.

---

# Features

Kasir dapat:

- hold transaction
- resume transaction

---

# Use Cases

Digunakan saat:

- customer belum selesai belanja
- customer pindah pembayaran
- kasir pause transaksi

---

# Deliverables

✅ Hold transaction berjalan
✅ Resume transaction berjalan

---

# MODULE 6 — Receipt / Struk

# Objective

Mencetak struk transaksi.

---

# Features

## Receipt Content

- nama toko
- invoice number
- cashier
- item list
- subtotal
- discount
- tax
- total
- payment
- change
- timestamp

---

# Printer

Support:

- thermal printer 58mm
- thermal printer 80mm

---

# Print Modes

- auto print
- manual print

---

# Deliverables

✅ Thermal print berjalan
✅ Receipt layout berjalan

---

# MODULE 7 — Return Transaction

# Objective

Mengelola retur penjualan.

---

# Features

Kasir dapat:

- pilih invoice
- pilih item retur
- input quantity retur
- input alasan retur

---

# Rules

## Return Rules

- quantity retur tidak boleh lebih dari quantity pembelian

---

# Flow

```txt id="cprw7j"
Select Invoice
   ↓
Select Return Item
   ↓
Validate Quantity
   ↓
Update Stock
   ↓
Create Return Movement
```

---

# Deliverables

✅ Return transaction berjalan
✅ Stock rollback berjalan

---

# MODULE 8 — Realtime Inventory Sync

# Objective

Sinkronisasi stok realtime.

---

# Features

Saat transaksi selesai:

- stok otomatis berkurang
- inventory langsung update
- batch quantity update
- stock movement tercatat

---

# Formula

## Stock After Sale

\text{Remaining Stock} = \text{Current Stock} - \text{Sold Quantity}

---

# Deliverables

✅ Auto stock deduction berjalan
✅ Realtime inventory update berjalan

---

# Frontend Pages

# POS

```txt id="3nm3f9"
/dashboard/pos
```

---

# Returns

```txt id="ywp8vp"
/dashboard/returns
```

---

# Sales History

```txt id="9g9q99"
/dashboard/sales
```

---

# Backend Structure

```txt id="3w7p8f"
modules/
  sales/
  cart/
  payments/
  receipts/
  returns/
```

---

# API Requirements

# Sales

```txt id="llg7r5"
GET    /sales
POST   /sales
GET    /sales/:id
```

---

# Cart

```txt id="tf5k88"
POST /cart/add-item
POST /cart/remove-item
PATCH /cart/update-quantity
```

---

# Return

```txt id="tlfx6w"
POST /returns
```

---

# Receipt

```txt id="q6g4xj"
GET /receipts/:saleId
```

---

# UI/UX Requirements

# POS Layout

Harus:

- cepat
- fullscreen friendly
- keyboard friendly
- scanner friendly

---

# Cart UI

Harus:

- realtime calculation
- sticky summary
- editable quantity

---

# Notification UI

Gunakan:

- toast notification
- success alert
- error alert

---

# Confirmation Modal

Wajib untuk:

- cancel transaction
- delete cart item
- logout

---

# Security Requirements

## Semua transaksi wajib:

- actor logged
- role protected
- transaction validated

---

# Validation Rules

## POS Rules

- produk expired tidak boleh dijual
- stok tidak boleh minus
- quantity wajib valid

---

# Transaction Rules

Gunakan Prisma transaction untuk:

- sale insert
- stock deduction
- stock movement insert
- batch update

---

# Acceptance Criteria

# POS

✅ Penjualan berjalan
✅ Cart berjalan
✅ Barcode scanner berjalan
✅ Hold transaction berjalan

---

# Payment

✅ Cash payment berjalan
✅ Change calculation berjalan

---

# Receipt

✅ Thermal print berjalan
✅ Receipt generation berjalan

---

# Return

✅ Return transaction berjalan
✅ Stock rollback berjalan

---

# Inventory Sync

✅ Auto stock deduction berjalan
✅ Realtime stock update berjalan

---

# Technical

✅ Prisma transaction berjalan
✅ Validation berjalan
✅ Batch deduction berjalan

---

# Vibe Coding Notes

## Prioritas

Fokus ke:

1. transaction stability
2. stock consistency
3. cashier UX
4. barcode speed
5. thermal print

---

# IMPORTANT

POS adalah fitur paling sering digunakan.

UX buruk pada POS akan:

- memperlambat kasir
- menyebabkan antrean
- meningkatkan human error

---

# Recommended Reusable Components

Frontend:

- POSLayout
- ProductSearch
- CartTable
- PaymentModal
- ReceiptPreview
- BarcodeInput
- HoldTransactionList

---

# Hindari Dulu

- loyalty point
- promo engine
- online payment gateway
- split bill
- advanced receipt customization

---

# Definition of Done

Phase dianggap selesai jika:

- transaksi kasir berjalan
- barcode scanner berjalan
- pembayaran berjalan
- struk tercetak
- stok otomatis berkurang
- retur berjalan
- realtime inventory update berjalan
- POS siap digunakan operasional harian.
