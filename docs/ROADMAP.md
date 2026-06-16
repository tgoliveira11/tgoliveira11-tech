# PostForge Roadmap

High-level milestone roadmap for building PostForge from the current auth foundation to a production-ready Markdown blog platform.

---

## Current milestone: M6 — GitHub Pages migration complete ✅

**Status:** Done

| Deliverable | State |
|-------------|-------|
| CLI importer (`npm run import:github-pages`) | ✅ |
| Dry-run + import modes | ✅ |
| Frontmatter parsing (gray-matter) | ✅ |
| Local image copy + Markdown rewrite | ✅ |
| Redirect planning/creation | ✅ |
| Import JSON reports | ✅ |
| Admin `/admin/import` guidance page | ✅ |

**Next:** Begin M7 — Hardening.

**Recent polish:** Public editorial UI applied across all human-facing reader pages (see `docs/UI_UX_SKILL.md` public section).

**Template distribution:** PostForge is documented as a GitHub Template Repository — see `README.md`, `docs/TEMPLATE_STRATEGY.md`, and `docs/CREATE_A_BLOG.md`.

---

## M0 — Foundation complete ✅

**Status:** Done

| Deliverable | State |
|-------------|-------|
| Next.js App Router + TypeScript | ✅ |
| PostgreSQL via Docker | ✅ |
| Drizzle ORM configured | ✅ |
| `@tgoliveira/secure-auth` integrated | ✅ |
| Auth schema migrated | ✅ |
| Auth UI pages and API routes | ✅ |
| `createSecureAuth` composition root | ✅ |
| Project documentation | ✅ (this docs set) |

---

## M1 — Blog domain foundation ✅

**Status:** Done

| # | Milestone | Key deliverables |
|---|-----------|------------------|
| 1.1 | Blog schema | `posts`, `categories`, `tags`, `post_tags`, `assets`, `post_revisions`, `redirects`, `analytics_events`, `post_daily_stats`, `blog_settings` |
| 1.2 | Migrations | `drizzle/0001_*.sql` applied; auth tables untouched |
| 1.3 | Core services | Post CRUD, publish/unpublish/schedule, slug utils, reading time |
| 1.4 | Markdown pipeline | Sanitized render → `contentHtmlCache` |
| 1.5 | Admin authorization | `requireAdminSession()` — secure-auth session + `ADMIN_EMAIL` check |
| 1.6 | Unit tests | Slug, validation, publish rules |

**Exit gate:** Integration test can create, update, and publish a post via service layer. ✅

---

## M2 — Public blog ✅

**Status:** Done

| # | Milestone | Key deliverables |
|---|-----------|------------------|
| 2.1 | Public routes | Home, `/blog`, `/blog/[slug]`, tags, categories, search |
| 2.2 | Search | PostgreSQL FTS, published only |
| 2.3 | SEO | Meta tags, OG, Twitter cards, JSON-LD |
| 2.4 | Feeds | RSS, sitemap, robots.txt |
| 2.5 | Redirects | `/blog/[slug]` lookup only (full legacy redirects → M6) |
| 2.6 | 404 | Friendly not-found page |
| 2.7 | Analytics | `POST /api/analytics/post-view` with rate limiting |
| 2.8 | Listing order | `publicOrder` field, admin controls, tag/category order |
| 2.9 | Pagination | `PUBLIC_POSTS_PAGE_SIZE` on `/blog` |

**Exit gate:** Seed a published post; visible on home, blog, search, RSS, and sitemap. Draft invisible. ✅

**Deferred to later phases:** Related posts, middleware redirects, route integration tests, GIN indexes.

---

## M3 — Admin publishing ✅

**Status:** Done

| # | Milestone | Key deliverables |
|---|-----------|------------------|
| 3.1 | Admin shell | Layout, nav, session + `ADMIN_EMAIL` guard, 403 page |
| 3.2 | Post list | Filters (status, category, tag, search), lifecycle actions, public order |
| 3.3 | Post editor | Create, edit, manual save, inline category/tag assignment |
| 3.4 | Preview | Admin-only sanitized Markdown preview |
| 3.5 | Lifecycle | Publish, unpublish, schedule, archive, duplicate |
| 3.6 | Feature/pin | Toggle featured and pinned posts |
| 3.7 | Mutations | Server Actions with `requireAdminSession()` |
| 3.8 | Public order | Manual `publicOrder` on `/admin/posts` for published posts |

**Exit gate:** Login as `ADMIN_EMAIL` → create → publish → visible publicly → unpublish → hidden. ✅

**Editor UX (follow-up):** Post editor redesigned as a writing-first workspace — sticky header, two-column layout, compact assets sidebar, promotion/SEO/schedule cards. See `docs/UI_UX_SKILL.md`.

**Deferred:** Autosave, revisions UI, scheduler cron, dedicated tag/category admin list screens, `/api/admin/*` REST routes.

---

## M4 — Images and assets ✅

**Status:** Done

| # | Milestone | Key deliverables |
|---|-----------|------------------|
| 4.1 | StorageProvider | Local + Vercel Blob providers, `UPLOAD_PROVIDER` factory |
| 4.2 | Upload API | Multipart upload, validation, metadata |
| 4.3 | Serving | `GET /api/assets/[...path]` |
| 4.4 | Admin UI | Post asset library, insert/copy Markdown |
| 4.5 | Cover/OG | Pickers with same-post ownership validation |

**Exit gate:** Upload → insert in Markdown → publish → image visible on public post. ✅

**Deferred:** Global media library, S3/R2/Supabase providers, width/height extraction, SVG support, automated local→Blob migration.

---

## M5 — Analytics ✅

**Status:** Done

| # | Milestone | Key deliverables |
|---|-----------|------------------|
| 5.1 | View ingestion | `POST /api/analytics/post-view`, hashed client key, no raw IP |
| 5.2 | Daily aggregation | Write-time upsert into `post_daily_stats` on each view |
| 5.3 | Admin reports | `/admin/analytics`, `/admin/analytics/posts/[id]` |
| 5.4 | Retention | Raw event cleanup deferred |

**Exit gate:** View a published post → admin dashboard shows incremented counts. ✅

**Depends on:** M2 (public post page)

**Limitations documented:** In-memory rate limit per instance; approximate unique views; raw events retained until future retention job.

---

## M6 — GitHub Pages migration ✅

**Status:** Done

| # | Milestone | Key deliverables |
|---|-----------|------------------|
| 6.1 | Import parser | `gray-matter`, slug/permalink/date/tags |
| 6.2 | Image mapping | Local copy + Markdown rewrite; remote preserved |
| 6.3 | Redirect creation | 301 from legacy paths to `/blog/[slug]` |
| 6.4 | Import tooling | CLI dry-run/import + `/admin/import` guidance |
| 6.5 | URL import | Single-post import from HTML URL (admin UI) |

**Exit gate:** Legacy Markdown folder imports as drafts with JSON report; redirects planned/created. ✅

**Depends on:** M1, M4 (images)

**See:** [GITHUB_PAGES_MIGRATION.md](./GITHUB_PAGES_MIGRATION.md)

---

## M7 — Production hardening

**Target:** Production-ready quality and operations.

| # | Milestone | Key deliverables |
|---|-----------|------------------|
| 7.1 | Test coverage | Unit, integration, E2E, security |
| 7.2 | Audit logging | Content action audit trail |
| 7.3 | Accessibility | WCAG basics on public + admin |
| 7.4 | Performance | Index review, caching, image optimization |
| 7.5 | Operations | Backup/export, deployment docs |
| 7.6 | Security review | XSS, upload, draft leakage, admin protection |

**Exit gate:** All acceptance criteria in [POSTFORGE_TDR.md §20](./POSTFORGE_TDR.md#20-acceptance-criteria-production-ready-mvp) checked.

**Depends on:** M2–M6

---

## Timeline visualization

```
M0 Foundation     ████████████████████  DONE
M1 Domain         ████████████████████  DONE
M2 Public blog    ████████████████████  DONE
M3 Admin          ████████████████████  DONE
M4 Images         ████████████████████  DONE
M5 Analytics      ████████████████████  DONE
M6 Migration      ████████████████████  DONE
M7 Hardening      ░░░░░░░░░░░░░░░░░░░░  NEXT
```

No calendar dates assigned — phases are sequential with some parallelism possible between M2 and M3 after M1 completes.

---

## Parallelism opportunities

| Can run in parallel | After |
|---------------------|-------|
| M2 (public pages) + M3 (admin shell) | M1 |
| M5 (analytics) + M4 (images) | M2 + M3 respectively |
| M6 (migration) | M1; full value after M4 |

---

## Scope boundaries (reminder)

### In scope

Everything in M1–M7 above.

### Explicitly out of scope

| Item | Reason |
|------|--------|
| Auth reimplementation | Owned by secure-auth |
| PostForge `users` table | Use package `users` |
| MDX support | MVP uses Markdown only |
| Multi-tenant / multi-author RBAC | Deferred; MVP uses `ADMIN_EMAIL`; future `blog_user_roles` table |
| Comments | Not in product vision |
| External search engines | PostgreSQL FTS sufficient for MVP |
| Real-time collaboration | Not required |

---

## Risk register

| Risk | Phase | Mitigation |
|------|-------|------------|
| Scope creep into auth | All | Review against boundary doc before each PR |
| Unauthorized admin access | M3 | `ADMIN_EMAIL` check on all admin routes |
| Draft leakage | M2, M3 | `publishedOnly` filter + tests |
| XSS | M1, M2 | Mandatory sanitization |
| Storage on serverless | M4 | ✅ `UPLOAD_PROVIDER=vercel-blob` + Vercel Blob provider |
| Migration data loss | M6 | Dry-run + import report |
| Scheduler missed runs | M3 | Idempotent job; admin manual publish fallback |

---

## Decision log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06 | Use `@tgoliveira/secure-auth` for all auth | Avoid security debt; package already integrated |
| 2026-06 | No PostForge `users` table | Single source of truth for user identity |
| 2026-06 | Markdown only (no MDX) | Simpler, safer MVP |
| 2026-06 | PostgreSQL FTS for search | No extra infrastructure for MVP |
| 2026-06 | LocalStorageProvider first | Matches local Docker dev; VPS v1 |
| 2026-06 | Vercel Blob in template | Durable uploads on serverless; no DB migration |
| 2026-06 | Manual `publicOrder` + env pagination | Admin-controlled list order; `PUBLIC_POSTS_PAGE_SIZE` default 5 |
| 2026-06 | Admin authorization via `ADMIN_EMAIL` | Auth from secure-auth; authorization is PostForge-owned; single admin for MVP |
| 2026-06 | Future RBAC via `blog_user_roles` | Do not modify secure-auth `users` table |
| 2026-06 | Post Project = workspace, not table | One `posts` row; related assets/revisions |

---

## Open questions

Track unresolved decisions. Default action if not decided before implementation:

| # | Question | Default | Blocking phase |
|---|----------|---------|----------------|
| 1 | ~~Single admin or RBAC?~~ | **Resolved:** `ADMIN_EMAIL` for MVP | — |
| 2 | `blog_audit_logs` needed? | Defer; use secure-auth audit first | M7 |
| 3 | Autosave revision throttle? | Max 1 revision per 5 minutes | M3 |
| 4 | Image max size? | 5 MB | M4 |
| 5 | Analytics dedup? | Optional `visitorHash`; skip for MVP if tight | M5 |
| 6 | Import: zip upload vs CLI? | CLI/script for MVP; UI later | M6 |
| 7 | ~~Deployment target?~~ | **Resolved:** Vercel + Neon + Blob documented | — |

---

## Recommended next step

**Start M7 — Production hardening.**

First concrete tasks:

1. Implement daily aggregation into `post_daily_stats`
2. Add admin analytics dashboard UI
3. Wire cron/retention for raw `analytics_events`
4. Show per-post view counts in admin

Image upload and cover/OG selection are complete via `/admin/posts/[id]/assets`.

---

## Related documents

- [POSTFORGE_TDR.md](./POSTFORGE_TDR.md) — full requirements
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — detailed task checklists
- [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) — database design
- [ARCHITECTURE.md](./ARCHITECTURE.md) — code structure
