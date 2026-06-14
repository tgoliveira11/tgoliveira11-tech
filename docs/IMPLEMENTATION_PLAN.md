# PostForge Implementation Plan

Actionable phase-by-phase plan for building the blog publishing platform on top of the existing secure-auth foundation.

**Prerequisite:** Auth foundation complete (see [POSTFORGE_TDR.md §2](./POSTFORGE_TDR.md#2-current-state-existing-foundation)).

**Do not start any phase by modifying secure-auth tables or reimplementing auth.**

---

## Phase overview

| Phase | Name | Outcome |
|-------|------|---------|
| 1 | Blog domain foundation | Schema, migrations, repos, services, utilities |
| 2 | Public blog | Reader-facing pages, SEO, RSS, sitemap |
| 3 | Admin publishing | Dashboard, editor, preview, lifecycle actions |
| 4 | Images/assets | Upload, library, insert into Markdown |
| 5 | Analytics | View tracking, aggregates, admin dashboard |
| 6 | Migration | GitHub Pages import |
| 7 | Hardening | Tests, audit, accessibility, performance |

---

## Phase 1 — Blog domain foundation

**Goal:** PostForge-owned tables exist, migrations applied, core services callable from tests — no UI yet.

### 1.1 Schema and migrations

- [ ] Create `src/modules/posts/schema.ts` — `posts` table
- [ ] Create `src/modules/categories/schema.ts`
- [ ] Create `src/modules/tags/schema.ts` — include `post_tags` join
- [ ] Create `src/modules/assets/schema.ts`
- [ ] Create `src/modules/posts/revisions-schema.ts` — `post_revisions`
- [ ] Create `src/modules/redirects/schema.ts`
- [ ] Create `src/modules/analytics/schema.ts` — `analytics_events`, `post_daily_stats`
- [ ] Create `src/modules/settings/schema.ts` — `blog_settings`
- [ ] (Optional) Create `src/modules/audit/schema.ts` — `blog_audit_logs`
- [ ] Create `src/db/blog-schema.ts` — aggregate all module schemas
- [ ] Update `src/db/schema.ts` — re-export auth + blog schemas
- [ ] Add FK references to package `users.id` (import `users` from auth schema)
- [ ] Run `npm run db:generate` → verify `drizzle/0001_*.sql`
- [ ] Run `npm run db:migrate`
- [ ] Verify auth tables unchanged in `db:studio`

**Acceptance:** All blog tables exist; `users` table untouched.

### 1.2 Types and validation

- [ ] `post_status` enum in types
- [ ] Zod schemas: `createPostSchema`, `updatePostSchema`, `publishPostSchema`
- [ ] Zod schemas for categories, tags, assets, redirects
- [ ] Export inferred types: `Post`, `CreatePostInput`, etc.

### 1.3 Utilities

- [ ] `src/lib/slug.ts` — generate from title, normalize, handle collisions
- [ ] `src/modules/markdown/reading-time.ts` — words-per-minute calculation
- [ ] `src/lib/errors.ts` — `NotFoundError`, `ValidationError`, `ConflictError`
- [ ] `src/lib/env.ts` — blog env vars (`STORAGE_PROVIDER`, etc.)
- [ ] `src/modules/posts/queries.ts` — `publishedOnly` filter

### 1.4 Repositories

- [ ] `posts/repository.ts` — CRUD, `findPublishedBySlug`, `findScheduledReady`
- [ ] `categories/repository.ts`
- [ ] `tags/repository.ts` — include tag assignment
- [ ] `assets/repository.ts`
- [ ] `post_revisions/repository.ts`
- [ ] `redirects/repository.ts`
- [ ] `analytics/repository.ts`
- [ ] `settings/repository.ts`

### 1.5 Services

- [ ] `posts/service.ts`:
  - `createPost(userId)` — new draft with generated slug
  - `updatePost(id, input, userId)`
  - `publishPost(id, userId)`
  - `unpublishPost(id, userId)`
  - `schedulePost(id, scheduledAt, userId)`
  - `archivePost(id, userId)`
  - `duplicatePost(id, userId)`
  - `toggleFeatured(id, userId)`
  - `togglePinned(id, priority, userId)`
- [ ] `categories/service.ts` — CRUD
- [ ] `tags/service.ts` — CRUD + assign to post
- [ ] `redirects/service.ts` — create/resolve

### 1.6 Markdown (core only)

- [ ] `markdown/render.ts` — Markdown → sanitized HTML
- [ ] Integrate render into `updatePost` and `publishPost`
- [ ] Cache `contentHtmlCache` on save

### 1.7 Session helper

- [ ] `src/lib/auth/session.ts` — `requireAdminSession()` using secure-auth

### 1.8 Tests (Phase 1)

- [ ] Unit: slug generation
- [ ] Unit: reading time
- [ ] Unit: post validation schemas
- [ ] Unit: publish rules (cannot publish without title)
- [ ] Integration: create draft → update → publish

**Phase 1 exit criteria:** Services work in tests; DB has blog tables; no UI required.

---

## Phase 2 — Public blog

**Goal:** Readers can browse published content; drafts are invisible.

### 2.1 Route structure

- [ ] Create `src/app/(public)/layout.tsx` — public shell
- [ ] Move/replace home page → featured/pinned + recent posts
- [ ] `/blog` — paginated listing
- [ ] `/blog/[slug]` — post detail with sanitized HTML
- [ ] `/tags/[slug]` — posts by tag
- [ ] `/categories/[slug]` — posts by category
- [ ] `/search` — public full-text search
- [ ] Friendly `not-found.tsx`

### 2.2 Public components

- [ ] `post-card.tsx`, `post-content.tsx`, `pagination.tsx`
- [ ] `search-form.tsx`, `seo-head.tsx`
- [ ] JSON-LD component for `BlogPosting`

### 2.3 SEO and feeds

- [ ] `/rss.xml/route.ts` — published posts only
- [ ] `/sitemap.xml/route.ts` — posts, tags, categories
- [ ] `/robots.txt/route.ts` — disallow `/admin`
- [ ] Per-post metadata: title, description, OG, Twitter cards
- [ ] Canonical URL support

### 2.4 Redirects

- [ ] Middleware or route handler for `redirects` table lookup
- [ ] 301 for permanent, 302 for temporary

### 2.5 Search

- [ ] `search/public-search.ts` — PostgreSQL FTS, published only
- [ ] Add GIN indexes (if not in Phase 1 migration)

### 2.6 Tests (Phase 2)

- [ ] Integration: published post visible at `/blog/[slug]`
- [ ] Integration: draft post returns 404
- [ ] Integration: search returns only published
- [ ] Integration: RSS/sitemap exclude drafts

**Phase 2 exit criteria:** Public site works with manually inserted published posts (via service tests or seed script).

---

## Phase 3 — Admin publishing

**Goal:** Authenticated admin can manage posts end-to-end.

### 3.1 Admin shell

- [ ] `src/app/admin/layout.tsx` — auth guard via `requireAdminSession()`
- [ ] Admin navigation component
- [ ] `/admin` dashboard — post counts by status, recent activity

### 3.2 Post management

- [ ] `/admin/posts` — list with filters (status, tag, category, search)
- [ ] `/admin/posts/new` — create post project
- [ ] `/admin/posts/[id]` — edit workspace
- [ ] `/admin/posts/[id]/preview` — rendered preview
- [ ] `/admin/posts/[id]/revisions` — history + restore

### 3.3 API routes

- [ ] `POST /api/admin/posts` — create
- [ ] `GET/PATCH/DELETE /api/admin/posts/[id]`
- [ ] `POST /api/admin/posts/[id]/publish`
- [ ] `POST /api/admin/posts/[id]/unpublish`
- [ ] `POST /api/admin/posts/[id]/schedule`
- [ ] `POST /api/admin/posts/[id]/archive`
- [ ] `POST /api/admin/posts/[id]/duplicate`
- [ ] `PATCH /api/admin/posts/[id]/feature`
- [ ] `PATCH /api/admin/posts/[id]/pin`

### 3.4 Editor (minimal MVP)

- [ ] `markdown-editor.tsx` — textarea with toolbar (bold, italic, link, image, heading)
- [ ] `markdown-preview.tsx` — live preview using same render pipeline
- [ ] Autosave — debounced PATCH every 30s
- [ ] Revision created on autosave (throttled)

### 3.5 Lifecycle UI

- [ ] Status badges and action buttons (publish, unpublish, schedule, archive)
- [ ] Schedule datetime picker
- [ ] Featured/pin toggles
- [ ] Category and tag selectors

### 3.6 Scheduler

- [ ] `scheduler/publish-scheduled.ts` — service function
- [ ] `GET /api/cron/publish-scheduled` — protected by `CRON_SECRET`
- [ ] Idempotent batch publish
- [ ] Log failures; revalidate on success

### 3.7 Tests (Phase 3)

- [ ] Integration: schedule → cron → published
- [ ] E2E: login → create → publish → view public → unpublish
- [ ] Security: unauthenticated `/admin` redirects to login

**Phase 3 exit criteria:** Full publish lifecycle works through admin UI.

---

## Phase 4 — Images/assets

**Goal:** Admin can upload images per post and insert them into Markdown.

### 4.1 Storage

- [ ] `StorageProvider` interface
- [ ] `LocalStorageProvider` implementation
- [ ] Env config: `STORAGE_PROVIDER`, `STORAGE_LOCAL_ROOT`, `STORAGE_MAX_UPLOAD_BYTES`

### 4.2 Upload pipeline

- [ ] `assets/service.ts` — `uploadAsset(postId, file, userId)`
- [ ] Validate: MIME (image/jpeg, image/png, image/gif, image/webp), extension, size
- [ ] Sanitize filename — strip path separators, limit length
- [ ] Extract width/height (sharp or image-size)
- [ ] `POST /api/admin/posts/[id]/assets` — multipart upload

### 4.3 Serving

- [ ] `GET /api/assets/[id]` — stream file with correct Content-Type
- [ ] Or static file route for local storage

### 4.4 Admin UI

- [ ] `image-library.tsx` — grid of post assets
- [ ] Upload dropzone
- [ ] Copy URL button
- [ ] Insert into Markdown button (`![alt](url)`)
- [ ] Alt text / caption editing
- [ ] Delete asset (with confirmation)

### 4.5 Post cover and OG

- [ ] Select cover image from library → `coverAssetId`
- [ ] Select OG image → `ogAssetId`

### 4.6 Tests (Phase 4)

- [ ] Unit: filename sanitization, path traversal prevention
- [ ] Integration: upload → insert in Markdown → render in preview
- [ ] Security: reject .exe, oversize, `../../` filenames

**Phase 4 exit criteria:** Images work end-to-end in local development.

---

## Phase 5 — Analytics

**Goal:** Track post views and show admin reports.

### 5.1 Ingestion

- [ ] `POST /api/analytics/view` — record view (public, rate-limited)
- [ ] Capture: postId, referrer, deviceType, countryCode (optional)
- [ ] `visitorHash` for dedup — no raw IP
- [ ] Fire-and-forget from post detail page (client or edge)

### 5.2 Aggregation

- [ ] `analytics/service.ts` — `aggregateDaily(postId, date)`
- [ ] Nightly cron or inline increment → `post_daily_stats`
- [ ] Retention job — delete `analytics_events` older than N days

### 5.3 Admin dashboard

- [ ] `/admin/analytics` — total views, top posts, views over time chart
- [ ] Per-post analytics on `/admin/posts/[id]` — today, 7d, 30d, total

### 5.4 Tests (Phase 5)

- [ ] Integration: view event → daily stat increment
- [ ] Unit: no IP stored in event row

**Phase 5 exit criteria:** Admin sees view counts per post and site-wide.

---

## Phase 6 — GitHub Pages migration

**Goal:** Import existing Markdown blog into PostForge.

### 6.1 Import service

- [ ] `migration/github-pages.ts`:
  - Scan directory of `.md` files
  - Parse YAML frontmatter (gray-matter)
  - Extract title, date, tags, categories, slug
  - Detect image references
  - Map/copy images to assets
  - Create posts, tags, categories
  - Create redirects for URL changes
  - Generate `ImportReport`

### 6.2 Admin UI

- [ ] `/admin/import` — upload zip or specify path (dev only)
- [ ] Dry-run mode — report without writing
- [ ] Commit mode — execute import
- [ ] Display import report

### 6.3 Report contents

- [ ] Imported posts list
- [ ] Skipped posts with reasons
- [ ] Broken image references
- [ ] Missing metadata warnings
- [ ] Slug conflicts and resolutions
- [ ] Redirects created

### 6.4 Tests (Phase 6)

- [ ] Unit: frontmatter parsing
- [ ] Integration: import sample directory → verify posts + redirects

**Phase 6 exit criteria:** Sample GitHub Pages export imports successfully.

---

## Phase 7 — Hardening

**Goal:** Production-ready quality.

### 7.1 Error handling

- [ ] Consistent API error responses
- [ ] Admin toast notifications for failures
- [ ] Public friendly error pages

### 7.2 Audit logging

- [ ] Decide: secure-auth `audit_events` vs `blog_audit_logs`
- [ ] Log: publish, unpublish, schedule, delete, import, slug change

### 7.3 Tests

- [ ] Complete unit test coverage for utilities
- [ ] Integration test suite in CI
- [ ] E2E: full publish flow
- [ ] Security: draft visibility, upload restrictions, XSS payloads

### 7.4 Accessibility

- [ ] Semantic HTML on public pages
- [ ] Keyboard navigation in editor
- [ ] Alt text enforcement warnings

### 7.5 Performance

- [ ] Verify indexes on hot queries
- [ ] Image optimization (next/image where applicable)
- [ ] Cache headers for static assets

### 7.6 Operations

- [ ] Backup/export script for posts (JSON + assets)
- [ ] Document deployment for VPS vs Vercel
- [ ] Update `.env.example` with all blog vars

**Phase 7 exit criteria:** All acceptance criteria in [POSTFORGE_TDR.md §20](./POSTFORGE_TDR.md#20-acceptance-criteria-production-ready-mvp) met.

---

## Dependencies between phases

```
Phase 1 ──► Phase 2 ──► Phase 3
                │            │
                │            ├──► Phase 4
                │            │
                ▼            ▼
           Phase 5      Phase 6
                │            │
                └─────┬──────┘
                      ▼
                  Phase 7
```

- Phase 2 requires Phase 1 (services + schema)
- Phase 3 requires Phase 1; can parallel partially with Phase 2
- Phase 4 requires Phase 3 (post project workspace exists)
- Phase 5 requires Phase 2 (public post pages to track views)
- Phase 6 requires Phase 1 + Phase 4 (assets for image mapping)
- Phase 7 is last

---

## Suggested libraries (add when implementing)

| Concern | Library | Phase |
|---------|---------|-------|
| Validation | `zod` | 1 |
| Markdown | `remark`, `remark-gfm`, `remark-rehype`, `rehype-sanitize`, `rehype-highlight` | 1 |
| Frontmatter | `gray-matter` | 6 |
| Image metadata | `sharp` or `image-size` | 4 |
| Dates | `date-fns` | 2 |
| Testing | `vitest` | 1 |
| E2E | `playwright` (optional) | 7 |

---

## Related documents

- [ROADMAP.md](./ROADMAP.md) — milestone timeline
- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) — table definitions
- [ARCHITECTURE.md](./ARCHITECTURE.md) — code structure
- [POSTFORGE_TDR.md](./POSTFORGE_TDR.md) — requirements and acceptance criteria
