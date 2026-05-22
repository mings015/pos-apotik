# PRD — PHASE 2 Master Data (Vibe Coding Ready)

## Project

PharmaPOS — Sistem Kasir & Inventory Apotik

---

# Context

Phase 2 fokus membangun seluruh master data inti yang akan digunakan oleh:

- inventory
- POS
- pembelian
- laporan
- manajemen user

Phase ini menjadi pondasi data utama aplikasi.

Semua module wajib:

- scalable
- reusable
- type-safe
- memiliki pagination
- memiliki search
- memiliki filter
- memiliki validation

---

# Revision From Previous Phase

## Removed

❌ Reset password sementara dihapus.

---

## Added UX Features

### Global Alert / Notification

Tambahkan:

- success alert
- error alert
- warning alert
- info alert

Contoh:

- data berhasil disimpan
- gagal menghapus data
- login berhasil
- unauthorized action

---

### Confirmation Dialog

Tambahkan modal konfirmasi untuk aksi krusial:

- logout
- hapus item
- update data penting

Contoh:

```txt id="6d9mg5"
Apakah anda yakin ingin menghapus produk ini?
```

---

# Objective

Membangun seluruh master data inti sistem:

- produk
- kategori
- supplier
- satuan
- user
- role
- pengaturan aplikasi

---

# Scope

# Included

## Modules

- Products
- Categories
- Suppliers
- Units
- Users
- Roles
- System Settings

---

## Features

- CRUD
- Pagination
- Search
- Filter
- Validation
- Upload image
- Barcode
- Confirmation dialog
- Toast notification

---

# Excluded

Belum termasuk:

- inventory movement
- POS
- transaksi
- purchase order
- reporting
- websocket

---

# Technical Direction

# Frontend

Gunakan:

- SvelteKit
- TailwindCSS
- shadcn/ui
- TanStack Table
- TanStack Query
- Zod validation

---

# Backend

Gunakan:

- NestJS
- Prisma
- DTO validation
- RBAC guard

---

# Database

Gunakan:

- PostgreSQL

---

# General Requirements

# All CRUD Modules Must Have

## Table Features

- pagination
- sorting
- search
- filter
- loading state
- empty state

---

## Form Features

- validation
- loading submit
- success notification
- error notification

---

## Confirmation Dialog

Wajib untuk:

- delete
- logout
- dangerous update

---

# MODULE 1 — Product Management

# Objective

Mengelola seluruh data produk obat dan non-obat.

---

# Features

## CRUD Product

- create product
- update product
- delete product
- detail product

---

## Product Fields

| field          | type    |
| -------------- | ------- |
| id             | uuid    |
| code           | string  |
| barcode        | string  |
| name           | string  |
| category_id    | uuid    |
| supplier_id    | uuid    |
| unit_id        | uuid    |
| purchase_price | decimal |
| selling_price  | decimal |
| stock          | integer |
| minimum_stock  | integer |
| product_image  | string  |
| description    | text    |
| is_active      | boolean |

---

# Product Features

## Upload Image

User dapat upload:

- jpg
- png
- webp

---

## Barcode

Features:

- barcode input
- auto generate barcode (optional)

---

## Search

Search by:

- name
- barcode
- code

---

## Filter

Filter by:

- category
- supplier
- active status

---

# Product Validation

## Required

- name
- category
- unit
- selling_price

---

# Deliverables

✅ Product CRUD
✅ Product image upload
✅ Product search & filter
✅ Barcode support

---

# MODULE 2 — Category Management

# Features

## CRUD Category

- create
- update
- delete

---

# Fields

| field       | type   |
| ----------- | ------ |
| id          | uuid   |
| name        | string |
| description | text   |

---

# Rules

- category name unique

---

# Deliverables

✅ Category management

---

# MODULE 3 — Supplier Management

# Features

## CRUD Supplier

- create
- update
- delete

---

# Fields

| field     | type    |
| --------- | ------- |
| id        | uuid    |
| name      | string  |
| phone     | string  |
| email     | string  |
| address   | text    |
| is_active | boolean |

---

# Search

Search by:

- supplier name
- phone

---

# Deliverables

✅ Supplier CRUD
✅ Supplier search

---

# MODULE 4 — Unit Management

# Features

## CRUD Unit

- create
- update
- delete

---

# Fields

| field  | type   |
| ------ | ------ |
| id     | uuid   |
| name   | string |
| symbol | string |

---

# Examples

- Tablet
- Strip
- Botol
- Box

---

# Deliverables

✅ Unit management

---

# MODULE 5 — User Management

# Features

## CRUD User

- create user
- update user
- delete user
- activate/deactivate user

---

# Fields

| field     | type    |
| --------- | ------- |
| id        | uuid    |
| name      | string  |
| email     | string  |
| password  | string  |
| role_id   | uuid    |
| is_active | boolean |

---

# Rules

## Password

- minimum 8 character
- hashed using bcrypt

---

# Deliverables

✅ User management
✅ User role assignment

---

# MODULE 6 — Role Management

# Features

## CRUD Role

- create role
- update role
- delete role

---

# Default Roles

- SUPER_ADMIN
- ADMIN
- CASHIER
- WAREHOUSE

---

# Permission Features

Role memiliki:

- menu access
- endpoint access

---

# Deliverables

✅ Role management
✅ Permission system

---

# MODULE 7 — System Settings

# Objective

Mengelola konfigurasi utama aplikasi.

---

# Features

## General Settings

- store name
- store logo
- tax percentage
- currency

---

## Thermal Printer Settings

- printer name
- paper size
- auto print

---

## Backup Settings

- backup path
- auto backup toggle

---

# Fields

| field          | type    |
| -------------- | ------- |
| id             | uuid    |
| store_name     | string  |
| store_logo     | string  |
| tax_percentage | decimal |
| printer_name   | string  |
| auto_print     | boolean |

---

# Deliverables

✅ Application configuration
✅ Printer configuration
✅ Store branding setup

---

# Frontend Pages

# Products

```txt id="v74k9f"
/dashboard/products
/dashboard/products/create
/dashboard/products/:id/edit
```

---

# Categories

```txt id="fjk8fv"
/dashboard/categories
```

---

# Suppliers

```txt id="m8mp5m"
/dashboard/suppliers
```

---

# Units

```txt id="3zwb2w"
/dashboard/units
```

---

# Users

```txt id="thjv5f"
/dashboard/users
```

---

# Roles

```txt id="s7t5ye"
/dashboard/roles
```

---

# Settings

```txt id="k9gxhv"
/dashboard/settings
```

---

# Backend Structure

```txt id="j58h29"
modules/
  products/
  categories/
  suppliers/
  units/
  users/
  roles/
  settings/
```

---

# API Requirements

# Product

```txt id="b4tfv9"
GET    /products
POST   /products
GET    /products/:id
PATCH  /products/:id
DELETE /products/:id
```

---

# Supplier

```txt id="pn6nln"
GET    /suppliers
POST   /suppliers
PATCH  /suppliers/:id
DELETE /suppliers/:id
```

---

# User

```txt id="3wv8x6"
GET    /users
POST   /users
PATCH  /users/:id
DELETE /users/:id
```

---

# Role

```txt id="rq8b6r"
GET    /roles
POST   /roles
PATCH  /roles/:id
DELETE /roles/:id
```

---

# UI/UX Requirements

# Table UI

Harus memiliki:

- responsive table
- loading skeleton
- empty state
- pagination
- action dropdown

---

# Form UI

Harus memiliki:

- validation message
- loading button
- success alert
- error alert

---

# Notification UI

Gunakan:

- toast notification

Jenis:

- success
- error
- warning
- info

---

# Confirmation Modal

Gunakan modal untuk:

- delete action
- logout
- critical action

---

# Security Requirements

## Route Protection

Semua dashboard route wajib protected.

---

## Role Protection

Semua module wajib memiliki role permission.

---

## Validation

Semua API wajib menggunakan:

- DTO
- class-validator

---

# Acceptance Criteria

# Product

✅ CRUD berjalan
✅ Upload gambar berjalan
✅ Barcode berjalan
✅ Search berjalan
✅ Filter berjalan

---

# Supplier

✅ CRUD berjalan
✅ Search berjalan

---

# User & Role

✅ Role assignment berjalan
✅ Permission berjalan

---

# Settings

✅ Store configuration berjalan
✅ Printer configuration berjalan

---

# UX

✅ Alert notification berjalan
✅ Confirmation dialog berjalan
✅ Loading state tersedia

---

# Technical

✅ Prisma migration berjalan
✅ Validation berjalan
✅ RBAC berjalan

---

# Vibe Coding Notes

## Prioritas

Fokus ke:

1. reusable CRUD architecture
2. reusable table component
3. reusable form component
4. shared validation
5. shared types

---

## Recommended Reusable Components

Frontend:

- DataTable
- ConfirmDialog
- FormModal
- ToastProvider
- PageHeader
- EmptyState

---

## Hindari Dulu

- advanced permission matrix
- audit logging
- websocket
- realtime sync
- drag drop upload

---

# Definition of Done

Phase dianggap selesai jika:

- semua master data dapat di CRUD
- upload gambar produk berjalan
- role management berjalan
- setting aplikasi berjalan
- search & filter berjalan
- alert notification berjalan
- confirmation dialog berjalan
- project siap masuk phase inventory dan POS.
