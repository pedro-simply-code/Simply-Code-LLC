# simplycode-boiler

Opinionated starter for Vercel + Neon apps: **Next.js 16.4**, **React 19.3**, **Auth.js v5**, **Drizzle ORM 0.45**, **TanStack Query 5**, **shadcn/Radix**, **Jotai 3**, **dnd-kit**, **Uploadthing 7**, **Tailwind CSS 4.3**, **Zod 4**.

**Cursor / agents:** see **`AGENTS.md`** and **`.cursor/rules/`** for stack context and conventions.

**Runtime:** **Node.js 24.x** (see `.node-version` — use [fnm](https://github.com/Schniz/fnm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) locally to match Vercel).

## Quick start

```bash
pnpm install
cp .env.example .env
# If password login fails locally, ensure argon2 built: `.npmrc` enables it; run `pnpm rebuild argon2` if needed.
# Fill DATABASE_URL, AUTH_SECRET, optional Google + Uploadthing
pnpm db:push   # recommended for new apps; see drizzle/README.md for migrate workflow
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | Neon Postgres (**pooled** URL on Vercel/serverless) |
| `DB_TABLE_PREFIX` | Table namespace, e.g. `simplycode` → `simplycode_users` |
| `AUTH_SECRET` | Auth.js session signing (`openssl rand -base64 32`) |
| `AUTH_URL` | Public site URL (production domain on Vercel) |
| `AUTH_GOOGLE_*` | Google OAuth (optional in dev if omitted) |
| `UPLOADTHING_TOKEN` | File uploads (optional until used) |
| `NEXT_PUBLIC_APP_NAME` | UI title (optional; defaults to `SimplyCode`) |

## Session strategy (JWT)

This template uses **JWT sessions** so **Google + email/password** work together.

| Strategy | Pros | Cons |
| -------- | ---- | ---- |
| **JWT** (this repo) | Works with Credentials; fast middleware; no DB read per request | Role claims can stale until re-login; harder to revoke one session |
| **Database** | Easy session revoke; fresh user row on each request | **Credentials provider is not supported** with DB-only sessions in Auth.js |

OAuth account linking still uses Drizzle (`accounts` table). Password hashes live in `users.password_hash` (Argon2id).

## Database

Uses **`@neondatabase/serverless`** + **`drizzle-orm/neon-http`**. Set `DATABASE_URL` from the Neon dashboard or Vercel Storage (pooled connection string).

Each app should use a **unique `DB_TABLE_PREFIX`** when sharing one Neon project. Schema is defined in `src/server/db/schema.ts`; table names are `${DB_TABLE_PREFIX}_*`.

## Auth routes

- `/login`, `/register`
- `/dashboard` (authenticated)
- `/dashboard/admin` (requires `users.role = admin`)

Promote an admin in SQL or Drizzle Studio after registering.

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add dialog
```

`components.json` is preconfigured.

## Deploy (Vercel)

1. Import the repo. Vercel reads **`engines.node`** (`24.x`) and `.node-version`.
2. **Environment variables** — add these explicitly (names must match; empty values fail the build):

   | Variable | Notes |
   | -------- | ----- |
   | `DATABASE_URL` | Pooled Neon URL |
   | `DB_TABLE_PREFIX` | e.g. `simplycode` |
   | `AUTH_SECRET` | Production secret; mark **Sensitive** in Vercel |
   | `AUTH_URL` | `https://your-app.vercel.app` (or custom domain) |

3. **Neon integration:** Vercel may create vars like `cc_POSTGRES_URL` if you set an integration **prefix**. That prefix is **only for env var names** — the app still needs **`DATABASE_URL`**. Copy the **pooled** URL from Neon (or `vercel env pull`) into `DATABASE_URL`. Integration vars can stay; they are optional once `DATABASE_URL` is set.
4. After the first successful deploy, apply schema to production once from your machine (prod `DATABASE_URL` in env): **`pnpm db:push`** or **`pnpm db:migrate`** — see `drizzle/README.md`.
5. Redeploy after changing env vars.

## License

Private / your org — adjust as needed.
