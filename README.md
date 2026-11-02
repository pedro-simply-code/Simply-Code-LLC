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

| Variable               | Purpose                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | Neon Postgres (**pooled** URL on Vercel/serverless)                                                            |
| `DB_TABLE_PREFIX`      | Table namespace, e.g. `simplycode` → `simplycode_users`                                                        |
| `AUTH_SECRET`          | Auth.js session signing (`openssl rand -base64 32`; 32+ chars enforced)                                        |
| `AUTH_URL`             | Public site URL (production domain on Vercel; also used for OAuth callbacks)                                   |
| `AUTH_GOOGLE_*`        | Google OAuth (optional in dev if omitted). `AUTH_GOOGLE_HD` optionally restricts sign-in to a Workspace domain |
| `UPLOADTHING_TOKEN`    | File uploads (optional until used)                                                                             |
| `NEXT_PUBLIC_APP_NAME` | UI title (optional; defaults to `SimplyCode`)                                                                  |

## Session strategy (JWT)

This template uses **JWT sessions** so **Google + email/password** work together.

| Strategy            | Pros                                                            | Cons                                                                       |
| ------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **JWT** (this repo) | Works with Credentials; fast middleware; no DB read per request | Role claims can stale until re-login; harder to revoke one session         |
| **Database**        | Easy session revoke; fresh user row on each request             | **Credentials provider is not supported** with DB-only sessions in Auth.js |

OAuth account linking still uses Drizzle (`accounts` table). Password hashes live in `users.password_hash` (Argon2id).

## Database

Uses **`@neondatabase/serverless`** + **`drizzle-orm/neon-http`**. Set `DATABASE_URL` from the Neon dashboard or Vercel Storage (pooled connection string).

Each app should use a **unique `DB_TABLE_PREFIX`** when sharing one Neon project. Schema is defined in `src/server/db/schema.ts`; table names are `${DB_TABLE_PREFIX}_*`.

`pnpm db:push` is interactive when it detects schema conflicts. If a non-TTY shell exits with `Interactive prompts require a TTY terminal`, rerun it in a terminal or apply the generated SQL manually.

## Auth routes

- `/login`
- `/accept-invite?token=…` (invite-only account setup)
- `/register` redirects to `/login`; public registration is disabled
- `/studio` (team), `/portal` (client), `/dashboard` (legacy role redirect)

Founders invite team and client accounts from `/studio/team` and `/studio/clients`. Invite emails are sent through Google SMTP; see `.env.example` for `GOOGLE_SMTP_USER` and `GOOGLE_SMTP_APP_PASSWORD`.

## Content (pages & posts)

The Studio ships a small CMS at `/studio/content` for **founders and leads**.

- One table (`content_entries`) stores both pages (`kind = "page"`) and posts (`kind = "post"`); the serialized Lexical editor state lives in `body` (jsonb).
- Pages publish at `/page/{slug}`. Posts publish at `/blog/{slug}` and are listed at `/blog`. Drafts stay hidden. Old root-level page URLs (`/{slug}`) permanently redirect to `/page/{slug}`.
- The editor uses **Lexical** (`lexical` + `@lexical/react`). Add paragraph, heading, quote or hero blocks from the toolbar's **Insert** menu; text blocks are edited directly on the canvas. The custom **Hero** block (`src/components/lexical/hero-node.tsx`) mirrors the homepage hero: content is pre-filled and every field (eyebrow, headline, highlight, links, stats) is edited in place, with a hover toolbar for the headline accent and block removal.
- Public rendering (`src/components/content/content-renderer.tsx`) walks the Lexical JSON on the server, so the editor bundle never ships to visitors.
- Slugs are unique per kind and used in public URLs (`/page/{slug}`, `/blog/{slug}`) instead of internal ids. Changing a slug does not create a redirect for the previous public URL.

## Security & operations

- **Headers:** `next.config.ts` sets HSTS (production), frame/MIME/referrer policies, COOP/CORP, and a `Content-Security-Policy-Report-Only` with violations posted to `/api/csp-report`. Once the report stream is clean, rename the header to `Content-Security-Policy` to enforce it.
- **Rate limiting:** `src/server/rate-limit.ts` uses a single atomic Postgres upsert (safe under concurrency). Login, contact, and invite acceptance are limited by IP/email.
- **2FA:** any signed-in user (founder, lead, developer, or client) can enable TOTP from their profile (`/studio/profile` or `/portal/profile`). Verification is stored in a signed, expiring `__Host-` cookie (production) tied to the user id.
- **Scheduled clean-up:** run `pnpm maintenance:cleanup` from a cron (for example daily) to prune expired rate-limit windows, stale upload claims, and old notifications. Pass the notification retention window in days: `pnpm maintenance:cleanup 90`.
- **Indexes:** new composite indexes are defined in `src/server/db/schema.ts`; apply them with `pnpm db:push` (or `pnpm db:generate` + `pnpm db:migrate`).

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add dialog
```

`components.json` is preconfigured.

## Deploy (Vercel)

1. Import the repo. Vercel reads **`engines.node`** (`24.x`) and `.node-version`.
2. **Environment variables** — add these explicitly (names must match; empty values fail the build):

   | Variable                   | Notes                                                                  |
   | -------------------------- | ---------------------------------------------------------------------- |
   | `DATABASE_URL`             | Pooled Neon URL                                                        |
   | `DB_TABLE_PREFIX`          | e.g. `simplycode`                                                      |
   | `AUTH_SECRET`              | Production secret; mark **Sensitive** in Vercel                        |
   | `AUTH_URL`                 | `https://your-app.vercel.app` (or custom domain)                       |
   | `GOOGLE_SMTP_USER`         | Google Workspace / Gmail address used to send invite and contact email |
   | `GOOGLE_SMTP_APP_PASSWORD` | Google App Password; mark **Sensitive** in Vercel                      |

3. **Neon integration:** Vercel may create vars like `cc_POSTGRES_URL` if you set an integration **prefix**. That prefix is **only for env var names** — the app still needs **`DATABASE_URL`**. Copy the **pooled** URL from Neon (or `vercel env pull`) into `DATABASE_URL`. Integration vars can stay; they are optional once `DATABASE_URL` is set.
4. After the first successful deploy, apply schema to production once from your machine (prod `DATABASE_URL` in env): **`pnpm db:push`** or **`pnpm db:migrate`** — see `drizzle/README.md`.
5. Redeploy after changing env vars.

## License

Private / your org — adjust as needed.
