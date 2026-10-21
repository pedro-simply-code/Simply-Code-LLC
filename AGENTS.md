# Agent guide (simplycode-boiler)

Opinionated **Next.js 16** starter: Auth.js v5 (JWT + Google + credentials), Drizzle + Neon, TanStack Query, shadcn, Tailwind 4, Uploadthing, Jotai, **@dnd-kit** (core + sortable + utilities).

## Commands

| Task | Command |
|------|---------|
| Dev | `pnpm dev` |
| Lint + types | `pnpm check` |
| DB sync (new apps) | `pnpm db:push` |
| DB migrations | `pnpm db:generate` then `pnpm db:migrate` |
| Production build | `pnpm build` |

**Node 24.x** (`.node-version`). Native **argon2**: `.npmrc` allows build; `pnpm rebuild argon2` if password auth fails.

**Lint:** `pnpm lint` runs ESLint flat config (`eslint-config-next`); Next 16 removed `next lint`. **Zod 4** + `@hookform/resolvers` 6. Held back on purpose: **TypeScript 7**, **ESLint 10**, **lucide-react 1.x**, **next-auth** until stable v5 ships.

## Layout

| Path | Purpose |
|------|---------|
| `src/app/` | App Router pages and API routes |
| `src/server/db/schema.ts` | Drizzle schema; tables = `${DB_TABLE_PREFIX}_*` |
| `src/lib/auth.ts`, `auth.config.ts` | Auth.js |
| `src/env.js` | Validated env (imported from `next.config.ts` — build needs vars set) |
| `src/middleware.ts` | Auth guards for `/dashboard`, `/login`, `/register` |

## Conventions

- Use `~/` path alias (same as existing imports).
- Server DB access: `src/server/db/` only; env via `~/env`.
- New UI: shadcn in `src/components/ui/` (`pnpm dlx shadcn@latest add …`).
- Drag-and-drop / reorder lists: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (client components; wrap sortable trees in `DndContext` + `SortableContext`).
- Client theme: defer `useTheme()` UI until mounted (see `theme-toggle.tsx`).
- Login page: wrap `useSearchParams()` usage in `<Suspense>`.
- **Do not** commit `.env`. Required deploy vars: `DATABASE_URL`, `DB_TABLE_PREFIX`, `AUTH_SECRET`, `AUTH_URL`.

## When this folder is a product copy

Update `package.json` name, `.env.example` / `DB_TABLE_PREFIX`, and `NEXT_PUBLIC_APP_NAME`. Prefer **`db:push`** until you commit app-specific migrations. Fix generic bugs here in **simplycode-boiler** first, then port to product repos.
