# Current product surface

Living inventory of what **tgoliveira11-tech** exposes today. Update this file when routes, endpoints, jobs, integrations, or shipped/planned status change.

**Last reviewed:** 2026-07-25 (mobile hamburger navigation, profile and favicon refresh, privacy cleanup, static editorial covers, PostForge upstream audit, conversion analytics, redirects, public discovery, and production content cleanup)
**Canonical deployed domain:** `www.tgoliveira11.tech` (Vercel + Neon)

---

## Status legend

| Status | Meaning |
|--------|---------|
| **shipped** | Available in production-capable builds |
| **planned** | Documented but not implemented |
| **deferred** | Explicitly out of current scope |

---

## Public pages

| Route | Status | Notes |
|-------|--------|-------|
| `/` | shipped | Home — featured/recent posts |
| `/blog` | shipped | Paginated post index (`PUBLIC_POSTS_PAGE_SIZE`, default 5) |
| `/blog/[slug]` | shipped | Published post detail with canonical metadata, Open Graph Article tags, Twitter card, and BlogPosting JSON-LD |
| `/tags`, `/tags/[slug]` | shipped | Tag index and filtered posts |
| `/categories`, `/categories/[slug]` | shipped | Canonical editorial category index and filtered posts |
| `/search` | shipped | Full-text search |
| `/about` | shipped | Static about page |
| `/opengraph-image` | shipped | Default branded social preview image |
| `/rss.xml` | shipped | RSS feed (dynamic) |
| `/sitemap.xml` | shipped | Sitemap (dynamic) |
| `/robots.txt` | shipped | Robots (dynamic) |
| `/llms.txt` | shipped | Concise AI-readable public content map |
| `/llms-full.txt` | shipped | AI-readable public content export with published article markdown |
| `/:YYYY-MM-DD-slug` | shipped | 308 redirect → `/blog/[slug]` via `src/proxy.ts` (legacy GitHub Pages URLs) |
| Apex host `tgoliveira11.tech` | shipped | 308 redirect → `https://www.tgoliveira11.tech/:path*` via `next.config.ts` |

Canonical editorial categories: AI Engineering, Software & Solution Architecture, Engineering Leadership, Technology Strategy, Career & Reflections.

Priority article aliases redirect to date-aligned canonical slugs; the B2B mobility article canonical is `/blog/2026-07-24-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform`, with the former `2026-07-25` slug retained as a permanent redirect.

---

## Auth pages (secure-auth UI)

| Route | Status | Notes |
|-------|--------|-------|
| `/login` | shipped | |
| `/register` | shipped | |
| `/forgot-password` | shipped | |
| `/reset-password` | shipped | |
| `/verify-email` | shipped | |
| `/check-email` | shipped | |
| `/login/complete` | shipped | OAuth completion |
| `/login/2fa` | shipped | 2FA challenge (server page; `initialUsernameEmail` for password managers) |
| `/login/2fa/complete` | shipped | OAuth + 2FA completion |
| `/account-deleted` | shipped | Post-deletion confirmation |
| `/settings/account` | shipped | Redirects to `/admin/account` |
| `/settings/security` | shipped | Redirects to `/admin/security` |
| `/settings/sessions` | shipped | Redirects to `/admin/sessions` |

Guest-page redirects for authenticated users are configured in `src/lib/env/secure-auth-from-env.ts` and enforced in `src/proxy.ts`.

---

## Admin workspace

Requires secure-auth session + (`ADMIN_EMAIL` match **or** `users.role = admin`).

| Route | Status | Notes |
|-------|--------|-------|
| `/admin` | shipped | Dashboard |
| `/admin/posts` | shipped | Post list |
| `/admin/posts/new` | shipped | Create post |
| `/admin/posts/[id]/edit` | shipped | Post editor |
| `/admin/posts/[id]/preview` | shipped | Admin preview |
| `/admin/posts/[id]/assets` | shipped | Post assets |
| `/admin/posts/[id]/analytics` | shipped | Per-post analytics |
| `/admin/analytics` | shipped | Site analytics overview |
| `/admin/analytics/posts/[id]` | shipped | Post analytics detail |
| `/admin/tags` | shipped | Taxonomy — tags |
| `/admin/categories` | shipped | Taxonomy — categories |
| `/admin/import` | shipped | GitHub Pages / Jekyll import UI |
| `/admin/account` | shipped | `AccountSettingsPage` (secure-auth) |
| `/admin/security` | shipped | `SecuritySettingsPage` (2FA, passkeys) |
| `/admin/sessions` | shipped | `SessionsSettingsPage` |
| `/admin/core` | shipped | secure-auth admin panel (users, locks, API keys, config) |
| `/admin/core/users` | shipped | User management (`AdminUsersPage`) |
| `/admin/core/locks` | shipped | Account lock management |
| `/admin/core/api-keys` | shipped | API key management |
| `/admin/core/config` | shipped | Runtime auth config overrides |
| `/admin/outpost` | shipped | Outpost operator panel (transactional email outbox) |
| `/admin/outpost/queue` | shipped | Email queue + manual send worker |
| `/admin/outpost/config` | shipped | Outpost env/config overrides |
| `/admin/outpost/observability` | shipped | Queue depth and worker metrics |

---

## HTTP API

### Application

| Endpoint | Method | Auth | Status | Notes |
|----------|--------|------|--------|-------|
| `/api/analytics/post-view` | POST | Public | shipped | Rate-limited; published posts only; respects `analyticsEnabled` |
| `/api/admin/posts/[id]/assets` | * | Admin | shipped | Post asset management |
| `/api/assets/[...path]` | GET | Public | shipped | Serves uploaded assets |

### Auth & account (`@tgoliveira/secure-auth` delegates)

| Endpoint group | Status | Notes |
|----------------|--------|-------|
| `/api/auth/[...nextauth]` | shipped | NextAuth handler |
| `/api/auth/register` | shipped | |
| `/api/auth/login/*` | shipped | Start, complete, 2FA, OAuth 2FA complete, passkey, trace |
| `/api/auth/forgot-password` | shipped | |
| `/api/auth/reset-password` | shipped | |
| `/api/auth/verify-email/*` | shipped | |
| `/api/auth/passkey/login/*` | shipped | |
| `/api/auth/password-policy` | shipped | |
| `/api/auth/package-health` | shipped | Health check |
| `/api/account` | shipped | GET / DELETE |
| `/api/account/auth-status` | shipped | |
| `/api/account/change-password` | shipped | |
| `/api/account/sessions` | shipped | List / revoke variants |
| `/api/account/passkeys` | shipped | Register / manage |
| `/api/account/2fa/*` | shipped | Setup, status, backup codes |

API security env vars: see [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).

---

## Background jobs & cron

| Job | Status | Notes |
|-----|--------|-------|
| Scheduled post auto-publish | **deferred** | UI supports schedule fields; cron not wired |
| `/api/cron/*` | **planned** | Referenced in architecture; no routes shipped |

---

## Integrations

| Integration | Status | Notes |
|-------------|--------|-------|
| PostgreSQL (Drizzle) | shipped | Neon in prod; Docker `5434` locally |
| `@tgoliveira/secure-auth` | shipped | `^0.5.0` — production rate limit + forwarded headers via env |
| `@tgoliveira/outpost` | shipped | `^1.2.0` — transactional email outbox + admin UI |
| Vercel Blob / local storage | shipped | `UPLOAD_PROVIDER`; short-lived Vercel OIDC preferred for Blob, legacy read-write token fallback supported |
| Static public cover assets | shipped | Selected editorial covers are stored under `/public/images/covers` and referenced from production asset metadata. |
| Vercel Speed Insights | shipped | Optional |
| Email providers | shipped | Resend / SMTP / console — see [EMAIL_PROVIDERS.md](EMAIL_PROVIDERS.md) |
| Google Analytics 4 | shipped | Public route group only; measurement ID `G-XJ5W80DYKL`; tracks page views, search terms, Web Vitals, CTA clicks, Featured Insight clicks, related-article clicks, article entry, scroll depth, completion, and UTM fields |
| GitHub Pages import CLI | shipped | `npm run import:github-pages` |
| Content validation CLI | shipped | `npm run content:validate` |
| Taxonomy migration CLI | shipped | `npm run content:migrate-taxonomy` (dry-run by default; `-- --apply` updates DB) |
| Approved content site-rework CLI | shipped | `npm run content:apply-site-rework -- --content-dir .codex-site-rework/approved-content` (dry-run by default; `-- --apply` updates DB) |
| Upstream PostForge sync | shipped | Weekly workflow + `npm run sync:upstream:merge`; current upstream audit: PostForge `0.1.2` at `af7ebc1`, with local version aligned and direct merge requiring manual conflict review. |

---

## CI / automation (repository)

| Workflow | Trigger | Status |
|----------|---------|--------|
| `ci.yml` → job `validate` | push/PR `main` | shipped |
| `branch-name.yml` | PR `main` | shipped |
| `release.yml` | manual `workflow_dispatch` | shipped |
| `sync-upstream.yml` | weekly + manual | shipped |
| `codeql.yml`, `gitleaks.yml`, `semgrep.yml`, `dependency-review.yml`, `zap-baseline.yml` | various | shipped |

---

## Site-specific customizations (this fork)

| Area | Value |
|------|-------|
| Dev port | `3011` |
| `AUTH_COOKIE_PREFIX` | `tgoliveira11-tech` |
| Docker Postgres container | `tgoliveira11-tech-postgres` |
| Footer priority links | LinkedIn, GitHub, RSS; no public email address or direct email action |
| Mobile navigation | Hamburger menus aligned beside the public/Admin titles; mobile headers do not reserve space for theme controls |
| Privacy-sensitive public feeds | `/rss.xml`, `/llms.txt`, and `/llms-full.txt` use `no-store` so content removals do not remain in shared caches |
| Legacy URL redirects | `src/proxy.ts` + `src/lib/legacy-post-redirect.ts` |
| Site rework reference project plan | `docs/github-reference-project-plan.md` |
| Editorial cover assets | Static public images for selected high-priority posts in `/public/images/covers` |
| Profile and brand assets | About portrait plus generated favicon/app-icon assets under `/public/images/about`, `/public/images/brand`, and `src/app` icon conventions |

---

## Related docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — deeper design
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [upstream-sync.md](upstream-sync.md)
