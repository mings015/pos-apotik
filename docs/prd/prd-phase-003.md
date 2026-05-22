# PRD — PHASE 3 Inventory Management (Vibe Coding Ready)

## Project

PharmaPOS — Sistem Kasir & Inventory Apotik

---

# Context

Phase 3 fokus membangun sistem inventory yang:

- stabil
- realtime
- akurat
- traceable
- aman untuk operasional apotik

Inventory merupakan core utama aplikasi.

Semua perubahan stok wajib:

- tercatat
- memiliki histori
- dapat ditelusuri
- memiliki audit movement

---

# Objective

Membangun sistem inventory management lengkap meliputi:

- stock masuk
- stock keluar
- stock adjustment
- stock opname
- batch tracking
- expired management

dengan:

- realtime stock update
- stock movement history
- minimum stock alert
- expired alert

---

# Scope

# Included

## Inventory Modules

- stock movement
- stock adjustment
- stock opname
- batch management
- expired management

---

## Features

- realtime stock calculation
- stock history
- batch tracking
- expired tracking
- stock alert
- inventory filtering
- inventory searching

---

# Excluded

Belum termasuk:

- POS transaction
- purchase order workflow
- reporting analytics
- multi branch
- offline sync

---

# Technical Direction

# Frontend

Gunakan:

- SvelteKit
- TanStack Table
- TanStack Query
- Zod validation

---

# Backend

Gunakan:

- NestJS
- Prisma
- DTO validation
- transaction support

---

# Database

Gunakan:

- PostgreSQL

---

# Core Principles

# IMPORTANT

## Semua perubahan stok WAJIB:

- masuk stock_movements
- memiliki reference
- memiliki timestamp
- memiliki user actor

---

# Inventory Formula

## Current Stock

\text{Current Stock} = \text{Stock In} - \text{Stock Out} + \text{Adjustment}

---

# MODULE 1 — Stock Movement

# Objective

Mencatat seluruh perubahan stok barang.

---

# Movement Types

## IN

Barang masuk.

## OUT

Barang keluar.

## ADJUSTMENT

Penyesuaian manual.

## OPNAME

Penyesuaian hasil stock opname.

## EXPIRED

Barang expired.

## RETURN

Barang retur.

---

# Database Schema

# stock_movements

| field          | type      |
| -------------- | --------- |
| id             | uuid      |
| product_id     | uuid      |
| batch_id       | uuid      |
| movement_type  | enum      |
| quantity       | integer   |
| before_stock   | integer   |
| after_stock    | integer   |
| reference_type | string    |
| reference_id   | uuid      |
| notes          | text      |
| created_by     | uuid      |
| created_at     | timestamp |

---

# Features

## Movement History

Semua movement dapat:

- difilter
- dicari
- diurutkan

---

## Search

Search by:

- product
- barcode
- batch number

---

## Filter

Filter by:

- movement type
- date range
- expired status

---

# Deliverables

✅ Stock movement log
✅ Movement history
✅ Search & filter

---

# MODULE 2 — Stock In

# Objective

Menambahkan stok barang ke inventory.

---

# Features

## Add Stock

User dapat:

- memilih produk
- memilih batch
- input quantity
- input expired date

---

# Validation

## Rules

- quantity wajib > 0
- expired wajib valid
- batch wajib tersedia

---

# Flow

```txt id="qqm8df"
User Add Stock
   ↓
Validate Product
   ↓
Create Batch
   ↓
Insert Stock Movement
   ↓
Update Current Stock
```

---

# Deliverables

✅ Stock masuk berjalan
✅ Batch creation berjalan

---

# MODULE 3 — Stock Out

# Objective

Mengurangi stok inventory.

---

# Features

## Reduce Stock

User dapat:

- memilih produk
- memilih batch
- input quantity

---

# Validation

## Rules

- stock tidak boleh minus
- quantity wajib valid

---

# Flow

```txt id="d8mvfq"
User Reduce Stock
   ↓
Validate Current Stock
   ↓
Create Stock Movement
   ↓
Update Current Stock
```

---

# Deliverables

✅ Stock keluar berjalan
✅ Negative stock prevention berjalan

---

# MODULE 4 — Stock Adjustment

# Objective

Melakukan koreksi stok manual.

---

# Features

## Adjustment Types

- tambah stok
- kurang stok

---

# Requirements

User wajib input:

- alasan adjustment
- quantity
- product

---

# Validation

## Rules

Adjustment wajib memiliki:

- reason
- actor
- timestamp

---

# Deliverables

✅ Stock adjustment berjalan
✅ Adjustment history berjalan

---

# MODULE 5 — Stock Opname

# Objective

Mencocokkan stok fisik dengan sistem.

---

# Features

## Stock Opname Process

- scan barcode
- input stok fisik
- compare stok sistem
- generate selisih

---

# Formula

## Selisih Stok

\text{Stock Difference} = \text{Physical Stock} - \text{System Stock}

---

# Results

Jika ada selisih:

- generate adjustment movement

---

# Deliverables

✅ Stock opname berjalan
✅ Selisih stok calculation berjalan

---

# MODULE 6 — Batch Tracking

# Objective

Melacak batch setiap produk.

---

# Database Schema

# product_batches

| field        | type      |
| ------------ | --------- |
| id           | uuid      |
| product_id   | uuid      |
| batch_number | string    |
| expired_date | date      |
| quantity     | integer   |
| created_at   | timestamp |

---

# Features

## Batch Tracking

- batch history
- stock per batch
- expired per batch

---

# Rules

## FIFO Recommendation

Gunakan batch paling lama terlebih dahulu.

---

# Deliverables

✅ Batch tracking berjalan
✅ Batch stock monitoring berjalan

---

# MODULE 7 — Expired Management

# Objective

Mencegah penjualan barang expired.

---

# Features

## Expired Detection

Sistem mendeteksi:

- expired
- near expired

---

# Alert Rules

## Warning

- H-30 expired

## Critical

- expired hari ini

---

# Expired Formula

\text{Days Remaining} = \text{Expired Date} - \text{Today}

---

# Features

## Expired Filter

Filter:

- expired
- near expired
- safe stock

---

# Deliverables

✅ Expired detection berjalan
✅ Expired alert berjalan

---

# MODULE 8 — Inventory Alert

# Objective

Memberikan notifikasi inventory.

---

# Features

## Minimum Stock Alert

Alert jika:

\text{Current Stock} \leq \text{Minimum Stock}

---

## Expired Alert

Alert jika:

- near expired
- expired

---

# Notification Types

- warning
- critical
- info

---

# Deliverables

✅ Minimum stock alert
✅ Expired alert

---

# Frontend Pages

# Inventory

```txt id="6yzq5q"
/inventory
/inventory/movements
/inventory/opname
/inventory/adjustment
```

---

# Batch

```txt id="p8tkgz"
/batches
```

---

# Expired

```txt id="3x7tq6"
/expired
```

---

# Backend Structure

```txt id="3vk5hk"
modules/
  inventory/
  stock-movements/
  stock-opname/
  batches/
  expired/
```

---

# API Requirements

# Inventory

```txt id="9pk6ku"
GET    /inventory
POST   /inventory/stock-in
POST   /inventory/stock-out
POST   /inventory/adjustment
POST   /inventory/opname
```

---

# Batch

```txt id="r6x97q"
GET    /batches
POST   /batches
GET    /batches/:id
```

---

# Movement

```txt id="93x63u"
GET /stock-movements
```

---

# UI/UX Requirements

# Inventory Table

Harus memiliki:

- pagination
- filter
- search
- batch display
- expired badge

---

# Alert UI

Gunakan:

- toast notification
- warning badge
- critical badge

---

# Confirmation Modal

Wajib untuk:

- stock adjustment
- stock opname submit
- delete batch

---

# Realtime Requirements

# Realtime Inventory Update

Saat stok berubah:

- inventory table update
- badge update
- alert update

Tanpa refresh manual.

---

# Security Requirements

## Semua inventory action wajib:

- login required
- role protected
- actor logged

---

# Validation Rules

## Stock Rules

- stok tidak boleh minus
- quantity wajib valid
- batch wajib valid

---

# Transaction Rules

Gunakan Prisma transaction untuk:

- stock update
- movement insert
- batch update

---

# Acceptance Criteria

# Inventory

✅ Stock masuk berjalan
✅ Stock keluar berjalan
✅ Adjustment berjalan
✅ Stock opname berjalan

---

# Batch

✅ Batch tracking berjalan
✅ Expired tracking berjalan

---

# Alerts

✅ Minimum stock alert berjalan
✅ Expired alert berjalan

---

# Logging

✅ Stock movement history tersedia
✅ Actor tracking tersedia

---

# Technical

✅ Prisma transaction berjalan
✅ Validation berjalan
✅ Realtime update berjalan

---

# Vibe Coding Notes

## Prioritas

Fokus ke:

1. stock consistency
2. movement logging
3. batch tracking
4. expired management

---

# IMPORTANT

Inventory adalah core paling penting aplikasi.

Kesalahan inventory dapat menyebabkan:

- selisih stok
- kerugian bisnis
- penjualan barang expired

---

# Hindari Dulu

- AI prediction
- advanced analytics
- warehouse automation
- RFID integration

---

# Recommended Reusable Components

Frontend:

- InventoryTable
- BatchBadge
- ExpiredBadge
- StockAlertCard
- MovementTimeline
- ConfirmationModal

---

# Definition of Done

Phase dianggap selesai jika:

- semua perubahan stok tercatat
- stock movement berjalan
- batch tracking berjalan
- expired detection berjalan
- minimum stock alert berjalan
- realtime stock update berjalan
- inventory siap digunakan oleh POS dan purchase system.
