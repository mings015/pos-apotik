# PRD — PHASE 5 Purchase Management (Vibe Coding Ready)

## Project

PharmaPOS — Sistem Kasir & Inventory Apotik

---

# Context

Phase 5 fokus membangun sistem pembelian barang dari supplier.

Module ini terhubung langsung dengan:

- inventory
- batch tracking
- expired management
- supplier management

Semua pembelian wajib:

- memiliki histori
- memiliki invoice
- memiliki tracking pembayaran
- otomatis menambah stok

---

# Objective

Membangun sistem purchase management lengkap meliputi:

- purchase order
- penerimaan barang
- invoice supplier
- retur pembelian

dengan:

- automatic stock update
- batch generation
- payment tracking
- supplier transaction history

---

# Scope

# Included

## Purchase Modules

- purchase order
- goods receiving
- supplier invoice
- purchase return

---

## Features

- PO workflow
- supplier transaction
- payment tracking
- auto stock increment
- batch creation
- invoice management

---

# Excluded

Belum termasuk:

- accounting integration
- hutang jatuh tempo otomatis
- supplier portal
- approval workflow multi level
- e-procurement

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
- Prisma transaction

---

# Database

Gunakan:

- PostgreSQL

---

# Core Principles

# IMPORTANT

## Semua pembelian wajib:

- memiliki supplier
- memiliki invoice
- memiliki histori pembayaran
- tercatat dalam stock movement

---

## Barang masuk wajib:

- membuat batch
- memiliki expired date
- menambah stok otomatis

---

# MODULE 1 — Purchase Order (PO)

# Objective

Membuat sistem pemesanan barang ke supplier.

---

# Features

## Create PO

User dapat:

- memilih supplier
- memilih produk
- input quantity
- input harga beli

---

# PO Status

- DRAFT
- PENDING
- APPROVED
- RECEIVED
- CANCELLED

---

# Database Schema

# purchase_orders

| field       | type      |
| ----------- | --------- |
| id          | uuid      |
| po_number   | string    |
| supplier_id | uuid      |
| subtotal    | decimal   |
| tax         | decimal   |
| total       | decimal   |
| status      | enum      |
| notes       | text      |
| created_by  | uuid      |
| created_at  | timestamp |

---

# purchase_order_items

| field             | type    |
| ----------------- | ------- |
| id                | uuid    |
| purchase_order_id | uuid    |
| product_id        | uuid    |
| quantity          | integer |
| purchase_price    | decimal |
| subtotal          | decimal |

---

# Formula

## Total PO

\text{Total Purchase} = (\text{Subtotal} + \text{Tax}) - \text{Discount}

---

# Deliverables

✅ Purchase order berjalan
✅ PO status workflow berjalan

---

# MODULE 2 — Goods Receiving

# Objective

Mengelola penerimaan barang supplier.

---

# Features

## Receive Goods

User dapat:

- memilih PO
- input barang diterima
- input batch number
- input expired date

---

# Validation

## Rules

- quantity diterima tidak boleh melebihi quantity PO
- expired wajib valid
- batch wajib unik

---

# Flow

```txt id="6x8w98"
Select PO
   ↓
Receive Items
   ↓
Generate Batch
   ↓
Insert Stock Movement
   ↓
Update Product Stock
```

---

# Auto Inventory Update

Saat barang diterima:

- stok otomatis bertambah
- stock movement dibuat
- batch dibuat

---

# Deliverables

✅ Barang masuk berjalan
✅ Auto stock increment berjalan
✅ Batch creation berjalan

---

# MODULE 3 — Supplier Invoice

# Objective

Mengelola invoice supplier.

---

# Features

## Invoice Features

- upload invoice
- invoice number
- invoice date
- due date
- payment status

---

# Invoice Status

- UNPAID
- PARTIAL
- PAID

---

# Database Schema

# supplier_invoices

| field             | type    |
| ----------------- | ------- |
| id                | uuid    |
| purchase_order_id | uuid    |
| invoice_number    | string  |
| total_amount      | decimal |
| paid_amount       | decimal |
| due_date          | date    |
| payment_status    | enum    |

---

# Deliverables

✅ Invoice tracking berjalan
✅ Payment status berjalan

---

# MODULE 4 — Payment Tracking

# Objective

Melacak pembayaran supplier.

---

# Features

## Payment Features

- record payment
- partial payment
- payment history

---

# Formula

## Remaining Debt

\text{Remaining Debt} = \text{Total Invoice} - \text{Paid Amount}

---

# Validation

## Rules

- payment tidak boleh melebihi invoice total

---

# Deliverables

✅ Payment tracking berjalan
✅ Remaining debt calculation berjalan

---

# MODULE 5 — Purchase Return

# Objective

Mengelola retur barang ke supplier.

---

# Features

## Return Features

User dapat:

- memilih invoice
- memilih item retur
- input quantity retur
- input alasan retur

---

# Return Reasons

- barang rusak
- expired
- salah kirim
- kualitas buruk

---

# Validation

## Rules

- quantity retur tidak boleh melebihi barang diterima

---

# Flow

```txt id="fj7q8m"
Select Purchase
   ↓
Select Return Item
   ↓
Validate Quantity
   ↓
Reduce Stock
   ↓
Create Return Movement
```

---

# Inventory Integration

Saat retur:

- stok otomatis berkurang
- stock movement dibuat
- batch quantity berkurang

---

# Deliverables

✅ Purchase return berjalan
✅ Auto stock deduction berjalan

---

# MODULE 6 — Supplier Transaction History

# Objective

Melihat histori transaksi supplier.

---

# Features

## Supplier History

- purchase history
- payment history
- return history

---

# Filters

Filter by:

- supplier
- date
- payment status

---

# Deliverables

✅ Supplier transaction history berjalan

---

# Frontend Pages

# Purchase Orders

```txt id="m9a8s3"
/dashboard/purchases
/dashboard/purchases/create
/dashboard/purchases/:id
```

---

# Goods Receiving

```txt id="dr2y5q"
/dashboard/goods-receiving
```

---

# Supplier Invoice

```txt id="fw3y1p"
/dashboard/supplier-invoices
```

---

# Purchase Returns

```txt id="8h8e6r"
/dashboard/purchase-returns
```

---

# Backend Structure

```txt id="kh7v4q"
modules/
  purchases/
  goods-receiving/
  supplier-invoices/
  purchase-returns/
```

---

# API Requirements

# Purchase Orders

```txt id="h4p7f7"
GET    /purchase-orders
POST   /purchase-orders
GET    /purchase-orders/:id
PATCH  /purchase-orders/:id
```

---

# Goods Receiving

```txt id="c5vw8f"
POST /goods-receiving
```

---

# Invoice

```txt id="r3wv2h"
GET    /supplier-invoices
POST   /supplier-invoices
PATCH  /supplier-invoices/:id
```

---

# Purchase Return

```txt id="9l6x6z"
POST /purchase-returns
```

---

# UI/UX Requirements

# Purchase Table

Harus memiliki:

- pagination
- filter
- search
- status badge

---

# Form UI

Harus memiliki:

- validation message
- loading submit
- confirmation dialog

---

# Notification UI

Gunakan:

- toast notification
- success alert
- error alert

---

# Confirmation Modal

Wajib untuk:

- submit PO
- receive goods
- retur barang
- cancel purchase

---

# Inventory Requirements

## Barang masuk wajib:

- membuat stock movement
- update stok realtime
- membuat batch

---

# Security Requirements

## Semua transaksi wajib:

- actor logged
- role protected
- transaction validated

---

# Validation Rules

## Purchase Rules

- supplier wajib valid
- quantity wajib valid
- harga beli wajib valid

---

# Transaction Rules

Gunakan Prisma transaction untuk:

- purchase insert
- stock increment
- movement insert
- batch creation
- payment insert

---

# Acceptance Criteria

# Purchase

✅ Purchase order berjalan
✅ PO workflow berjalan

---

# Receiving

✅ Barang masuk berjalan
✅ Auto stock increment berjalan

---

# Invoice

✅ Invoice tracking berjalan
✅ Payment tracking berjalan

---

# Return

✅ Purchase return berjalan
✅ Stock rollback berjalan

---

# Inventory

✅ Batch creation berjalan
✅ Stock movement berjalan

---

# Technical

✅ Prisma transaction berjalan
✅ Validation berjalan
✅ Realtime stock update berjalan

---

# Vibe Coding Notes

## Prioritas

Fokus ke:

1. stock consistency
2. supplier workflow
3. payment tracking
4. batch creation
5. inventory integration

---

# IMPORTANT

Purchase system sangat mempengaruhi:

- akurasi inventory
- batch tracking
- expired tracking
- supplier management

---

# Recommended Reusable Components

Frontend:

- PurchaseTable
- SupplierSelect
- POStatusBadge
- InvoiceStatusBadge
- PaymentHistoryCard
- GoodsReceivingForm

---

# Hindari Dulu

- approval workflow bertingkat
- accounting integration
- supplier portal
- OCR invoice
- auto reorder AI

---

# Definition of Done

Phase dianggap selesai jika:

- purchase order berjalan
- barang masuk otomatis tambah stok
- batch otomatis dibuat
- invoice supplier berjalan
- payment tracking berjalan
- purchase return berjalan
- inventory sinkron dengan purchase system
- sistem pembelian siap operasional.
- Code best practice
