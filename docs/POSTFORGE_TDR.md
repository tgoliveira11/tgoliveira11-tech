# PostForge Technical Design Record (TDR)

**Product:** PostForge  
**Version:** 0.1 (foundation complete, blog domain pending)  
**Status:** Documentation — implementation not started  
**Repository:** https://github.com/tgoliveira11/postforge

---

## 1. Product vision

PostForge is a focused **personal publishing platform** for Markdown-based blog content. It replaces or evolves an existing GitHub Pages blog into a custom Next.js + PostgreSQL product with a private admin experience and a fast public reading experience.

### Goals

| Area | Requirement |
|------|-------------|
| Public reading | Home, blog listing, post detail, tags, categories, search |
| Private publishing | Admin dashboard, Markdown editor, preview, publish lifecycle |
| Content | Markdown posts with post-specific image management |
| Discovery | PostgreSQL full-text search (MVP) |
| Distribution | SEO metadata, RSS, sitemap, robots.txt |
| Operations | Scheduled publication, featured/pinned posts, basic analytics |
| Migration | GitHub Pages Markdown import with URL continuity |

### Non-goals (MVP)

- Multi-author newsroom workflows
- Comments or community features
- MDX (see [Markdown requirements](#10-markdown-requirements))
- Custom user/account tables (owned by `@tgoliveira/secure-auth`)
- Reimplementing authentication, sessions, passkeys, or 2FA
- Paid subscriptions or paywalls
- Real-time collaborative editing
- External search engines (Meilisearch, Typesense) unless PostgreSQL FTS proves insufficient

### Target user

A single author (or small team sharing one admin account via secure-auth) who wants full control over a personal blog without maintaining a static-site generator pipeline.

---

## 2. Current state (existing foundation)

PostForge **already exists** as a working Next.js application. The following is complete and must **not** be rebuilt.

### Infrastructure

| Item | Status | Location / notes |
|------|--------|------------------|
| Next.js 16 App Router | ✅ | `src/app/` with `src/` directory |
| TypeScript | ✅ | Strict mode |
| PostgreSQL 16 | ✅ | `docker-compose.yml` — container `postforge-postgres` |
| Drizzle ORM | ✅ | `src/db/client.ts`, `drizzle.config.ts` |
| Auth migration | ✅ | Generated in `drizzle/`, applied to local DB |

### Authentication (@tgoliveira/secure-auth)

| Item | Status | Location / notes |
|------|--------|------------------|
| Package installed | ✅ | `@tgoliveira/secure-auth@^0.1.4-internal` |
| Composition root | ✅ | `src/lib/auth/secure-auth.ts` — sole `createSecureAuth()` call |
| DB client injection | ✅ | `src/db/client.ts` |
| Email provider | ✅ | `src/lib/email/dev-email-provider.ts` (console) |
| Env mapping | ✅ | `src/lib/env/secure-auth-from-env.ts` |
| UI provider | ✅ | `src/components/providers.tsx` |
| Auth API routes | ✅ | Thin wrappers under `src/app/api/auth/` and `src/app/api/account/` |
| Auth UI pages | ✅ | `/login`, `/register`, `/settings/*`, etc. |
| Package-owned schema | ✅ | Re-exported from `src/db/schema.ts` |

### Package-owned database tables (already migrated)

- `users`
- `account_sessions`
- `account_tokens`
- `audit_events`
- `passkey_credentials`
- `rate_limit_buckets`
- `user_two_factor_backup_codes`
- `user_two_factor_login_challenges`
- `user_two_factor_login_tokens`
- `user_two_factor_session_upgrades`
- `user_two_factor_settings`
- `webauthn_challenges`

### What is intentionally missing

- Blog domain tables (`posts`, `tags`, etc.)
- Public blog pages (beyond placeholder home)
- Admin publishing UI
- Asset storage
- Search, RSS, sitemap
- Analytics
- GitHub Pages import

**The project starts from this foundation.** All remaining work is blog product implementation on top of secure-auth.

---

## 3. Ownership boundary: secure-auth vs PostForge

### @tgoliveira/secure-auth owns

| Domain | Includes |
|--------|----------|
| Identity | `users` table, registration, login, logout |
| Credentials | Password reset, email verification |
| Sessions | Session creation, listing, revocation, single-active-session policy |
| WebAuthn | Passkeys, `webauthn_challenges`, `passkey_credentials` |
| 2FA | TOTP setup, backup codes, login challenges |
| Security | Rate limiting (`rate_limit_buckets`), auth `audit_events` |
| Account | Account settings, change password, account deletion |
| API | All handlers exposed via `secureAuth.routes.*` |
| UI | Login, register, settings, 2FA, passkey pages |
| Schema | All auth Drizzle tables — **do not modify** |

### PostForge owns

| Domain | Includes |
|--------|----------|
| Content | `posts`, `post_revisions`, Markdown rendering |
| Taxonomy | `categories`, `tags`, `post_tags` |
| Media | `assets`, `StorageProvider` abstraction |
| Public site | Blog pages, search, SEO, RSS, sitemap, robots.txt |
| Admin | Publishing dashboard, editor, preview, post project workspace |
| Routing | `redirects` for slug changes and GitHub Pages migration |
| Analytics | `analytics_events`, `post_daily_stats` |
| Settings | `blog_settings` |
| Content audit | `blog_audit_logs` (optional — only if secure-auth audit is insufficient) |
| Scheduling | Cron job to publish scheduled posts |

### Hard rules

1. **Do not create a PostForge `users` table.** Reference `users.id` from the package schema.
2. **Do not modify** `@tgoliveira/secure-auth` schema or migrations.
3. **Do not duplicate** auth logic — use `secureAuth` session/API for admin protection.
4. **Do not build** custom login, register, passkey, or 2FA flows.
5. PostForge FK columns (`createdBy`, `updatedBy`, `authorId`, `actorUserId`) reference package `users.id`.

See [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) for table-level detail and [ARCHITECTURE.md](./ARCHITECTURE.md) for code organization.

---

## 4. Public area requirements

Public routes live under `src/app/(public)/` (recommended). **Only `published` posts** are visible.

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Home — featured/pinned posts first, then recent published posts |
| `/blog` | Paginated blog listing |
| `/blog/[slug]` | Post detail with sanitized HTML, TOC optional |
| `/search` | Full-text search (published only) |
| `/tags/[slug]` | Posts by tag |
| `/categories/[slug]` | Posts by category |

### Feeds and crawlers

| Route | Purpose |
|-------|---------|
| `/rss.xml` | RSS 2.0 — published posts only |
| `/sitemap.xml` | XML sitemap — published posts, tags, categories |
| `/robots.txt` | Crawler rules |

### SEO per post

- `seoTitle`, `seoDescription`, `canonicalUrl`
- Open Graph: `ogTitle`, `ogDescription`, `ogAssetId` (image)
- Twitter/X card metadata (derived from OG fields)
- JSON-LD `BlogPosting` structured data
- Clean URLs: `/blog/{slug}`
- Semantic HTML (`article`, `header`, `time`, etc.)
- Mobile-friendly layout

### Visibility rules

| Status | Public visibility |
|--------|-------------------|
| `draft` | ❌ Never |
| `scheduled` | ❌ Never (until cron publishes) |
| `published` | ✅ Yes |
| `unpublished` | ❌ Removed from all public surfaces |
| `archived` | ❌ Never |

Unpublished posts must be excluded from: listing, search, RSS, sitemap, tag/category pages, and direct slug access (return 404 or redirect if configured).

### Error and redirect handling

- Friendly custom 404 page
- `redirects` table for changed slugs and GitHub Pages URL mapping
- 301 permanent redirects preferred for SEO continuity

---

## 5. Admin area requirements

Admin routes live under `src/app/admin/` (recommended). **All admin routes require an authenticated secure-auth session.**

Use existing secure-auth session capabilities (NextAuth session via `secureAuth`) — no custom auth middleware.

### Pages and flows

| Route / flow | Purpose |
|--------------|---------|
| `/admin` | Dashboard — stats, recent posts, quick actions |
| `/admin/posts` | Post list with filters (status, tag, category, search) |
| `/admin/posts/new` | Create post project |
| `/admin/posts/[id]` | Edit post project workspace |
| `/admin/posts/[id]/preview` | Live Markdown preview |
| `/admin/posts/[id]/revisions` | Revision history |
| `/admin/posts/[id]/images` | Post-specific image library |
| `/admin/settings` | Blog settings |
| `/admin/import` | GitHub Pages import wizard |
| `/admin/analytics` | Blog analytics overview |

### Post project workspace

A **Post Project** is the internal working unit when creating or editing a post. See [§6 Post project concept](#6-post-project-concept).

### Editor capabilities

- Markdown editor with syntax-friendly textarea or lightweight editor
- Live preview (side-by-side or tabbed)
- Autosave drafts (debounced, e.g. every 30s)
- Revision history on each meaningful save
- Image upload to post library
- Insert image into Markdown (`![alt](url)`)
- Copy image URL
- Alt text and caption on assets

### Post actions

| Action | Behavior |
|--------|----------|
| Save draft | `status = draft`, no public visibility |
| Publish | `status = published`, set `publishedAt`, revalidate cache |
| Unpublish | `status = unpublished`, set `unpublishedAt`, remove from public |
| Schedule | `status = scheduled`, set `scheduledAt` |
| Archive | `status = archived` |
| Duplicate | Clone post + metadata into new draft project |
| Feature | Toggle `featured` |
| Pin / unpin | Toggle `pinned`, set `pinnedPriority` |

### Admin search and filters

- Search across all statuses (draft, scheduled, published, unpublished, archived)
- Filter by status, category, tag, featured, pinned, date range
- Sort by updated, published, views, title

---

## 6. Post project concept

A **Post Project** is not a separate database table. It is the **admin workspace** for a single `posts` row and its related resources.

### Workspace contains

| Concern | Storage |
|---------|---------|
| Markdown body | `posts.contentMarkdown` |
| Rendered cache | `posts.contentHtmlCache` |
| Metadata | `posts` fields (title, slug, excerpt, SEO, etc.) |
| Images | `assets` rows where `postId = posts.id` |
| Publication settings | `posts.status`, `scheduledAt`, `publishedAt` |
| SEO settings | `posts.seo*` and `posts.og*` fields |
| Revision history | `post_revisions` |
| Analytics | `analytics_events`, `post_daily_stats` |

### Create flow

1. Admin clicks "New post" → insert `posts` row with `status = draft`, minimal title/slug.
2. Admin lands in post project workspace (`/admin/posts/[id]`).
3. Admin uploads images → `assets` created with `postId`.
4. Admin writes Markdown, inserts images from library.
5. Autosave updates `posts` and appends `post_revisions`.
6. Admin previews, then publishes/schedules/archives.

---

## 7. Domain model (summary)

PostForge-owned tables to implement. Full detail in [DOMAIN_MODEL.md](./DOMAIN_MODEL.md).

| Table | Purpose |
|-------|---------|
| `posts` | Core blog content and metadata |
| `categories` | Post categories |
| `tags` | Post tags |
| `post_tags` | Many-to-many posts ↔ tags |
| `assets` | Image/file metadata |
| `post_revisions` | Content revision history |
| `redirects` | URL redirects |
| `analytics_events` | Raw view events (privacy-conscious) |
| `post_daily_stats` | Aggregated daily view counts |
| `blog_settings` | Site-wide blog config (recommended) |
| `blog_audit_logs` | Content action audit (optional) |

**No PostForge `users` table.** All user FKs reference package `users.id`.

---

## 8. Post fields

See [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) for full schema. Required fields:

```
id, title, slug, excerpt, contentMarkdown, contentHtmlCache,
coverAssetId, status, featured, pinned, pinnedPriority,
categoryId, publishedAt, scheduledAt, unpublishedAt,
seoTitle, seoDescription, canonicalUrl,
ogTitle, ogDescription, ogAssetId,
readingTimeMinutes, createdBy, updatedBy, createdAt, updatedAt
```

### Status enum

```
draft | scheduled | published | unpublished | archived
```

---

## 9. Asset / image requirements

| Requirement | Detail |
|-------------|--------|
| Upload source | Local machine via admin UI |
| Association | `assets.postId` — organized per post project |
| Metadata | Stored in PostgreSQL (`assets` table) |
| File storage | `StorageProvider` abstraction |
| MVP provider | `LocalStorageProvider` |
| Future providers | S3, Cloudflare R2, Supabase Storage |
| Validation | MIME type, extension, max size, safe filename |
| Security | Path traversal prevention, no executable uploads |
| Dimensions | Store `width` / `height` when extractable |
| Accessibility | `altText`, `caption` fields |
| Editor integration | Copy URL, insert `![alt](url)` into Markdown |

### Deployment note

| Deployment | Storage recommendation |
|------------|------------------------|
| Persistent VPS | `LocalStorageProvider` acceptable for v1 |
| Vercel / serverless | Object storage required from day one — local disk is not durable |

---

## 10. Markdown requirements

### Supported (MVP)

- Standard Markdown: headings, paragraphs, bold, italic, lists, links, images, blockquotes, code blocks, inline code, tables, horizontal rules
- Syntax highlighting for fenced code blocks
- Optional table of contents generated from headings (H2/H3)
- **Sanitized HTML output** — XSS prevention mandatory

### Not supported (MVP)

- **MDX** — deferred due to complexity and security risk
- Raw HTML passthrough in Markdown
- Custom React components in content

### Rendering pipeline

```
contentMarkdown → parser (remark/unified) → sanitizer (rehype-sanitize) → contentHtmlCache
```

Cache `contentHtmlCache` on save/publish. Recompute when Markdown changes.

---

## 11. Search requirements

### MVP: PostgreSQL full-text search

- Index published posts on: title, excerpt, `contentMarkdown`, tags, category name
- Public search: **published only**
- Admin search: all statuses
- Use `tsvector` + `tsquery` or `websearch_to_tsquery`

### Future (optional)

- Meilisearch, Typesense, or OpenSearch — only if PostgreSQL FTS is insufficient at scale

---

## 12. Publication lifecycle

```
                    ┌──────────┐
                    │  draft   │◄─────────────────┐
                    └────┬─────┘                  │
                         │ schedule              │ duplicate
                         ▼                       │
                    ┌──────────┐                  │
                    │ scheduled│                  │
                    └────┬─────┘                  │
                         │ cron (scheduledAt)     │
                         ▼                       │
                    ┌──────────┐    unpublish     │
         publish ──►│ published│──────────────►  │
                    └────┬─────┘                  │
                         │ archive               │
                         ▼                       │
                    ┌────────────┐                │
                    │unpublished │                │
                    └─────┬──────┘                │
                          │ archive               │
                          ▼                       │
                    ┌──────────┐                  │
                    │ archived │────────────────┘
                    └──────────┘
```

### Rules

| Rule | Detail |
|------|--------|
| Drafts | Admin-only; never in public queries |
| Scheduled | Admin-only until `scheduledAt <= now()` |
| Published | Visible on all public surfaces |
| Unpublished | Removed from public pages, search, RSS, sitemap |
| Archived | Preserved in admin; never public |
| Idempotency | Scheduler must not double-publish |
| Side effects | Publish triggers cache revalidation, RSS/sitemap eligibility update |

---

## 13. Scheduler design

### Trigger

Posts with `status = scheduled` AND `scheduledAt <= now()` are published by a cron job.

### Implementation options

| Deployment | Mechanism |
|------------|-----------|
| Vercel | `vercel.json` cron → `GET /api/cron/publish-scheduled` |
| VPS | Node `node-cron` or system crontab hitting endpoint |
| External | GitHub Actions, cron-job.org, etc. |

### Endpoint security

- Protected by `CRON_SECRET` header or query param
- Reject requests without valid secret
- Rate-limit or IP-allowlist if exposed publicly

### Job behavior

1. Query eligible scheduled posts (limit batch size, e.g. 50)
2. For each: set `status = published`, `publishedAt = scheduledAt` (or `now()`)
3. Recompute `contentHtmlCache` if stale
4. Trigger Next.js revalidation tags/paths
5. Log success/failure
6. Write audit event (secure-auth or `blog_audit_logs`)
7. **Idempotent** — skip already-published posts

---

## 14. SEO requirements

| Item | Implementation |
|------|----------------|
| Per-post SEO title/description | `posts.seoTitle`, `posts.seoDescription` with fallbacks to title/excerpt |
| Canonical URL | `posts.canonicalUrl` or default `/blog/{slug}` |
| Open Graph | `ogTitle`, `ogDescription`, `ogAssetId` |
| Twitter/X cards | `summary_large_image` from OG fields |
| JSON-LD | `BlogPosting` schema on post detail |
| Sitemap | `/sitemap.xml` — published posts, tags, categories |
| RSS | `/rss.xml` — published posts, ordered by `publishedAt` |
| Robots.txt | `/robots.txt` — allow public, disallow `/admin` |
| Redirects | `redirects` table for slug/GitHub Pages URL changes |
| URLs | Clean, lowercase slugs; no trailing slashes inconsistency |
| Mobile | Responsive layout, readable typography |
| HTML | Semantic elements, proper heading hierarchy |

---

## 15. Analytics requirements (MVP)

### Track

- Post views (page load on `/blog/[slug]`)
- Views by day → `post_daily_stats`
- Total views, views today, last 7 days, last 30 days
- Top posts by view count
- Referrer (when `Referer` header present)
- Device type (coarse: mobile/desktop/tablet from UA)
- Country (optional, from edge header if available — e.g. Vercel `x-vercel-ip-country`)

### Privacy

- **Do not store raw IP addresses**
- Hash or truncate visitor identifiers if needed for deduplication
- Prefer aggregated stats for admin reports
- No unnecessary PII

### Storage

- Raw events → `analytics_events` (retention policy TBD, e.g. 90 days)
- Aggregates → `post_daily_stats` (long-lived)

---

## 16. GitHub Pages migration

### Input

- Directory of Markdown files (with optional YAML frontmatter)
- Associated image directories

### Import pipeline

1. Scan Markdown files
2. Parse frontmatter (title, date, tags, categories, slug if present)
3. Derive slug from filename or frontmatter
4. Detect image references in Markdown (`![](path)`)
5. Map or copy images to `assets` + `StorageProvider`
6. Create `posts`, `tags`, `categories`, `post_tags` rows
7. Create `redirects` when old GitHub Pages URL ≠ new PostForge URL
8. Produce import report

### Import report

| Section | Content |
|---------|---------|
| Imported | List of successfully created posts |
| Skipped | Files skipped with reason |
| Broken images | References that could not be resolved |
| Missing metadata | Posts missing title, date, etc. |
| Slug conflicts | Collisions and resolution |
| Redirects created | Old URL → new URL mappings |

### URL continuity

Preserve existing URLs where possible. When impossible, create 301 redirects and document in report.

---

## 17. Architecture (summary)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full layout.

```
src/
  app/
    (public)/     # Public blog routes
    admin/        # Protected admin routes
    api/          # Blog API routes (auth routes already exist)
  components/
    public/
    admin/
    editor/
    ui/
  modules/
    posts/
    assets/
    tags/
    categories/
    analytics/
    redirects/
    markdown/
    search/
    scheduler/
    settings/
  db/
    schema.ts     # Re-exports auth schema + blog schema
    client.ts
  lib/
    slug.ts
    dates.ts
    errors.ts
    env.ts
```

Each module should contain: `schema`, `types`, `validation`, `repository`, `service` where appropriate.

---

## 18. Implementation phases (summary)

See [ROADMAP.md](./ROADMAP.md) and [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

| Phase | Focus |
|-------|-------|
| 1 | Blog domain foundation (schema, repos, services) |
| 2 | Public blog (pages, SEO, RSS, sitemap) |
| 3 | Admin publishing (editor, preview, lifecycle) |
| 4 | Images/assets |
| 5 | Analytics |
| 6 | GitHub Pages migration |
| 7 | Hardening |

---

## 19. Testing strategy

### Unit tests

- Slug generation and uniqueness normalization
- Markdown rendering and sanitization
- Reading time calculation
- Post validation (Zod schemas)
- Search query builder
- Publish/schedule rule logic
- Scheduler eligibility query
- Storage provider path safety

### Integration tests

- Create post → save draft → publish → unpublish
- Schedule post → cron publishes
- Upload image → insert in Markdown
- Public search returns only published posts
- Draft slug returns 404 publicly
- Analytics event → daily stat aggregation

### E2E tests

1. Admin logs in via secure-auth (`/login`)
2. Creates post project
3. Uploads image, inserts into Markdown
4. Previews post
5. Publishes post
6. Views post on public `/blog/[slug]`
7. Searches for post
8. Unpublishes — post no longer public

### Security tests

- Unauthenticated access to `/admin/*` → redirect to login
- Upload: reject oversize, wrong MIME, path traversal filenames
- Markdown: XSS payloads sanitized
- Invalid slug input rejected
- Draft never leaked via API or SSR

---

## 20. Acceptance criteria (production-ready MVP)

- [ ] Admin can log in using secure-auth
- [ ] Admin can create a post project
- [ ] Admin can write Markdown content
- [ ] Admin can upload images for a post
- [ ] Admin can insert uploaded images into Markdown
- [ ] Admin can preview a post
- [ ] Admin can publish a post
- [ ] Published post appears publicly
- [ ] Draft posts do not appear publicly
- [ ] Admin can unpublish a post
- [ ] Admin can schedule a post
- [ ] Scheduled posts publish automatically
- [ ] Public search works (published only)
- [ ] Tags and categories work
- [ ] Featured/pinned posts appear first on home
- [ ] Basic post analytics visible in admin
- [ ] Sitemap and RSS include only published posts
- [ ] Markdown rendering is sanitized
- [ ] Uploads are validated
- [ ] GitHub Pages content can be migrated or manually recreated

---

## 21. Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Accidental auth reimplementation | High — security debt | Enforce boundary in code review; only use `secureAuth` APIs |
| XSS via Markdown | High | Mandatory sanitization; no MDX; no raw HTML |
| Draft leakage | High | Central `publishedOnly` query filter; integration tests |
| Local storage on serverless | High — data loss | Document deployment matrix; env flag for storage provider |
| Slug collisions | Medium | Unique constraint + validation; import conflict report |
| Scheduler failure | Medium | Idempotent job; logging; admin manual publish fallback |
| Search performance | Low (MVP) | PostgreSQL FTS indexes; revisit if >10k posts |
| Migration data loss | Medium | Dry-run import; report before commit; keep source files |

---

## 22. Open questions

| # | Question | Default if unresolved |
|---|----------|----------------------|
| 1 | Single admin vs role-based access? | Single admin (any authenticated user) for MVP |
| 2 | `blog_audit_logs` vs secure-auth `audit_events`? | Start with secure-auth audit; add blog audit only if gaps found |
| 3 | Asset storage path on VPS? | `{STORAGE_ROOT}/posts/{postId}/{filename}` |
| 4 | Max upload size? | 5 MB images, configurable via env |
| 5 | Revision retention limit? | Keep all revisions MVP; prune later |
| 6 | Analytics raw event retention? | 90 days, then aggregate-only |
| 7 | Home page post count? | 10 recent + featured/pinned section |
| 8 | Pagination size? | 12 posts per page |
| 9 | Default OG image? | Site-wide fallback in `blog_settings` |
| 10 | GitHub Pages base URL pattern? | Configurable in import wizard |

---

## Related documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — code structure and patterns
- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) — tables, fields, relationships
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — phased tasks and dependencies
- [ROADMAP.md](./ROADMAP.md) — milestones and sequencing
