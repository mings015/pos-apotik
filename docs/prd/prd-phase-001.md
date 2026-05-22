# PRD — PHASE 1 Foundation & Setup (Vibe Coding Ready)

## Project

PharmaPOS — Sistem Kasir & Inventory Apotik

---

# Context

Project ini adalah aplikasi kasir dan inventory management untuk apotik menggunakan full TypeScript architecture.

Phase 1 fokus membangun pondasi project agar scalable, maintainable, dan siap untuk phase berikutnya.

Stack utama:

- SvelteKit
- NestJS
- Prisma
- PostgreSQL

---

# Objective

Membangun foundation project yang meliputi:

- monorepo setup
- frontend setup
- backend setup
- prisma setup
- authentication system
- RBAC
- dashboard base layout

Phase ini harus menghasilkan project yang:

- sudah bisa login
- memiliki role permission
- memiliki dashboard
- scalable untuk phase berikutnya

---

# Technical Direction

# Monorepo

Gunakan:

```txt
pnpm workspace
```

Structure:

```txt
apps/
  web/
  api/

packages/
  types/
  config/
```

---

# Frontend Requirements

Gunakan:

- SvelteKit
- TypeScript strict mode
- TailwindCSS
- shadcn/ui
- TanStack Query

---

# Backend Requirements

Gunakan:

- NestJS
- Prisma
- JWT auth
- Passport
- class-validator

---

# Database

Gunakan:

- PostgreSQL

---

# Environment Rules

Frontend:

```env
PUBLIC_API_URL=
```

Backend:

```env
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
PORT=
```

---

# Coding Rules

## Wajib

- full TypeScript
- strict mode
- no any
- modular architecture
- reusable component
- DTO validation
- clean folder structure

---

# Scope

# Included

## Frontend

- auth pages
- dashboard layout
- protected route
- sidebar
- header

## Backend

- auth module
- users module
- roles module

## Auth

- login
- logout
- reset password
- JWT auth
- refresh token

## RBAC

- role guard
- protected endpoint
- protected menu

---

# Excluded

Belum termasuk:

- inventory
- POS
- reporting
- websocket
- realtime
- offline mode

---

# Required Features

# 1. Authentication

## Login

User dapat login menggunakan:

- email
- password

Validation:

- email wajib valid
- password minimal 8 karakter

---

## Logout

User dapat logout dan session terhapus.

---

## Reset Password

User dapat:

- request reset password
- reset password menggunakan token

---

# 2. Role Based Access Control (RBAC)

Roles:

- SUPER_ADMIN
- ADMIN
- CASHIER
- WAREHOUSE

---

## Rules

### SUPER_ADMIN

Akses semua fitur.

### ADMIN

Akses operational management.

### CASHIER

Hanya akses POS.

### WAREHOUSE

Hanya akses inventory.

---

# 3. Dashboard Layout

Dashboard harus memiliki:

## Sidebar

Menu:

- Dashboard
- Products
- Inventory
- Sales
- Purchases
- Reports
- Settings

---

## Header

Features:

- profile dropdown
- logout button
- current user info

---

## Protected Route

Semua dashboard route wajib protected.

---

# Database Schema

# roles

| field      | type      |
| ---------- | --------- |
| id         | uuid      |
| name       | string    |
| created_at | timestamp |
| updated_at | timestamp |

---

# users

| field      | type      |
| ---------- | --------- |
| id         | uuid      |
| name       | string    |
| email      | string    |
| password   | string    |
| role_id    | uuid      |
| created_at | timestamp |
| updated_at | timestamp |

---

# Seed Data

Default roles:

- SUPER_ADMIN
- ADMIN
- CASHIER
- WAREHOUSE

Default user:

```txt
email: admin@pharmapos.com
password: admin123
```

---

# API Requirements

# Auth

## Login

```txt
POST /auth/login
```

---

## Logout

```txt
POST /auth/logout
```

---

## Forgot Password

```txt
POST /auth/forgot-password
```

---

## Reset Password

```txt
POST /auth/reset-password
```

---

## Current User

```txt
GET /auth/me
```

---

# Frontend Pages

# Public Pages

## Login

```txt
/login
```

---

## Forgot Password

```txt
/forgot-password
```

---

## Reset Password

```txt
/reset-password
```

---

# Protected Pages

## Dashboard

```txt
/dashboard
```

---

# Technical Requirements

# Frontend Structure

```txt
src/
  lib/
  routes/
  components/
  stores/
  services/
  types/
```

---

# Backend Structure

```txt
src/
  modules/
    auth/
    users/
    roles/

  common/
  prisma/
  config/
```

---

# Authentication Flow

```txt
User Login
   ↓
Validate Credentials
   ↓
Generate JWT
   ↓
Generate Refresh Token
   ↓
Return Session
```

---

# Security Requirements

## Password

Gunakan:

```txt
bcrypt
```

---

## Validation

Gunakan:

- DTO validation
- class-validator

---

## Authorization

Gunakan:

- JWT Guard
- Role Guard

---

# UX Requirements

# Login Page

Harus:

- clean
- modern
- responsive
- simple

---

# Dashboard

Harus:

- sidebar collapse
- responsive
- desktop-first

---

# Deliverables

# Infrastructure

✅ Monorepo setup
✅ PostgreSQL connected
✅ Prisma migration working

---

# Frontend

✅ SvelteKit setup
✅ Tailwind setup
✅ Dashboard layout
✅ Auth pages
✅ Protected routes

---

# Backend

✅ NestJS setup
✅ Auth module
✅ User module
✅ Role module
✅ Prisma integration

---

# Authentication

✅ Login
✅ Logout
✅ Reset password
✅ JWT auth
✅ Refresh token

---

# RBAC

✅ Role guard
✅ Permission-based route
✅ Protected menu

---

# Acceptance Criteria

## Auth

- user dapat login
- user dapat logout
- user dapat reset password

---

## Security

- password terhash
- route protected
- JWT working

---

## Dashboard

- dashboard layout berjalan
- sidebar responsive
- menu berdasarkan role

---

## Backend

- modular architecture
- validation working
- prisma migration working

---

# Vibe Coding Notes

## Prioritas

Fokus ke:

1. architecture
2. auth flow
3. RBAC
4. dashboard layout

Jangan overengineering.

---

## Hindari Dulu

- microservices
- websocket
- redis
- CQRS
- event-driven architecture

---

## Prinsip

- simple
- scalable
- maintainable
- type-safe
- fast development

---

# Definition of Done

Phase dianggap selesai jika:

- login berjalan
- dashboard berjalan
- role permission berjalan
- protected route berjalan
- backend & frontend terhubung
- database migration berjalan
- seed data berjalan
- project siap lanjut phase 2.
