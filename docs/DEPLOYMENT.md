# Deployment guide

How to deploy a blog created from the PostForge template.

---

## Recommended free / low-cost stack (initial)

| Layer | Suggestion | Notes |
|-------|------------|-------|
| Source | GitHub repo (from template) | Your independent blog repo |
| App hosting | [Vercel](https://vercel.com) Hobby | Native Next.js support |
| Database | [Neon](https://neon.tech) Free or [Supabase](https://supabase.com) Free | Managed PostgreSQL |
| File storage | Cloudflare R2, AWS S3, Supabase Storage | **Required** for durable uploads on serverless |

PostForge is a standard Next.js app — other Node hosts (Railway, Fly.io, a VPS) also work.

---

## Critical: storage on serverless

**Do not rely on local filesystem uploads on Vercel or similar serverless platforms.**

The default `LocalStorageProvider` writes to `UPLOAD_LOCAL_DIR` on disk. On serverless:

- The filesystem is **ephemeral**
- Uploads may **disappear** after deploys or cold starts
- Multiple instances do not share disk

**Acceptable uses of local storage:**

- Local development
- Persistent VPS / dedicated server with a mounted volume

**Production serverless:** plan for object storage (R2, S3, etc.). See [STORAGE_STRATEGY.md](STORAGE_STRATEGY.md).

---

## Deployment checklist

### 1. Repository

- [ ] Blog repo created from PostForge template
- [ ] `.env.local` **not** committed
- [ ] `storage/uploads/` in `.gitignore` (if using local dev uploads)

### 2. Database

- [ ] Create PostgreSQL instance (Neon, Supabase, etc.)
- [ ] Set `DATABASE_URL` on the host
- [ ] Run migrations:

```bash
npm run db:migrate
```

Run migrations from CI, a one-off job, or locally against the production `DATABASE_URL`.

### 3. Environment variables

Set on your host (Vercel → Settings → Environment Variables):

| Variable | Production value |
|----------|------------------|
| `DATABASE_URL` | Managed Postgres connection string |
| `APP_BASE_URL` | `https://yourdomain.com` |
| `NEXTAUTH_URL` | `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | Strong random secret |
| `ADMIN_EMAIL` | Your admin email |
| `CRON_SECRET` | Strong random secret (if using scheduled publish cron) |
| `AUTH_COOKIE_SECURE` | `true` |
| `UPLOAD_*` | See storage strategy |

Full list: [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)

### 4. Build settings (Vercel)

- **Framework:** Next.js
- **Build command:** `npm run build`
- **Install command:** `npm install`
- **Node version:** 20+

### 5. Domain

- [ ] Add custom domain to host
- [ ] Update `APP_BASE_URL` and `NEXTAUTH_URL`
- [ ] HTTPS enabled

### 6. Auth

- [ ] Register admin account with `ADMIN_EMAIL`
- [ ] Verify `/login` and `/admin` work
- [ ] Configure OAuth only if needed

### 7. Uploads

- [ ] Confirm storage strategy matches your host (local VPS vs object storage)
- [ ] Test image upload and public `/api/assets/...` URLs

### 8. Public site

- [ ] Home `/` loads
- [ ] Publish a test post → `/blog/<slug>`
- [ ] `/rss.xml` returns feed
- [ ] `/sitemap.xml` loads
- [ ] `/robots.txt` disallows `/admin`

### 9. Security

- [ ] `npm run audit` — review dependency advisories
- [ ] Secrets not in Git
- [ ] Admin routes return 403 for non-`ADMIN_EMAIL` users

---

## Vercel-specific notes

1. Connect your GitHub blog repository.
2. Add environment variables for Production (and Preview if desired).
3. Deploy — Vercel runs `npm run build`.
4. Run `db:migrate` against production DB (Vercel does not run this automatically).
5. Optional: [Vercel Cron](https://vercel.com/docs/cron-jobs) for `/api/cron/*` scheduled publishing — protect with `CRON_SECRET`.

---

## VPS deployment (alternative)

Suitable when you want `LocalStorageProvider` without object storage initially:

```
Reverse proxy (Nginx/Caddy)
  → Node.js (npm run build && npm run start)
  → PostgreSQL
  → ./storage/uploads on persistent disk
```

- Set `UPLOAD_LOCAL_DIR` to a persistent path.
- Run migrations on deploy.
- Use a process manager (systemd, PM2).

---

## Post-deploy validation

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

Run locally against the same commit you deployed.

---

## Related docs

- [STORAGE_STRATEGY.md](STORAGE_STRATEGY.md)
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- [CREATE_A_BLOG.md](CREATE_A_BLOG.md)
- [UPGRADING_FROM_POSTFORGE.md](UPGRADING_FROM_POSTFORGE.md)
