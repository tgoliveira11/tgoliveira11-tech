# Deploy PostForge on Vercel + Neon + Vercel Blob

Guide for deploying a blog created from the PostForge template on **Vercel** with **Neon PostgreSQL** and **Vercel Blob** durable file storage.

---

## Production architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Vercel (Next.js App Router)                                │
│  ├─ Public pages, admin, API routes                         │
│  ├─ UPLOAD_PROVIDER=vercel-blob                             │
│  └─ @vercel/blob put/del for admin uploads                  │
├─────────────────────────────────────────────────────────────┤
│  Neon PostgreSQL                                            │
│  └─ posts, assets metadata, auth (secure-auth), blog data   │
├─────────────────────────────────────────────────────────────┤
│  Vercel Blob (public store)                                 │
│  └─ image binaries at https://...blob.vercel-storage.com/   │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Service | Role |
|-------|---------|------|
| App | Vercel | Host Next.js, serverless functions |
| Database | Neon (or Supabase) | PostgreSQL |
| File storage | Vercel Blob | Durable image uploads (`UPLOAD_PROVIDER=vercel-blob`) |

PostForge supports two storage modes:

| Mode | `UPLOAD_PROVIDER` | When |
|------|-------------------|------|
| Local filesystem | `local` | Development, VPS with persistent disk |
| Vercel Blob | `vercel-blob` | **Vercel production** |

---

## Why local uploads fail on Vercel

Vercel serverless functions use an **ephemeral filesystem**:

- Uploaded files may disappear after redeploys or cold starts
- Multiple instances do not share disk
- `/api/assets/[...path]` cannot reliably serve files written at runtime

**Do not use `UPLOAD_PROVIDER=local` in Vercel production.**

PostForge ships with **`UPLOAD_PROVIDER=vercel-blob`** so template users get durable storage without custom infrastructure.

---

## No database migration required

Vercel Blob support reuses existing `assets` table fields:

- `storageProvider` — `"local"` or `"vercel-blob"`
- `storageKey` — pathname (`posts/{postId}/{safeFilename}`)
- `publicUrl` — `/api/assets/...` or `https://...blob.vercel-storage.com/...`

No schema changes. No new migration. Existing asset rows remain valid.

---

## 1. Create your blog repo from the template

See [CREATE_A_BLOG.md](CREATE_A_BLOG.md).

---

## 2. Connect Vercel to GitHub

1. Import your blog repository at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js**.
3. Build command: `npm run build`
4. Install command: `npm install`

---

## 3. Create PostgreSQL (Neon)

1. Create a project at [Neon](https://neon.tech) (free tier works).
2. Copy the connection string.
3. In Vercel → **Settings → Environment Variables**, set:

```env
DATABASE_URL=postgres://...
```

4. Run migrations once against production:

```bash
DATABASE_URL="postgres://..." npm run db:migrate
```

Vercel does not run migrations automatically.

---

## 4. Create and connect Vercel Blob

1. Open your Vercel project → **Storage**.
2. Click **Create Database** or **Connect Store** → choose **Blob**.
3. Create a store with **public** access (blog images are served via public URLs).
4. **Connect** the store to your project.

Vercel automatically adds **`BLOB_READ_WRITE_TOKEN`** to environment variables when the store is connected.

### Confirm the token

1. Vercel project → **Settings → Environment Variables**.
2. Verify `BLOB_READ_WRITE_TOKEN` exists for **Production** (and Preview if needed).
3. The value is set by Vercel — do not commit it to Git.

If the token is missing:

- Re-connect the Blob store to the project
- Or create the store from the same Vercel team/account as the project

---

## 5. Production environment variables

Set in Vercel → **Settings → Environment Variables** (Production):

```env
# Database
DATABASE_URL=postgres://...

# App / auth
APP_BASE_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<long-random-secret>
ADMIN_EMAIL=you@example.com
CRON_SECRET=<long-random-secret>
AUTH_COOKIE_SECURE=true

# Storage (Vercel Blob)
UPLOAD_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=<set-by-vercel-when-blob-connected>
UPLOAD_MAX_FILE_SIZE_BYTES=5242880
```

**Not used when `UPLOAD_PROVIDER=vercel-blob`:**

- `UPLOAD_LOCAL_DIR`
- `UPLOAD_PUBLIC_BASE_URL`

Full reference: [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)

---

## 6. Deploy

Push to `main` or click **Redeploy** after env vars are set.

---

## 7. Post-deploy smoke test

- [ ] `/login` and `/admin` work with `ADMIN_EMAIL`
- [ ] Upload an image in the post editor
- [ ] Asset `publicUrl` is `https://...blob.vercel-storage.com/...`
- [ ] Set cover image and publish a post
- [ ] Public post at `/blog/<slug>` renders the image
- [ ] Delete an asset — confirm it is removed from admin
- [ ] `/rss.xml` and `/sitemap.xml` work

---

## 8. Manual upload test (Vercel production)

1. Connect or create a Vercel Blob store (public access).
2. Confirm `BLOB_READ_WRITE_TOKEN` in Vercel env.
3. Set `UPLOAD_PROVIDER=vercel-blob`.
4. Redeploy.
5. Login to `/admin`.
6. Open a post → upload an image.
7. Confirm `publicUrl` contains `blob.vercel-storage.com`.
8. Set as cover image.
9. Publish → open `/blog/<slug>` → image renders.
10. Delete the asset → confirm admin UI updates.
11. (Optional) Verify blob removed in Vercel Storage dashboard.

Markdown references are **not** rewritten on delete — existing UI warning applies.

---

## 9. Manual upload test (local development)

Keep local uploads on disk — no Blob token required:

```env
UPLOAD_PROVIDER=local
UPLOAD_LOCAL_DIR=./storage/uploads
UPLOAD_PUBLIC_BASE_URL=/api/assets
```

Steps:

1. Set env vars above in `.env.local`.
2. Run `npm run dev`.
3. Login as admin.
4. Create or edit a post.
5. Upload an image.
6. Confirm file exists under `storage/uploads/posts/{postId}/`.
7. Set cover image.
8. Publish → public page renders `/api/assets/posts/...`.
9. Delete image → file removed from disk.

---

## 10. Downstream blog adoption

If your blog (e.g. `tgoliveira11-tech`) was created from PostForge before Vercel Blob support:

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

Then in Vercel env:

```env
UPLOAD_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=<from-vercel-blob-store>
UPLOAD_MAX_FILE_SIZE_BYTES=5242880
```

Redeploy.

**What happens to existing assets:**

- Old local assets keep `/api/assets/...` URLs in the database — they still work if files exist on disk
- New uploads use Vercel Blob public URLs
- No DB migration expected

See also [UPGRADING_FROM_POSTFORGE.md](UPGRADING_FROM_POSTFORGE.md).

---

## Troubleshooting

### Upload fails with “BLOB_READ_WRITE_TOKEN is required”

- `UPLOAD_PROVIDER=vercel-blob` is set but token is missing
- Connect Blob store to project in Vercel Storage dashboard
- Redeploy after env var appears

### Upload works locally but not on Vercel

- Confirm `UPLOAD_PROVIDER=vercel-blob` on Vercel (not `local`)
- Local `.env.local` settings do not apply to production

### Images upload but do not render on public site

- Check `publicUrl` starts with `https://`
- Confirm Blob store has **public** access
- Check browser network tab for 404 on image URL

### Old `/api/assets/...` images broken after switching to Blob

- Expected for assets uploaded before migration if local files are gone
- Re-upload images or migrate files to Blob manually (no automated migration script yet)

### `GET /api/assets/...` returns 404 in production

- Normal when `UPLOAD_PROVIDER=vercel-blob` — new assets use direct Blob URLs
- `/api/assets` only serves **local** provider files

### Build passes but `db:migrate` not run

- Tables missing → auth or blog features fail
- Run `DATABASE_URL="..." npm run db:migrate` against production DB

---

## Implementation reference (template)

| Component | Path |
|-----------|------|
| Provider factory | `src/modules/assets/storage-provider-factory.ts` |
| Vercel Blob provider | `src/modules/assets/vercel-blob-storage-provider.ts` |
| Local provider | `src/modules/assets/local-storage-provider.ts` |
| Storage key builder | `src/modules/assets/storage-keys.ts` |
| Upload service | `src/modules/assets/assets.service.ts` |
| Package | `@vercel/blob` |

Tests: 145 passing (factory, Blob mocks, path traversal, remote URL detection).

---

## Related docs

- [STORAGE_STRATEGY.md](STORAGE_STRATEGY.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- [FAQ.md](FAQ.md)
