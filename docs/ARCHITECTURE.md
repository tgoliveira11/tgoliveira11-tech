# PostForge Architecture

This document describes the recommended code architecture for PostForge. It assumes the existing auth foundation is complete and must not be modified.

---

## Principles

1. **Auth is a dependency, not a feature** — consume `@tgoliveira/secure-auth`; never reimplement.
2. **Module boundaries** — each blog domain area owns its schema, types, validation, repository, and service.
3. **Thin routes** — App Router pages and API routes delegate to services; no business logic in route files.
4. **Published-only by default** — public queries go through a shared filter; admin queries opt out explicitly.
5. **Sanitize always** — Markdown → HTML passes through a sanitizer; never render raw Markdown HTML.
6. **Storage abstraction** — all file I/O goes through `StorageProvider`; no direct filesystem calls in services.

---

## Current layout (implemented)

```
postforge/
├── docker-compose.yml          # PostgreSQL 16
├── drizzle.config.ts           # Drizzle Kit config
├── drizzle/                    # Auth migration (0000_*)
├── docs/                       # Project documentation
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + SecureAuthUIProvider
│   │   ├── page.tsx            # Placeholder home (to be replaced)
│   │   ├── globals.css
│   │   ├── login/              # secure-auth UI pages
│   │   ├── register/
│   │   ├── settings/
│   │   └── api/
│   │       ├── auth/           # secure-auth route wrappers
│   │       └── account/        # secure-auth route wrappers
│   ├── components/
│   │   └── providers.tsx       # SessionProvider + SecureAuthUIProvider
│   ├── db/
│   │   ├── client.ts           # Drizzle client (lazy proxy)
│   │   └── schema.ts           # Re-exports auth schema only (today)
│   └── lib/
│       ├── auth/
│       │   └── secure-auth.ts  # createSecureAuth composition root
│       ├── email/
│       │   └── dev-email-provider.ts
│       └── env/
│           ├── parse.ts
│           └── secure-auth-from-env.ts
```

---

## Target layout (to implement)

```
src/
├── app/
│   ├── (public)/                    # Public blog — no auth required
│   │   ├── layout.tsx               # Public shell (header, footer)
│   │   ├── page.tsx                 # Home (featured/pinned + recent)
│   │   ├── blog/
│   │   │   ├── page.tsx             # Blog listing (paginated)
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Post detail
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── tags/
│   │   │   └── [slug]/page.tsx
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx
│   │   ├── not-found.tsx            # Friendly 404
│   │   ├── rss.xml/route.ts
│   │   ├── sitemap.xml/route.ts
│   │   └── robots.txt/route.ts
│   │
│   ├── admin/                       # Protected — ADMIN_EMAIL session
│   │   ├── layout.tsx               # Admin shell + requireAdminSession()
│   │   ├── forbidden.tsx            # 403 for non-admin users
│   │   ├── page.tsx                 # Dashboard
│   │   └── posts/
│   │       ├── page.tsx             # Post list + filters
│   │       ├── new/page.tsx
│   │       └── [id]/
│   │           ├── page.tsx         # Redirect → edit
│   │           ├── edit/page.tsx
│   │           └── preview/page.tsx
│   │
│   ├── api/
│   │   ├── auth/                    # EXISTS — secure-auth wrappers
│   │   ├── account/                 # EXISTS — secure-auth wrappers
│   │   ├── admin/                   # Blog admin API (new)
│   │   │   └── posts/
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           ├── route.ts
│   │   │           ├── publish/route.ts
│   │   │           ├── assets/route.ts
│   │   │           └── revisions/route.ts
│   │   ├── assets/
│   │   │   └── [id]/route.ts        # Serve uploaded files
│   │   ├── analytics/
│   │   │   └── post-view/route.ts     # Record post view (public)
│   │   ├── admin/
│   │   │   └── posts/[id]/assets/     # Multipart upload (admin)
│   │   └── assets/[...path]/          # Serve local uploads (public)
│   │
│   ├── login/                       # EXISTS — secure-auth
│   ├── register/                    # EXISTS — secure-auth
│   └── settings/                    # EXISTS — secure-auth account settings
│
├── components/
│   ├── providers.tsx                # EXISTS
│   ├── public/                      # Public blog components
│   │   ├── post-card.tsx
│   │   ├── post-content.tsx
│   │   ├── pagination.tsx
│   │   ├── search-form.tsx
│   │   └── seo-head.tsx
│   ├── admin/                       # Admin components
│   │   ├── post-list-table.tsx
│   │   ├── post-status-badge.tsx
│   │   ├── post-filters.tsx
│   │   └── analytics/               # M5 dashboard widgets
│   │       ├── analytics-summary-cards.tsx
│   │       ├── top-posts-table.tsx
│   │       ├── views-over-time.tsx
│   │       └── referrer-breakdown.tsx
│   ├── editor/                      # Markdown editor
│   │   ├── markdown-editor.tsx
│   │   ├── markdown-preview.tsx
│   │   ├── image-library.tsx
│   │   └── insert-image-dialog.tsx
│   └── ui/                          # Shared UI primitives (non-auth)
│
├── modules/
│   ├── posts/
│   │   ├── schema.ts                # Drizzle table definition
│   │   ├── types.ts
│   │   ├── validation.ts            # Zod schemas
│   │   ├── repository.ts            # DB queries
│   │   ├── service.ts               # Business logic
│   │   └── queries.ts               # Shared query filters (publishedOnly)
│   ├── assets/
│   │   ├── schema.ts
│   │   ├── types.ts
│   │   ├── validation.ts
│   │   ├── repository.ts
│   │   ├── service.ts
│   │   └── storage/
│   │       ├── provider.ts          # StorageProvider interface
│   │       ├── local.ts               # LocalStorageProvider
│   │       └── s3.ts                  # Future
│   ├── tags/
│   │   ├── schema.ts
│   │   ├── types.ts
│   │   ├── validation.ts
│   │   ├── repository.ts
│   │   └── service.ts
│   ├── categories/
│   │   └── ... (same pattern)
│   ├── analytics/
│   │   ├── analytics.schema.ts
│   │   ├── analytics.repository.ts   # events + write-time daily upsert
│   │   ├── analytics.service.ts      # track + admin summaries
│   │   ├── analytics.helpers.ts      # UTC ranges, referrer normalization
│   │   ├── analytics.query-helpers.ts
│   │   └── rate-limit.ts             # in-memory hashed client key (MVP)
│   ├── import/                      # M6 GitHub Pages migration
│   │   ├── github-pages-importer.ts
│   │   ├── github-pages-parser.ts
│   │   ├── github-pages-images.ts
│   │   └── github-pages-report.ts
│   ├── redirects/
│   │   └── ...
│   ├── markdown/
│   │   ├── render.ts                # Markdown → sanitized HTML
│   │   ├── reading-time.ts
│   │   └── toc.ts                   # Optional TOC generator
│   ├── search/
│   │   ├── public-search.ts
│   │   └── admin-search.ts
│   ├── scheduler/
│   │   └── publish-scheduled.ts
│   └── settings/
│       └── ...
│
├── db/
│   ├── schema.ts                    # Re-export auth + blog schemas
│   ├── blog-schema.ts               # Aggregates module schemas
│   └── client.ts                    # EXISTS
│
└── lib/
    ├── auth/
    │   ├── secure-auth.ts           # EXISTS — do not duplicate
    │   └── session.ts               # Helper: getServerSession wrapper
    ├── slug.ts                      # Slug generation/normalization
    ├── dates.ts                     # Date formatting utilities
    ├── errors.ts                    # App error types
    ├── env.ts                       # Blog-specific env vars
    └── revalidation.ts              # Next.js cache tag helpers
```

---

## Module pattern

Each domain module follows this structure:

```
modules/{domain}/
  schema.ts      # Drizzle pgTable definition
  types.ts        # TypeScript types (infer from schema + DTOs)
  validation.ts   # Zod input/output schemas
  repository.ts   # Raw DB operations (no business rules)
  service.ts      # Business logic, orchestration
```

### Layer responsibilities

| Layer | Responsibility | Example |
|-------|----------------|---------|
| `schema.ts` | Table/column definitions | `posts` table |
| `types.ts` | Inferred types, DTOs | `Post`, `CreatePostInput` |
| `validation.ts` | Input validation | `createPostSchema` (Zod) |
| `repository.ts` | CRUD queries | `findPublishedBySlug(slug)` |
| `service.ts` | Rules, side effects | `publishPost(id, userId)` |
| Route handler | HTTP translation | Parse request → call service → respond |

### Example flow: publish post

```
PostEditorForm → publishPostAction(postId)
  → admin-posts.actions.ts: requireAdminSession() — session + ADMIN_EMAIL
  → posts/service.publishPost(id, session.user.id)
    → validation: post exists, publishable title/slug/content
    → markdown/render: update contentHtmlCache
    → posts/repository.update(status, publishedAt)
    → post_revisions/repository.create(snapshot)
    → revalidatePublicPaths(slug)
  → client router.refresh()
```

Admin mutations use **Server Actions** (`src/modules/posts/admin-posts.actions.ts`), not `/api/admin/*` route handlers. REST admin API can be added later if needed for external clients.

---

## Auth integration (do not reimplement)

### Composition root (exists)

```typescript
// src/lib/auth/secure-auth.ts
export const secureAuth = createSecureAuth({ db, ... });
```

### Authentication vs authorization

| Layer | Owner | Mechanism |
|-------|-------|-----------|
| Authentication | `@tgoliveira/secure-auth` | Login, sessions, `users` identity |
| Authorization | PostForge | `ADMIN_EMAIL` env check for admin routes |

Authentication proves who the user is. Authorization decides whether that user may access PostForge admin features. These are separate concerns — do not conflate them.

### Admin route protection

Create a thin session helper — **authentication** from secure-auth, **authorization** from PostForge:

```typescript
// src/lib/auth/session.ts (to implement)
import { getServerSession } from "next-auth";
import { redirect, forbidden } from "next/navigation";
import { secureAuth } from "./secure-auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();

export async function requireAdminSession() {
  const session = await getServerSession(secureAuth.getAuthOptions());

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  const email = session.user.email?.trim().toLowerCase();
  if (!ADMIN_EMAIL || !email || email !== ADMIN_EMAIL) {
    forbidden(); // 403 — authenticated but not authorized
  }

  return session;
}
```

Use in `admin/layout.tsx`, all `/api/admin/*` route handlers, and preview routes (MVP).

**MVP rule:** A user may be authenticated but still not authorized. Only the configured `ADMIN_EMAIL` may access admin features.

### Future RBAC

If multiple authors/editors are needed:

- Add PostForge-owned table: `blog_user_roles` or `admin_members`
- FK to package `users.id` — do **not** modify secure-auth `users` table
- Do **not** create a new `users` table
- `requireAdminSession()` evolves to check role membership instead of (or in addition to) `ADMIN_EMAIL`

### User ID for ownership

```typescript
// In services
import { users } from "@/db/schema"; // package-owned

// posts.createdBy = session.user.id (UUID from secure-auth users table)
```

### What NOT to build

- Login/register pages (exist)
- Session management UI (exists at `/settings/sessions`)
- Password reset flow (exists)
- Passkey/2FA setup (exists at `/settings/security`)
- Custom `users` table or user registration API

---

## Endpoint authorization matrix

| Route pattern | Session | Authorization |
|---------------|---------|---------------|
| Public pages | Not required | None |
| `/admin/*` | secure-auth session | `ADMIN_EMAIL` match |
| `/api/admin/*` | secure-auth session | `ADMIN_EMAIL` match |
| Preview routes (`/admin/posts/[id]/preview`) | secure-auth session | `ADMIN_EMAIL` match or secure preview token (future) |
| `/api/cron/*` | Not required | `CRON_SECRET` |
| `/api/analytics/post-view` | Not required | Public; rate-limited + validated (published posts only) |
| `/admin/analytics` | secure-auth session | `ADMIN_EMAIL` match |
| `/admin/analytics/posts/[id]` | secure-auth session | `ADMIN_EMAIL` match |
| `/admin/import` | secure-auth session | `ADMIN_EMAIL` match |

---

## Public vs admin query separation

### Shared filter (critical)

```typescript
// modules/posts/queries.ts
export const publishedOnly = and(
  eq(posts.status, "published"),
  isNotNull(posts.publishedAt),
  lte(posts.publishedAt, new Date())
);
```

Every public-facing query **must** include `publishedOnly`. Enforce via repository methods:

- `repository.findPublished*()` — for public
- `repository.findById()` — for admin (no status filter)

---

## StorageProvider abstraction

```typescript
// modules/assets/storage/provider.ts
export interface StorageProvider {
  upload(input: {
    key: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<{ storageKey: string; publicUrl: string }>;

  delete(storageKey: string): Promise<void>;

  getPublicUrl(storageKey: string): string;
}
```

### LocalStorageProvider (MVP)

- Root: `process.env.STORAGE_LOCAL_ROOT` (default `./storage`)
- Key pattern: `posts/{postId}/{uuid}-{safeFilename}`
- Serve via `/api/assets/[id]` route (looks up `assets.publicUrl`)

### Selection by env

```typescript
// STORAGE_PROVIDER=local | s3 | r2
```

---

## Markdown pipeline

```
contentMarkdown
  → remark-parse
  → remark-gfm (tables, strikethrough)
  → remark-rehype
  → rehype-highlight (syntax highlighting)
  → rehype-sanitize (allowlist schema)
  → contentHtmlCache (stored in DB)
```

Run on: save, publish, and revision restore. Skip if Markdown unchanged (hash comparison).

---

## Caching and revalidation

| Event | Revalidation |
|-------|-------------|
| Publish | `/`, `/blog`, `/blog/[slug]`, `/sitemap.xml`, `/rss.xml` |
| Unpublish | Same + remove from sitemap/RSS on next generation |
| Tag/category change | `/tags/[slug]`, `/categories/[slug]` |
| Settings change | `/`, `/rss.xml` |

Use Next.js `revalidatePath` or `revalidateTag` with tags like `posts`, `post:{slug}`.

---

## Redirect middleware

Check `redirects` table early in request lifecycle:

1. Option A: Next.js middleware (`middleware.ts`) — lookup `fromPath`
2. Option B: Dynamic catch-all that checks redirects before 404

Prefer middleware for performance on high-traffic paths.

---

## Environment variables (blog-specific, to add)

| Variable | Purpose | Default |
|----------|---------|---------|
| `ADMIN_EMAIL` | Email allowed to access `/admin` and `/api/admin/*` | **required** in prod |
| `STORAGE_PROVIDER` | `local` \| `s3` \| `r2` | `local` |
| `STORAGE_LOCAL_ROOT` | Local upload directory | `./storage` |
| `STORAGE_MAX_UPLOAD_BYTES` | Max file size | `5242880` (5 MB) |
| `CRON_SECRET` | Scheduler endpoint auth | required in prod |
| `BLOG_SITE_URL` | Canonical site URL | `APP_BASE_URL` |
| `ANALYTICS_RETENTION_DAYS` | Raw event retention | `90` |

Auth env vars remain in `.env.example` (already documented). Blog vars will be appended during Phase 1.

---

## Security architecture

| Concern | Approach |
|---------|----------|
| Authentication | secure-auth session via `secureAuth` |
| Admin authorization | `ADMIN_EMAIL` match after session check |
| Public pages | No authentication required |
| Preview routes | `ADMIN_EMAIL` session or secure preview token (future) |
| Cron endpoints | `CRON_SECRET` — no user session |
| Analytics ingestion | Public; rate-limited; validate slug/postId and published status; no raw IP stored |
| Analytics admin UI | Aggregate counts only; session hashes never shown |
| Analytics aggregation | Write-time upsert to `post_daily_stats` on each view (Option A) |
| Analytics rate limit | In-memory per server instance; use Redis/edge/DB for multi-instance production |
| Public data | `publishedOnly` filter on all queries |
| XSS | rehype-sanitize on Markdown HTML |
| File uploads | MIME + extension + size validation; safe filenames |
| Path traversal | Storage keys generated server-side; never use raw user paths |
| Cron endpoint | `CRON_SECRET` header validation |
| CSRF | Next.js server actions / SameSite cookies (auth handled by secure-auth) |
| Rate limiting | Auth rate limits via secure-auth; public analytics uses in-memory hashed client key |

---

## Deployment topology

### Local development (current)

```
Docker PostgreSQL ← Drizzle ← Next.js dev server
                         ↑
              secure-auth tables (migrated)
```

### VPS deployment

```
Nginx/Caddy → Next.js (Node)
              ├── LocalStorageProvider
              └── PostgreSQL
Cron → /api/cron/publish-scheduled
```

### Vercel deployment

```
Vercel → Next.js
         ├── Object storage (S3/R2) — required
         ├── Vercel Postgres or external PostgreSQL
         └── Vercel Cron → /api/cron/publish-scheduled
```

---

## Testing architecture

```
src/
  test/                    # or tests/ at root
    unit/
      slug.test.ts
      markdown.test.ts
      reading-time.test.ts
      publish-rules.test.ts
    integration/
      posts.test.ts
      search.test.ts
      scheduler.test.ts
    e2e/
      publish-flow.test.ts
```

Use Vitest (aligns with secure-auth ecosystem). E2E with Playwright optional.

---

## Related documents

- [POSTFORGE_TDR.md](./POSTFORGE_TDR.md) — requirements
- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) — database tables
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — phased tasks
- [ROADMAP.md](./ROADMAP.md) — milestones
