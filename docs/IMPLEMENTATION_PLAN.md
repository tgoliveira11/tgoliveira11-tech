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
| 5 | Analytics | View tracking, aggregates, admin dashboard ✅ |
| 6 | Migration | GitHub Pages import ✅ |
| 7 | Hardening | Tests, audit, accessibility, performance |

---

## Phase 1 — Blog domain foundation

**Status:** ✅ Implemented (migration `drizzle/0001_messy_goliath.sql`)

**Goal:** PostForge-owned tables exist, migrations applied, core services callable from tests — no UI yet.

### Implementation notes (M1)

- Module schemas live at `src/modules/*/*.schema.ts` (not a separate `revisions-schema.ts`; `post_revisions` is in `posts.schema.ts`).
- `publishedPostFilter()` lives in `posts.repository.ts` (not `posts/queries.ts`).
- Slug utilities live in `src/modules/posts/slug.ts` (not `src/lib/slug.ts`).
- Admin authorization: `src/modules/admin/authorization.ts` + `is-admin-email.ts` (not `src/lib/auth/session.ts`).
- `blog_audit_logs` deferred; `blog_settings` implemented as key-value table.
- `coverAssetId` / `ogAssetId` have **no database FK** to `assets` (avoids migration cycle); enforced in services.
- Autosave revisions deferred to Phase 3 (comment in `posts.service.ts`).
- DB integration tests deferred; unit tests cover slug, validation, visibility, markdown, admin email.

### 1.1 Schema and migrations

- [x] Create `src/modules/posts/posts.schema.ts` — `posts`, `post_tags`, `post_revisions`
- [x] Create `src/modules/categories/categories.schema.ts`
- [x] Create `src/modules/tags/tags.schema.ts`
- [x] Create `src/modules/assets/assets.schema.ts`
- [x] Create `src/modules/redirects/redirects.schema.ts`
- [x] Create `src/modules/analytics/analytics.schema.ts` — `analytics_events`, `post_daily_stats`
- [x] Create `src/modules/settings/blog-settings.schema.ts` — `blog_settings`
- [ ] (Optional) `blog_audit_logs` — deferred
- [x] Create `src/db/blog-schema.ts`
- [x] Update `src/db/schema.ts`
- [x] FK references to package `users.id`
- [x] `npm run db:generate` → `drizzle/0001_messy_goliath.sql`
- [x] `npm run db:migrate`

**Acceptance:** All blog tables exist; `users` table untouched.

### 1.2 Types and validation

- [x] `post_status`, `revision_type`, `analytics_event_type` enums
- [x] Zod schemas for posts, categories, tags, assets, redirects
- [x] Export inferred types

### 1.3 Utilities

- [x] `src/modules/posts/slug.ts`
- [x] `src/modules/posts/reading-time.ts`
- [x] `src/lib/errors.ts`
- [x] `src/lib/env.ts`
- [x] `publishedPostFilter()` in `posts.repository.ts`

### 1.4 Repositories

- [x] `posts.repository.ts` (includes revisions)
- [x] `categories.repository.ts`
- [x] `tags.repository.ts`
- [x] `assets.repository.ts`
- [x] `redirects.repository.ts`
- [x] `analytics.repository.ts`
- [ ] `settings.repository.ts` — deferred (schema only for now)

### 1.5 Services

- [x] `posts.service.ts` — full lifecycle
- [x] `categories.service.ts`
- [x] `tags.service.ts`
- [x] `redirects.service.ts`
- [x] `assets.service.ts` — metadata + StorageProvider
- [x] `analytics.service.ts` — `trackPostView`, blog/post summaries, breakdowns, write-time daily stats

### 1.6 Markdown (core only)

- [x] `markdown-renderer.ts`, `markdown-sanitizer.ts`
- [x] Integrated into `updateDraft` and `publishPost`

### 1.7 Admin authorization helper

- [x] `src/modules/admin/authorization.ts` + `is-admin-email.ts`
- [x] `ADMIN_EMAIL` in `src/lib/env.ts` and `.env.example`
- [x] Unit tests for `isAdminEmail`

### 1.8 Tests (Phase 1)

- [x] Unit: slug, reading time, validation, publish/schedule rules, public visibility, markdown, admin email, asset validation
- [ ] Integration: create draft → publish (deferred — needs test DB harness)

**Phase 1 exit criteria:** Services work in tests; DB has blog tables; no UI required.

---

## Phase 2 — Public blog

**Status:** ✅ Implemented

**Goal:** Readers can browse published content; drafts are invisible.

### Implementation notes (M2)

- Public routes live under `src/app/(public)/` with shared layout and components in `src/components/public/`.
- Published-only queries centralized in `src/modules/public/public-posts.repository.ts` using `publishedPostFilter()` from M1.
- SEO helpers in `src/modules/public/seo.ts`; RSS/sitemap/robots in `src/modules/public/rss.ts` and `sitemap.ts`.
- Post view tracking: `POST /api/analytics/post-view` with in-memory rate limiting (`src/modules/analytics/rate-limit.ts`).
- Redirects: **Option A only** — `/blog/[slug]` checks `redirects` table when no published post exists; arbitrary catch-all/middleware redirects deferred to M6.
- Related posts on detail page deferred (neighbors prev/next implemented).
- Tag/category index lists only tags/categories with at least one published post via `listPublicTags` / `listPublicCategories`.
- Search uses PostgreSQL FTS on title, excerpt, and `contentMarkdown` (tag/category name search deferred).
- RSS returns 404 when disabled in `blog_settings` or env.
- Route integration tests deferred; unit tests cover SEO, RSS, sitemap, visibility, analytics validation, rate limiting.

### 2.1 Route structure

- [x] Create `src/app/(public)/layout.tsx` — public shell
- [x] Move/replace home page → featured/pinned + recent posts
- [x] `/blog` — paginated listing
- [x] `/blog/[slug]` — post detail with sanitized HTML
- [x] `/tags` and `/tags/[slug]` — posts by tag
- [x] `/categories` and `/categories/[slug]` — posts by category
- [x] `/search` — public full-text search
- [x] Friendly `not-found.tsx`

### 2.2 Public components

- [x] `public-layout.tsx`, `site-header.tsx`, `site-footer.tsx`
- [x] `post-card.tsx`, `post-list.tsx`, `tag-list.tsx`, `category-list.tsx`
- [x] `search-form.tsx`, `empty-state.tsx`, `pagination.tsx`
- [x] `post-view-tracker.tsx` — client-side view tracking
- [x] JSON-LD via `buildBlogPostingJsonLd` in post detail metadata

### 2.3 SEO and feeds

- [x] `/rss.xml/route.ts` — published posts only
- [x] `src/app/sitemap.ts` — posts, tags, categories
- [x] `/robots.txt/route.ts` — disallow `/admin`
- [x] Per-post metadata: title, description, OG, Twitter cards
- [x] Canonical URL support

### 2.4 Redirects

- [x] `/blog/[slug]` checks `redirects` when post not found (301/302 via `permanentRedirect`/`redirect`)
- [ ] Middleware/catch-all legacy redirects — deferred to M6 (Edge runtime + DB access risk)

### 2.5 Search

- [x] `searchPublishedPostBundles` — PostgreSQL FTS, published only
- [ ] GIN indexes — deferred (FTS works without dedicated index for MVP scale)

### 2.6 Analytics (M2 subset)

- [x] `POST /api/analytics/post-view` — published posts only, no raw IP
- [x] In-memory rate limiting per client key
- [x] Daily aggregation dashboard — M5 (write-time upsert to `post_daily_stats`)

### 2.7 Tests (Phase 2)

- [x] Unit: public visibility (`isPublicPost`)
- [x] Unit: SEO fallbacks, RSS builder, sitemap/robots, analytics validation, rate limiting
- [ ] Integration: published post visible at `/blog/[slug]` — deferred (needs test DB harness)
- [ ] Integration: draft post returns 404 — deferred
- [ ] Integration: search returns only published — deferred

**Phase 2 exit criteria:** Public site works with manually inserted published posts (via service tests or seed script). ✅

---

## Phase 3 — Admin publishing

**Status:** ✅ Implemented

**Goal:** Authorized admin (`ADMIN_EMAIL`) can manage posts end-to-end.

### Implementation notes (M3)

- Admin UI under `src/app/admin/` protected by `requireAdminSession()` in layout.
- Non-admin authenticated users receive Next.js `forbidden()` → `src/app/admin/forbidden.tsx`.
- Mutations use **Server Actions** in `src/modules/posts/admin-posts.actions.ts` (not `/api/admin/*` route handlers).
- Tag assignment wired via `post-tags.repository.ts` + `tagIds` on create/update.
- Dashboard stats via `getDashboardStats()` in `posts.service.ts`.
- Public path revalidation via `revalidatePublicPaths()` after publish/unpublish/archive.
- Manual **Save draft** only — autosave deferred.
- Revisions page/history UI deferred (revisions still created on manual save, publish, unpublish).
- Scheduler cron deferred to M3.6 follow-up (schedule UI sets status; auto-publish not wired).
- Admin list tag filter deferred; category + search + status filters implemented.
- Markdown editor: textarea + live sanitized preview (no toolbar, no image upload — M4).

### Manual smoke flow

1. Login as `ADMIN_EMAIL`
2. Open `/admin`
3. Create draft (New Post)
4. Edit title/slug/content, assign category/tags, save
5. Preview at `/admin/posts/[id]/preview`
6. Publish
7. Open `/blog/[slug]` — post visible
8. Unpublish
9. Confirm `/blog/[slug]` returns 404

### 3.1 Admin shell

- [x] `src/app/admin/layout.tsx` — auth guard via `requireAdminSession()`
- [x] Return 403 for authenticated non-admin users (`forbidden()` + `forbidden.tsx`)
- [x] Admin navigation component
- [x] `/admin` dashboard — post counts by status, recent activity

### 3.2 Post management

- [x] `/admin/posts` — list with filters (status, category, search, sort)
- [x] `/admin/posts/new` — create post project
- [x] `/admin/posts/[id]/edit` — edit workspace
- [x] `/admin/posts/[id]/preview` — rendered preview
- [ ] `/admin/posts/[id]/revisions` — deferred (revisions stored; UI later)

### 3.3 Mutations (Server Actions)

All actions call `requireAdminSession()` before handling requests.

- [x] `createDraftAction`
- [x] `updatePostAction`
- [x] `publishPostAction`
- [x] `unpublishPostAction`
- [x] `schedulePostAction`
- [x] `archivePostAction`
- [x] `duplicatePostAction`
- [x] `markFeaturedAction`
- [x] `pinPostAction`
- [x] `previewMarkdownAction`

### 3.4 Editor (writing-first workspace)

- [x] `post-editor-form.tsx` — two-column layout: main writing column + metadata sidebar
- [x] `editor-sticky-header.tsx` — back link, status badge, save/preview/publish always visible
- [x] `markdown-editor.tsx` — Write / Preview / Split tabs, larger textarea, `contentMarkdown` preserved
- [x] Sidebar cards: status, compact assets, taxonomy, promotion, SEO (collapsed), schedule, danger zone
- [x] `docs/UI_UX_SKILL.md` + `.cursor/rules/postforge-ui-ux.mdc` — admin UI principles
- [ ] Autosave — deferred; manual Save draft with `createRevision: true`
- [ ] Editor toolbar — deferred
- [ ] Inline tag creation — deferred (helper text points to tag management)

**Save/publish safety (unchanged):** `updatePostAction` with `intent=publish` saves current form fields then publishes the same post ID. Cover/OG asset IDs are set via asset actions only and are not cleared on save.

**Assets:** Large upload form removed from top of page; `compact-post-assets-panel.tsx` in sidebar with thumbnails, cover/OG pickers, and insert actions.

### 3.5 Lifecycle UI

- [x] Status badges and action buttons (publish, unpublish, schedule, archive, duplicate)
- [x] Schedule datetime picker
- [x] Featured/pin toggles
- [x] Category and tag selectors

### 3.6 Scheduler

- [ ] `scheduler/publish-scheduled.ts` — deferred
- [ ] `GET /api/cron/publish-scheduled` — deferred
- [x] Schedule UI sets `status = scheduled` with future `scheduledAt`

### 3.7 Tests (Phase 3)

- [x] Unit: admin validation, lifecycle visibility, pin schema, authorization email helper
- [ ] Integration: schedule → cron → published — deferred
- [ ] E2E: full admin flow — deferred (manual smoke documented above)
- [ ] Security: route integration tests — deferred

**Phase 3 exit criteria:** Full publish lifecycle works through admin UI. ✅

---

## Phase 4 — Images/assets

**Status:** ✅ Implemented

**Goal:** Admin can upload images per post and insert them into Markdown.

### Implementation notes (M4)

- Storage uses existing `StorageProvider` + `LocalStorageProvider` with env vars `UPLOAD_LOCAL_DIR`, `UPLOAD_PUBLIC_BASE_URL`, `UPLOAD_MAX_FILE_SIZE_BYTES` (alias `UPLOAD_MAX_FILE_SIZE`).
- Upload: `POST /api/admin/posts/[id]/assets` (multipart) → `uploadPostAsset()` in `assets.service.ts`.
- Serving: `GET /api/assets/[...path]` streams files from local storage with cache headers.
- Admin UI: `/admin/posts/[id]/assets` + embedded panel on edit page.
- Cover/OG selection via server actions; ownership enforced in service layer (no DB FK on `coverAssetId`/`ogAssetId`).
- Markdown insertion: **Option A** — Insert button appends to editor; Copy URL/Markdown also available.
- SVG rejected (no sanitizer). Width/height deferred (no sharp/image-size dependency).
- Public rendering uses `PostImage` (`next/image`, unoptimized when dimensions unknown).
- Global media library (`/admin/media`) deferred — post-specific assets only.

### Manual smoke flow

1. Login as `ADMIN_EMAIL` → open draft post
2. Upload image on assets page or editor panel
3. Copy/Insert Markdown into content
4. Set cover + OG image
5. Save, preview, publish
6. Verify public post card/detail + OG metadata
7. Delete image — cover/OG cleared; Markdown refs not rewritten

### 4.1 Storage

- [x] `StorageProvider` interface
- [x] `LocalStorageProvider` implementation (+ `read()` for serving)
- [x] Env config: `UPLOAD_LOCAL_DIR`, `UPLOAD_PUBLIC_BASE_URL`, `UPLOAD_MAX_FILE_SIZE_BYTES`
- [ ] `STORAGE_PROVIDER` env switch — deferred (hardcoded local for MVP)

### 4.2 Upload pipeline

- [x] `uploadPostAsset()` in `assets.service.ts`
- [x] Validate MIME (jpeg, png, gif, webp), extension, size; reject SVG
- [x] Sanitize filename + uniquify per post
- [x] SHA-256 hash stored
- [ ] Width/height extraction — deferred
- [x] `POST /api/admin/posts/[id]/assets` — multipart upload

### 4.3 Serving

- [x] `GET /api/assets/[...path]` — stream file with Content-Type

### 4.4 Admin UI

- [x] `asset-grid.tsx`, `asset-upload-form.tsx`, metadata edit, delete
- [x] Copy URL / Copy Markdown / Insert into editor
- [x] Alt text / caption editing

### 4.5 Post cover and OG

- [x] Cover/OG pickers → `coverAssetId` / `ogAssetId` with same-post validation

### 4.6 Tests (Phase 4)

- [x] Unit: filename sanitization, upload validation, path traversal, LocalStorageProvider
- [x] Unit: SEO fallback when assets missing
- [ ] Integration: upload → preview → publish — deferred (manual smoke documented)

**Phase 4 exit criteria:** Images work end-to-end in local development. ✅

---

## Phase 5 — Analytics ✅

**Goal:** Track post views and show admin reports.

### 5.1 Ingestion

- [x] `POST /api/analytics/post-view` — record view (public, no user session)
- [x] Rate-limit endpoint (in-memory per hashed client key; document Redis/edge for production)
- [x] Validate: `slug` or `postId`; post exists and is published
- [x] Capture: postId, referrer, deviceType, coarse userAgentFamily, optional country, sessionHash
- [x] `sessionHash` from hashed client key — no raw IP stored
- [x] Fire-and-forget from public post page (`PostViewTracker`)

### 5.2 Aggregation

- [x] Write-time aggregation (Option A): `trackPostViewEvent` upserts `post_daily_stats` for UTC date
- [x] Approximate `uniqueViews` via distinct `sessionHash` per post per UTC day
- [ ] Retention job — delete `analytics_events` older than N days (deferred)

### 5.3 Admin dashboard

- [x] `/admin/analytics` — summary cards, top posts, views over time (CSS bars)
- [x] `/admin/analytics/posts/[id]` — per-post summary, views by day, referrers, devices, recent views
- [x] Optional redirect: `/admin/posts/[id]/analytics` → per-post analytics
- [x] Admin nav includes Analytics

### 5.4 Tests (Phase 5)

- [x] Unit: write-time daily stat upsert (mocked repository)
- [x] Unit: no IP column on analytics event payload
- [x] Unit: public tracking rejects unpublished posts (service mock)
- [x] Unit: summary, top posts, referrer/device grouping, empty data helpers

**Phase 5 exit criteria:** Admin sees view counts per post and site-wide. ✅

---

## Phase 6 — GitHub Pages migration ✅

**Goal:** Import existing Markdown blog into PostForge.

### 6.1 Import service

- [x] `src/modules/import/github-pages-*.ts` + `scripts/import-github-pages.ts`
- [x] Scan directory of `.md` files (recursive)
- [x] Parse YAML frontmatter (`gray-matter`)
- [x] Extract title, date, tags, categories, slug, permalink
- [x] Detect image references; copy local images to assets
- [x] Create posts, tags, categories via domain services
- [x] Create redirects for URL changes
- [x] Generate `ImportReport` JSON in `.import-reports/`

### 6.2 Admin UI

- [x] `/admin/import` — CLI guidance + recent report listing
- [ ] ZIP upload — deferred (CLI preferred for M6)

### 6.3 Report contents

- [x] Imported/skipped posts with reasons
- [x] Broken/missing image references
- [x] Unsupported frontmatter warnings
- [x] Slug conflicts
- [x] Redirects created/skipped

### 6.4 Tests (Phase 6)

- [x] Unit: frontmatter/slug/date parsing
- [x] Unit: image detection, rewrite, path traversal rejection
- [x] Unit: dry-run vs import behavior with mocked writer

**Phase 6 exit criteria:** Sample GitHub Pages export imports successfully via CLI. ✅

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
- [ ] Update `.env.example` with all blog vars including `ADMIN_EMAIL`

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
