# Current product surface

Living inventory of what **tgoliveira11-tech** exposes today. Update this file when routes, endpoints, jobs, integrations, or shipped/planned status change.

**Last reviewed:** 2026-06-15  
**Deployed domain (planned):** `www.tgoliveira11.tech` (Vercel + Neon)

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
| `/blog/[slug]` | shipped | Published post detail |
| `/tags`, `/tags/[slug]` | shipped | Tag index and filtered posts |
| `/categories`, `/categories/[slug]` | shipped | Category index and filtered posts |
| `/search` | shipped | Full-text search |
| `/about` | shipped | Static about page |
| `/rss.xml` | shipped | RSS feed (dynamic) |
| `/sitemap.xml` | shipped | Sitemap (dynamic) |
| `/robots.txt` | shipped | Robots (dynamic) |
| `/:YYYY-MM-DD-slug` | shipped | 308 redirect → `/blog/[slug]` via `src/proxy.ts` (legacy GitHub Pages URLs) |

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
| `/login/2fa` | shipped | 2FA challenge |
| `/account-deleted` | shipped | Post-deletion confirmation |
| `/settings/account` | shipped | Redirects to `/admin/account` |
| `/settings/security` | shipped | Redirects to `/admin/security` |
| `/settings/sessions` | shipped | Redirects to `/admin/sessions` |

Guest-page redirects for authenticated users are configured in `src/lib/env/secure-auth-from-env.ts` and enforced in `src/proxy.ts`.

---

## Admin workspace

Requires secure-auth session + `ADMIN_EMAIL` match.

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
| `/api/auth/login/*` | shipped | Start, complete, 2FA, passkey, trace |
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
| `@tgoliveira/secure-auth` | shipped | `^0.1.25` |
| Vercel Blob / local storage | shipped | `UPLOAD_PROVIDER` |
| Vercel Speed Insights | shipped | Optional |
| Email providers | shipped | Resend / SMTP / console — see [EMAIL_PROVIDERS.md](EMAIL_PROVIDERS.md) |
| GitHub Pages import CLI | shipped | `npm run import:github-pages` |
| Upstream PostForge sync | shipped | Weekly workflow + `npm run sync:upstream:merge` |

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
| Footer SK link | `https://selahkeep.com` |
| Legacy URL redirects | `src/proxy.ts` + `src/lib/legacy-post-redirect.ts` |

---

## Related docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — deeper design
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [upstream-sync.md](upstream-sync.md)
