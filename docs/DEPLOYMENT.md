# Deployment guide

How to deploy a blog created from the PostForge template.

---

## Recommended free / low-cost stack (initial)

| Layer | Suggestion | Notes |
|-------|------------|-------|
| Source | GitHub repo (from template) | Your independent blog repo |
| App hosting | [Vercel](https://vercel.com) Hobby | Native Next.js support |
| Database | [Neon](https://neon.tech) Free or [Supabase](https://supabase.com) Free | Managed PostgreSQL |
| File storage | **Vercel Blob** (built-in) or R2/S3 | Set `UPLOAD_PROVIDER=vercel-blob` on Vercel |

PostForge is a standard Next.js app — other Node hosts (Railway, Fly.io, a VPS) also work.

**Vercel + Neon guide:** [deployment-vercel-neon.md](deployment-vercel-neon.md)

---

## Critical: storage on serverless

**Do not rely on local filesystem uploads on Vercel or similar serverless platforms.**

Use **`UPLOAD_PROVIDER=vercel-blob`** with a connected Vercel Blob store:

```env
UPLOAD_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=<set-by-vercel>
UPLOAD_MAX_FILE_SIZE_BYTES=5242880
```

The default `LocalStorageProvider` (`UPLOAD_PROVIDER=local`) writes to disk — ephemeral on serverless.

**Acceptable uses of local storage:**

- Local development
- Persistent VPS / dedicated server with a mounted volume

See [STORAGE_STRATEGY.md](STORAGE_STRATEGY.md).

---

## Deploying to Vercel with Neon and Vercel Blob

Recommended production stack for blogs created from the PostForge template.

### Architecture

| Component | Service | Purpose |
|-----------|---------|---------|
| Next.js app | **Vercel** | Hosting, serverless functions, Blob integration |
| PostgreSQL | **Neon** (or Supabase) | Posts, assets metadata, auth tables |
| File storage | **Vercel Blob** | Durable image uploads (`UPLOAD_PROVIDER=vercel-blob`) |

Local filesystem uploads are **not durable** on Vercel — use Blob for production.

### Step-by-step

1. **Create blog repo** from the PostForge template — [CREATE_A_BLOG.md](CREATE_A_BLOG.md).
2. **Import to Vercel** — connect GitHub repo, Next.js preset, `npm run build`.
3. **Neon Postgres** — create project, copy `DATABASE_URL`, set in Vercel env.
4. **Run migrations** once against production (includes enriched analytics columns in `0003_groovy_absorbing_man`):

```bash
DATABASE_URL="postgres://..." npm run db:migrate
```

Re-run after pulling analytics enrichment changes if `/admin/analytics` shows a migration warning.

5. **Vercel Blob** — Vercel project → **Storage** → create/connect **Blob** store (public access).
6. **Confirm token** — `BLOB_READ_WRITE_TOKEN` appears in env when store is connected.
7. **Set production env vars:**

```env
DATABASE_URL=postgres://...
APP_BASE_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<long-random-secret>
ADMIN_EMAIL=you@example.com
CRON_SECRET=<long-random-secret>
AUTH_COOKIE_SECURE=true
UPLOAD_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=<set-by-vercel>
UPLOAD_MAX_FILE_SIZE_BYTES=5242880
EMAIL_PROVIDER=resend
RESEND_API_KEY=<from-resend-dashboard>
EMAIL_FROM="Your Blog <noreply@mail.your-domain.com>"
EMAIL_REPLY_TO=you@your-domain.com
```

8. **Configure transactional email** — see [EMAIL_PROVIDERS.md](EMAIL_PROVIDERS.md) for Resend domain verification (Cloudflare DNS) and testing verification/reset emails.
9. **Deploy** — push to `main` or redeploy after env changes.
10. **Post-deploy smoke test:**
   - Register/login with `ADMIN_EMAIL`
   - Upload image → `publicUrl` is `https://...blob.vercel-storage.com/...`
   - Publish post → image renders on `/blog/<slug>`
   - Delete asset → Blob removal works
   - `/rss.xml` and `/sitemap.xml` respond

**No DB migration** is required for Vercel Blob — existing `assets` table fields are reused.

**Full guide:** [deployment-vercel-neon.md](deployment-vercel-neon.md)

### Downstream blog adoption

If your blog was created before Vercel Blob support shipped in the template:

```bash
git remote add upstream https://github.com/tgoliveira11/postforge.git
git fetch upstream
git merge upstream/main
npm install
npm run typecheck
npm test
npm run lint
npm run build
npm run db:generate
```

Then set Vercel env (`UPLOAD_PROVIDER=vercel-blob`, `BLOB_READ_WRITE_TOKEN=...`) and redeploy.

- Existing local assets keep `/api/assets/...` URLs in the database
- New uploads use Blob URLs
- No schema migration expected

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
| `EMAIL_PROVIDER` | `resend` in production |
| `RESEND_API_KEY` | From Resend dashboard (server-only) |
| `EMAIL_FROM` | Verified sender on your Resend domain |
| `EMAIL_REPLY_TO` | Optional reply-to address |

Full list: [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) · Email setup: [EMAIL_PROVIDERS.md](EMAIL_PROVIDERS.md)

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

- [ ] Confirm storage strategy matches your host (local VPS vs Vercel Blob)
- [ ] **Vercel:** `UPLOAD_PROVIDER=vercel-blob` + connected Blob store
- [ ] **Local/VPS:** `UPLOAD_PROVIDER=local` + persistent `UPLOAD_LOCAL_DIR`
- [ ] Test upload → publish → image visible on public post
- [ ] **Vercel:** confirm `publicUrl` is `blob.vercel-storage.com`
- [ ] **Local:** confirm `/api/assets/...` URLs work

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
