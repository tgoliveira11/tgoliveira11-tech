# Upstream sync workflow

This document describes how **tgoliveira11-tech** stays aligned with the official PostForge template without leaking local customizations back to upstream.

| Remote | Repository | Purpose |
|--------|------------|---------|
| **origin** | [tgoliveira11/tgoliveira11-tech](https://github.com/tgoliveira11/tgoliveira11-tech) | **Your blog.** Push all local commits here only. |
| **upstream** | [tgoliveira11/postforge](https://github.com/tgoliveira11/postforge) | **Read-only template source.** Fetch improvements; never push. |

PostForge remains the **source/template**. This repo remains the **personalized blog implementation**.

---

## One-time setup

Verify remotes:

```bash
git remote -v
```

Expected:

```text
origin    https://github.com/tgoliveira11/tgoliveira11-tech.git (fetch)
origin    https://github.com/tgoliveira11/tgoliveira11-tech.git (push)
upstream  https://github.com/tgoliveira11/postforge.git (fetch)
upstream  DISABLED (push)
```

If `upstream` is missing or still allows push:

```bash
npm run sync:upstream:configure
```

That adds `upstream` (if needed) and sets its push URL to `no_push` so accidental `git push upstream` fails safely.

---

## Rules

1. **Commit and push customizations only to `origin`.** Never push this repo to PostForge.
2. **Fetch/merge from `upstream` only when you want template improvements.**
3. **Review upstream changes before they land on `main`.** Prefer the automated PR (`sync/postforge-upstream`) or a manual merge with validation.
4. **Do not blindly accept upstream defaults** for blog-specific files (see protected areas below).

---

## npm scripts

| Script | What it does |
|--------|----------------|
| `npm run sync:upstream:configure` | Ensure `upstream` exists and is fetch-only (`push → no_push`) |
| `npm run sync:upstream:fetch` | `git fetch upstream` |
| `npm run sync:upstream:status` | Show divergence between `main`, `origin/main`, and `upstream/main` |
| `npm run sync:upstream:merge` | Fetch upstream and merge `upstream/main` into the **current branch** (aborts if the working tree is dirty) |

### Manual sync (local)

```bash
# 1. See what's new upstream
npm run sync:upstream:status

# 2. Fetch latest PostForge
npm run sync:upstream:fetch

# 3. Merge into your branch (usually main)
git checkout main
git pull origin main
npm run sync:upstream:merge
```

If Git reports conflicts, resolve them manually (see checklist below), then:

```bash
npm install
npm run typecheck
npm run lint
npm test
git add .
git commit   # completes the merge
git push origin main
```

### Automated sync (GitHub Actions)

Workflow: [`.github/workflows/sync-upstream.yml`](../.github/workflows/sync-upstream.yml)

- **Manual:** GitHub → Actions → **Sync upstream PostForge** → **Run workflow**
- **Scheduled:** Weekly (Monday 12:00 UTC), if enabled in the repo

The workflow:

1. Fetches `upstream/main`
2. Creates or updates branch `sync/postforge-upstream`
3. Merges upstream into that branch
4. Opens or updates a **pull request into `main`**
5. Does **not** auto-merge
6. Does **not** push anything to PostForge

If upstream and local `main` have conflicts, the workflow **fails** and you must merge locally (see manual sync above).

---

## Protected local customizations

When reviewing an upstream sync PR or resolving merge conflicts, **preserve this repo's identity**. Do not replace these with generic PostForge defaults without review:

| Area | Local expectation |
|------|-------------------|
| Dev server port | `3011` (`npm run dev`, `package.json`) |
| App URLs | `APP_BASE_URL`, `NEXTAUTH_URL`, `WEBAUTHN_ORIGIN` → `http://localhost:3011` |
| Auth cookies | `AUTH_COOKIE_PREFIX=tgoliveira11-tech` and `src/lib/auth/*` cookie isolation helpers |
| Database | `docker-compose.yml`: `tgoliveira11-tech-postgres`, port `5434:5432`, repo-specific volume |
| Package identity | `package.json` name `tgoliveira11-tech` |
| Env template | `.env.example` blog-specific values and `AUTH_COOKIE_PREFIX` docs |
| Content & branding | Posts, `storage/`, blog settings, public copy |

Common conflict files:

- `.env.example`
- `docker-compose.yml`
- `package.json`
- `src/lib/auth/**`
- `src/lib/env/secure-auth-from-env.ts`
- `src/modules/admin/authorization.ts`

See also [UPGRADING_FROM_POSTFORGE.md](UPGRADING_FROM_POSTFORGE.md) for migration and validation steps.

---

## Upstream sync review checklist

Before merging a sync PR (or after a local merge), confirm:

- [ ] Local dev port is still **3011**
- [ ] `docker-compose.yml` still uses **tgoliveira11-tech** container, credentials, volume, and host port **5434**
- [ ] `AUTH_COOKIE_PREFIX=tgoliveira11-tech` is documented in `.env.example` and still supported in code
- [ ] `NEXTAUTH_URL`, `APP_BASE_URL`, and `WEBAUTHN_ORIGIN` use this repo's URL (local: `http://localhost:3011`)
- [ ] `package.json` name / branding did not revert to generic `postforge`
- [ ] Auth cookie isolation files under `src/lib/auth/` are intact
- [ ] No accidental overwrite of `storage/` or local-only `.env.local`

### Validation commands

```bash
npm install
npm run typecheck
npm run lint
npm test
```

Optional after schema changes from upstream:

```bash
npm run db:migrate
npm run build
```

---

## What never goes to PostForge

- `.env.local` and secrets
- Database data and `storage/uploads/`
- Blog posts and personalized UI/copy
- This repo's port, cookie, and Docker isolation settings

---

## Related docs

- [UPGRADING_FROM_POSTFORGE.md](UPGRADING_FROM_POSTFORGE.md) — detailed upgrade options and conflict tips
- [TEMPLATE_STRATEGY.md](TEMPLATE_STRATEGY.md) — template vs fork vs package strategy
