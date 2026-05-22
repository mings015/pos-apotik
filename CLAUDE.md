# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a **documentation-first** project. Architecture, coding standards, and PRDs are defined in `/docs/` but source code has not yet been initialized. When implementing, follow the specs in:
- `/docs/master/architecture.md` — canonical technical stack & structure
- `/docs/master/coding-standards.md` — TypeScript, naming, API, DB, Git conventions
- `/docs/prd/` — phase-by-phase feature requirements

## Commands

Once the monorepo is initialized with pnpm:

```bash
# Install all dependencies
pnpm install

# Run individual apps in development
pnpm -F @pharmapos/web dev
pnpm -F @pharmapos/api dev

# Run all apps together (requires turbo or concurrently setup)
pnpm run dev

# Build & test (run together before commits)
pnpm run build && pnpm run test

# Lint all packages
pnpm run lint

# Run a single test file
pnpm -F @pharmapos/api test -- --testPathPattern=auth
pnpm -F @pharmapos/web test -- src/lib/utils.test.ts

# Prisma migrations (from apps/api)
pnpm -F @pharmapos/api prisma migrate dev
pnpm -F @pharmapos/api prisma db seed
```

## Repository Structure

```
kasir-apotik/
├── apps/
│   ├── web/          # SvelteKit frontend
│   └── api/          # NestJS backend
└── packages/
    ├── types/        # Shared TypeScript interfaces
    ├── config/       # Shared ESLint, Prettier, tsconfig
    └── ui/           # Shared shadcn/ui components
```

### Frontend (`apps/web/src/`)

| Directory | Purpose |
|-----------|---------|
| `routes/` | SvelteKit file-based routing |
| `components/` | Reusable UI components |
| `stores/` | Svelte stores (UI-only state) |
| `services/` | API client functions (use TanStack Query for server state) |
| `lib/` | Utilities and helpers |
| `hooks/` | Route interceptors (auth guards, session checks) |

### Backend (`apps/api/src/`)

| Directory | Purpose |
|-----------|---------|
| `modules/` | Domain modules — each is self-contained |
| `common/` | Global guards, interceptors, filters, decorators |
| `config/` | Environment config with validation |
| `prisma/` | Schema and migrations |

Each module follows: `controller/ → service/ → dto/` (repository lives in service if not complex).

## Key Architectural Patterns

### Request Flow
```
SvelteKit → NestJS Controller (DTO validation) → Service (business logic) → Prisma → PostgreSQL
```

### Backend Modules
`auth` · `users` · `roles` · `products` · `inventory` · `sales` · `purchases` · `suppliers` · `reports`

### Authentication & Authorization
- JWT access token (short-lived) + refresh token (secure cookie)
- RBAC with four roles: `SUPER_ADMIN`, `ADMIN`, `CASHIER`, `WAREHOUSE`
- All protected routes use NestJS JWT guard + role decorator

### Real-time & Background Jobs
- WebSocket for live inventory sync across cashier terminals
- Redis pub/sub for multi-instance coordination
- BullMQ (backed by Redis) for async tasks: report export, expiry checks, DB backup

### State Management (Frontend)
- **Svelte Store**: UI-only state (sidebar, modals, theme)
- **TanStack Query**: All server state — handles caching, refetching, optimistic updates
- Do not use global store for data fetched from the API

## Database Conventions

- All tables: UUID primary key, `created_at` + `updated_at` timestamps
- Use Prisma transactions for all financial and inventory operations
- Stock movements are always recorded in `stock_movements` (types: `IN`, `OUT`, `ADJUSTMENT`, `EXPIRED`, `RETURN`)
- Batch-level tracking required for expiration date monitoring
- Expired products (H-30 warning, blocked at H-0) are pharmacy-critical business rules

## TypeScript Standards

- Strict mode always on — no `any`, no type assertions unless unavoidable
- Shared types live in `packages/types/` — never duplicate across apps
- DTOs use `class-validator` decorators; validate all API inputs
- Zod + Superforms for frontend form validation

## Git Conventions

- Branch: `feature/`, `fix/`, `refactor/`
- Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
