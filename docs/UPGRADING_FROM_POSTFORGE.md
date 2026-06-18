# Upgrading from PostForge upstream

How to bring improvements from the official PostForge template into **your** independent blog repository.

**Upstream:** [github.com/tgoliveira11/postforge](https://github.com/tgoliveira11/postforge)

**Day-to-day sync workflow for this repo:** [upstream-sync.md](upstream-sync.md) (remotes, npm scripts, GitHub Actions PR, review checklist).

---

## Important tradeoff

GitHub templates create a **one-time copy**. Your blog repo does **not** automatically receive updates when PostForge changes.

You choose when and how to merge upstream improvements.

---

## Before any upgrade

1. **Commit or stash** local changes.
2. **Backup** your database and uploaded files.
3. Read upstream release notes / changelog (if available) and migration files in `drizzle/`.
4. Never blindly overwrite `.env.local`, `storage/`, or blog-specific customizations.

---

## Option A — Manual update (safest for heavy customization)

1. Browse [PostForge commits](https://github.com/tgoliveira11/postforge/commits/main).
2. Identify fixes or features you want.
3. Cherry-pick or manually copy relevant files.
4. Run quality gates (below).
5. Apply new migrations if any.

**Best for:** blogs with significant custom UI, schema forks, or deployment differences.

---

## Option B — Add upstream remote and merge

Add PostForge as `upstream` (once):

```bash
git remote add upstream https://github.com/tgoliveira11/postforge.git
git fetch upstream
```

Merge when you want updates:

```bash
git checkout main
git merge upstream/main
# Resolve conflicts — common in:
#   .env.local (never commit — yours stays local)
#   blog_settings / content-specific files
#   custom branding you added
```

After merge:

```bash
npm install
npm run db:migrate
npm run typecheck
npm test
npm run lint
npm run db:generate   # expect no new migrations unless upstream added schema
npm run build
npm audit
```

### Conflict tips

| File / area | Guidance |
|-------------|----------|
| `.env.local` | Keep yours; compare with `.env.example` for new vars |
| `storage/uploads/` | Keep your files; never take upstream's |
| `blog_settings` / DB | Migrations only — don't reset production DB |
| `README.md` | Often keep yours or merge docs sections |
| Public UI customizations | Review carefully — you may prefer yours |

---

## Option C — Future package extraction

PostForge may later split into npm packages (`@postforge/core`, `@postforge/ui`, etc.). That could simplify upgrades:

- Bump package versions instead of merging whole repos
- Keep your repo for routes, config, and branding only

**Not available today.** Template + manual/upstream merge is the current path.

---

## Database migrations after upgrade

1. Pull latest `drizzle/*.sql` from upstream.
2. Run `npm run db:migrate` against your database.
3. If you **modified schema yourself**, resolve migration conflicts before applying.

Never run destructive SQL on production without a backup.

---

## Updating `@tgoliveira/secure-auth`

Auth is a separate npm package:

```bash
npm update @tgoliveira/secure-auth
npm run db:migrate   # if the package ships schema changes
npm test
npm run build
```

Follow secure-auth release notes for breaking changes.

### `>= 0.1.20-internal` — authenticated guest-page redirects

The package redirects fully authenticated users away from `/login`, `/register`, and `/forgot-password` by default. This repo maps:

- `AUTH_REDIRECT_AUTHENTICATED_FROM_GUEST_PAGES` (default `true`)
- `AUTH_AUTHENTICATED_REDIRECT_PATH` (default `/admin` via `AUTH_AFTER_LOGIN_PATH`)

`SecureAuthUIProvider` already receives `secureAuth.uiConfig` from the root layout. Optional server-side defense is wired in `src/proxy.ts` via `createSecureAuthMiddleware` (no DB import). Token recovery (`/reset-password?token=`), email verification, pending 2FA, and `/check-email` flows remain allowed per package rules.

Do **not** duplicate custom guest-route redirects unless intentionally overriding package behavior.

### `>= 0.1.21-internal` — API security hardening

Package API handlers enforce their own auth tiers. This repo already delegates all auth/account routes to `secureAuth.routes.*` — do not reimplement passkey, 2FA, session, or account APIs.

Env mapped in `buildSecureAuthConfigFromEnv()`:

- `EMAIL_VERIFICATION_REQUIRE_FOR_ACCOUNT_APIS` (default `true`)
- `AUTH_SAME_ORIGIN_PROTECTION_ENABLED` (default `true`)
- `AUTH_ALLOWED_ORIGINS` (optional comma-separated preview/staging origins)
- `AUTH_DEBUG_EXPOSE_TRACE_ROUTE` (default `false`; requires `AUTH_TRACE=true` to expose trace route)

Ensure production `APP_BASE_URL` and `NEXTAUTH_URL` match the deployed origin. Middleware in `src/proxy.ts` remains defense-in-depth only.

---

## Adopting Vercel Blob storage (upstream feature)

If your blog was created before PostForge shipped `UPLOAD_PROVIDER=vercel-blob`, merge upstream and configure Vercel:

```bash
git remote add upstream https://github.com/tgoliveira11/postforge.git
git fetch upstream
git merge upstream/main
npm install
npm run typecheck
npm test
npm run lint
npm run build
npm run db:generate   # expect no schema changes
```

Then in Vercel → **Settings → Environment Variables** (Production):

```env
UPLOAD_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=<from-connected-blob-store>
UPLOAD_MAX_FILE_SIZE_BYTES=5242880
```

1. Create/connect a **Vercel Blob** store (public access) in Vercel **Storage**.
2. Confirm `BLOB_READ_WRITE_TOKEN` is set automatically.
3. Redeploy.

**No DB migration** — existing `assets` table fields (`storageProvider`, `storageKey`, `publicUrl`) are sufficient.

**Existing assets:** rows uploaded with `local` keep `/api/assets/...` URLs. New uploads use Blob URLs. Old local files on Vercel may 404 unless re-uploaded.

**Full guides:** [deployment-vercel-neon.md](deployment-vercel-neon.md), [STORAGE_STRATEGY.md](STORAGE_STRATEGY.md)

---

## Required validation after upgrades

```bash
npm install
npm run typecheck
npm test
npm run lint
npm run db:generate
npm run build
npm audit
```

### Smoke test

- [ ] `/login` and `/admin` as `ADMIN_EMAIL`
- [ ] Create/edit/publish a post
- [ ] Public `/blog/<slug>`
- [ ] Image upload and display (local: `/api/assets/...`; Vercel: `blob.vercel-storage.com`)
- [ ] `/rss.xml` and `/sitemap.xml`

---

## When not to merge upstream

- You only need a security patch in one file — cherry-pick that commit.
- Upstream changed schema in a way incompatible with your fork.
- You are mid-migration or production incident — stabilize first.

---

## Related docs

- [upstream-sync.md](upstream-sync.md) — remotes, safe sync scripts, automated PR workflow
- [TEMPLATE_STRATEGY.md](TEMPLATE_STRATEGY.md)
- [FAQ.md](FAQ.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [deployment-vercel-neon.md](deployment-vercel-neon.md)
- [STORAGE_STRATEGY.md](STORAGE_STRATEGY.md)
