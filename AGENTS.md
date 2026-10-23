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
| `src/proxy.ts` | Auth guards for `/dashboard`, `/login`, `/studio`, `/portal`; `/register` redirects to `/login` |

## Conventions

- Use `~/` path alias (same as existing imports).
- Server DB access: `src/server/db/` only; env via `~/env`.
- New UI: shadcn in `src/components/ui/` (`pnpm dlx shadcn@latest add …`).
- Drag-and-drop / reorder lists: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (client components; wrap sortable trees in `DndContext` + `SortableContext`).
- Client theme: defer `useTheme()` UI until mounted (see `theme-toggle.tsx`).
- Login page: wrap `useSearchParams()` usage in `<Suspense>`.
- **Do not** commit `.env`. Required deploy vars: `DATABASE_URL`, `DB_TABLE_PREFIX`, `AUTH_SECRET`, `AUTH_URL`. Invitation email also needs `GOOGLE_SMTP_USER` and `GOOGLE_SMTP_APP_PASSWORD`.

## When this folder is a product copy

Update `package.json` name, `.env.example` / `DB_TABLE_PREFIX`, and `NEXT_PUBLIC_APP_NAME`. Prefer **`db:push`** until you commit app-specific migrations. Fix generic bugs here in **simplycode-boiler** first, then port to product repos.

## Studio & portal

| Path | Access | Purpose |
|------|--------|---------|
| `/studio` | founder, lead, developer | Internal studio: projects, technologies, team, reviews, clients, messages, notifications |
| `/portal` | client | Client portal: project progress, updates, requests, notifications, review submission (completed projects only) |
| `/dashboard` | any signed-in user | Legacy route; proxy redirects by role to `/studio`, `/portal`, or `/login` |

- Roles live in `src/lib/roles.ts` (`founder`, `lead`, `developer`, `client`). Legacy DB values `admin`/`user` are normalized to `founder`/`developer`; do not remove those enum values without a migration.
- `founder` has full access. `lead` sees only projects assigned to them and can edit the projects they lead (including adding developers), but cannot create projects or manage reviews. `developer` sees only assigned projects. Clients never access `/studio`.
- Project email routing: project lead → project member with global `lead` role → founder. Plain developers do not receive project email.
- Registration is disabled. `/register` redirects to `/login`, the public registration API is removed, and Google OAuth only signs in emails that already exist. To add someone, a founder creates a tokenised invitation in `/studio/team` or `/studio/clients`; the recipient receives an email and sets their own password at `/accept-invite?token=…`. Invites live in `simplycode_invites`, expire after 7 days, and are single-use.
- Transactional email uses Google Workspace / Gmail SMTP through Nodemailer (`src/server/email/sendEmail.ts`). Set `GOOGLE_SMTP_USER` and `GOOGLE_SMTP_APP_PASSWORD` (an App Password, not the account password). `CONTACT_FROM_EMAIL` is optional and defaults to the SMTP user. Without credentials, development logs instead of sending; production throws.
- Multi-select fields use the shadcn Popover + Command component in `src/components/studio/multi-select.tsx`. It renders hidden inputs so server actions read values with `formData.getAll(name)`.
- Client-submitted reviews are inserted as `pending`; approve them in `/studio/reviews` before they appear publicly.
- Public work/review pages read the DB but fall back to bundled static content when the DB is empty or unavailable.
- Projects use `draft`, `published`, or `completed`. Published and completed projects are public. Only completed projects unlock the client review form and accept review submissions.
- Client requests can be marked `completed` or `rejected` by the project lead/founder. Rejection requires a reason; clients see the outcome and reason in the portal, and both outcomes create a client notification.
- Notifications use 10-second client polling via `/api/notifications` (not SSE/websockets) in both studio and portal. Contact form submissions create founder notifications and persist to `contact_messages`.
- Studio/portal actions live in `src/server/studio/actions.ts`; queries and static fallbacks live in `src/server/studio/queries.ts`. Keep server-only DB access under `src/server/`.
- Studio and portal share `src/components/dashboard-shell.tsx` (full-width layout, collapsible sidebar, sticky topbar). The collapsed state is stored in the `simplycode_studio_sidebar` / `simplycode_portal_sidebar` cookie and read server-side to avoid a hydration flash.
- The shared brand mark is `src/components/brand-logo.tsx`; pass `subtitle="Studio"` or `subtitle="Portal"` below the wordmark and `compact` for the icon-only sidebar state.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
