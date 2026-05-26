# PRD — PHASE 6 Reporting & Analytics (Vibe Coding Ready)

## Project

PharmaPOS — Sistem Kasir & Inventory Apotik

---

# Context

Phase 6 fokus membangun sistem reporting dan analytics berdasarkan data yang sudah tersedia dari:

- POS
- inventory
- purchase
- supplier
- stock movement

Tujuan utama phase ini adalah:

- membantu owner mengambil keputusan
- monitoring performa bisnis
- monitoring stok dan transaksi
- menyediakan export laporan

---

# Objective

Membangun dashboard analytics dan reporting system meliputi:

- laporan penjualan
- laporan profit
- laporan stok
- laporan expired
- laporan transaksi kasir

dengan:

- grafik analytics
- filter tanggal
- export PDF
- export Excel

---

# Scope

# Included

## Reports

- daily sales
- monthly sales
- profit report
- best selling products
- expired products
- cashier transactions
- stock reports

---

## Features

- analytics dashboard
- chart visualization
- export PDF
- export Excel
- filtering
- search
- print report

---

# Excluded

Belum termasuk:

- AI analytics
- forecasting
- predictive analytics
- advanced BI
- scheduled email report

---

# Technical Direction

# Frontend

Gunakan:

- SvelteKit
- TanStack Table
- TanStack Query
- Recharts / Chart library

---

# Backend

Gunakan:

- NestJS
- Prisma
- aggregation query
- raw query optimization

---

# Database

Gunakan:

- PostgreSQL

---

# Core Principles

# IMPORTANT

## Semua laporan wajib:

- realtime
- dapat difilter
- dapat diexport
- konsisten dengan data transaksi

---

## Analytics harus:

- mudah dibaca
- cepat dimuat
- mobile friendly

---

# MODULE 1 — Dashboard Analytics

# Objective

Menyediakan overview bisnis secara realtime.

---

# Features

## Dashboard Cards

- total sales today
- total sales this month
- total profit
- total transactions
- low stock products
- expired products

---

# Analytics Charts

## Charts

- sales trend
- monthly sales
- top selling products
- cashier performance

---

# Dashboard Formula

## Profit

\text{Profit} = \text{Total Sales} - \text{Total Purchase Cost}

---

# Deliverables

✅ Analytics dashboard berjalan
✅ Realtime dashboard cards berjalan
✅ Sales chart berjalan

---

# MODULE 2 — Daily Sales Report

# Objective

Melihat laporan penjualan harian.

---

# Features

## Daily Report

- total transaksi
- total pendapatan
- total item terjual
- total profit

---

# Filters

- date range
- cashier
- payment method

---

# Deliverables

✅ Daily sales report berjalan

---

# MODULE 3 — Monthly Sales Report

# Objective

Melihat performa penjualan bulanan.

---

# Features

## Monthly Report

- sales summary
- transaction trend
- best sales day

---

# Charts

## Monthly Trend

y = f(x)

Gunakan line chart untuk:

- trend penjualan bulanan
- trend profit

---

# Deliverables

✅ Monthly report berjalan
✅ Monthly chart berjalan

---

# MODULE 4 — Profit Report

# Objective

Menghitung profit bisnis.

---

# Features

## Profit Calculation

- gross sales
- purchase cost
- profit margin

---

# Formula

## Profit Margin

\text{Profit Margin} = \frac{\text{Profit}}{\text{Total Sales}} \times 100%

---

# Filters

- date range
- product
- category

---

# Deliverables

✅ Profit report berjalan
✅ Profit margin calculation berjalan

---

# MODULE 5 — Best Selling Products

# Objective

Menampilkan produk paling laris.

---

# Features

## Best Seller Report

- top selling products
- quantity sold
- total revenue

---

# Filters

- daily
- weekly
- monthly

---

# Deliverables

✅ Best seller report berjalan

---

# MODULE 6 — Expired Products Report

# Objective

Monitoring barang expired.

---

# Features

## Expired Report

- expired products
- near expired products
- expired batch

---

# Alert Rules

## Warning

- H-30 expired

## Critical

- expired today

---

# Filters

- expired status
- category
- supplier

---

# Deliverables

✅ Expired report berjalan
✅ Near expired monitoring berjalan

---

# MODULE 7 — Cashier Transaction Report

# Objective

Melihat performa transaksi kasir.

---

# Features

## Cashier Report

- total transaksi
- total revenue
- total return
- average transaction

---

# Filters

- cashier
- date range

---

# Formula

## Average Transaction

\text{Average Transaction} = \frac{\text{Total Revenue}}{\text{Total Transactions}}

---

# Deliverables

✅ Cashier transaction report berjalan

---

# MODULE 8 — Stock Report

# Objective

Melihat kondisi stok inventory.

---

# Features

## Stock Report

- current stock
- minimum stock
- stock movement
- stock valuation

---

# Formula

## Stock Value

\text{Stock Value} = \text{Current Stock} \times \text{Purchase Price}

---

# Filters

- category
- supplier
- stock status

---

# Deliverables

✅ Stock report berjalan
✅ Stock valuation berjalan

---

# MODULE 9 — Export System

# Objective

Mengexport laporan.

---

# Export Formats

- PDF
- Excel

---

# Features

## PDF Export

- printable report
- summary section
- company branding

---

# Excel Export

- tabular data
- formatted sheet

---

# Export Rules

## Semua export wajib:

- mengikuti filter aktif
- memiliki timestamp
- memiliki nama laporan

---

# Deliverables

✅ PDF export berjalan
✅ Excel export berjalan

---

# Frontend Pages

# Dashboard

```txt id="w3fy5v"
/dashboard
```

---

# Reports

```txt id="a8f5p3"
/dashboard/reports/sales
/dashboard/reports/profit
/dashboard/reports/stocks
/dashboard/reports/expired
/dashboard/reports/cashiers
```

---

# Backend Structure

```txt id="n6tv2m"
modules/
  analytics/
  reports/
  exports/
```

---

# API Requirements

# Dashboard

```txt id="l2fw2x"
GET /analytics/dashboard
```

---

# Reports

```txt id="5gxq8h"
GET /reports/sales
GET /reports/profit
GET /reports/stocks
GET /reports/expired
GET /reports/cashiers
```

---

# Export

```txt id="n4d9v4"
GET /exports/pdf
GET /exports/excel
```

---

# UI/UX Requirements

# Dashboard UI

Harus:

- clean
- responsive
- informative
- fast loading

---

# Report Table

Harus memiliki:

- pagination
- filter
- search
- export button

---

# Chart UI

Gunakan:

- line chart
- bar chart
- pie chart

---

# Notification UI

Gunakan:

- loading export
- success export
- error export

---

# Security Requirements

## Semua laporan wajib:

- role protected
- filter validated
- export validated

---

# Validation Rules

## Report Rules

- date range wajib valid
- export format wajib valid

---

# Performance Requirements

## Reports harus:

- load < 3 detik
- pagination optimized
- aggregation optimized

---

# Query Optimization

Gunakan:

- indexed query
- aggregation query
- pagination query

---

# Acceptance Criteria

# Dashboard

✅ Analytics dashboard berjalan
✅ Dashboard cards berjalan
✅ Charts berjalan

---

# Reports

✅ Daily report berjalan
✅ Monthly report berjalan
✅ Profit report berjalan
✅ Stock report berjalan

---

# Export

✅ PDF export berjalan
✅ Excel export berjalan

---

# Inventory

✅ Expired report berjalan
✅ Best seller report berjalan

---

# Technical

✅ Aggregation query berjalan
✅ Pagination optimized
✅ Export optimized

---

# Vibe Coding Notes

## Prioritas

Fokus ke:

1. report consistency
2. fast query
3. clean dashboard
4. export stability
5. readable analytics

---

# IMPORTANT

Reporting sangat penting untuk owner bisnis.

Laporan yang lambat atau salah dapat menyebabkan:

- keputusan bisnis salah
- monitoring buruk
- kehilangan insight

---

# Recommended Reusable Components

Frontend:

- AnalyticsCard
- SalesChart
- ReportTable
- DateRangeFilter
- ExportButton
- DashboardSummary

---

# Hindari Dulu

- AI analytics
- predictive analytics
- custom report builder
- scheduled email report
- data warehouse

---

# Definition of Done

Phase dianggap selesai jika:

- dashboard analytics berjalan
- seluruh laporan berjalan
- grafik penjualan berjalan
- export PDF berjalan
- export Excel berjalan
- filter laporan berjalan
- data konsisten dengan transaksi
- reporting siap digunakan owner bisnis.
