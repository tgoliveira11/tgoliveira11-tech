# Storage strategy

How PostForge stores uploaded images and how to choose a strategy for your blog.

---

## Current implementation (MVP)

PostForge uses a `StorageProvider` abstraction. The only production-ready implementation today is:

### `LocalStorageProvider`

- Files written to `UPLOAD_LOCAL_DIR` (default `./storage/uploads`)
- Public URLs under `UPLOAD_PUBLIC_BASE_URL` (default `/api/assets`)
- Served by `GET /api/assets/[...path]`
- Max size from `UPLOAD_MAX_FILE_SIZE_BYTES` (default 5 MB)

Assets are organized with server-generated keys (post-scoped paths) — not raw user filenames.

---

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `UPLOAD_PROVIDER` | `local` | Documented for future providers; code uses local today |
| `UPLOAD_LOCAL_DIR` | `./storage/uploads` | Disk directory |
| `UPLOAD_PUBLIC_BASE_URL` | `/api/assets` | URL prefix |
| `UPLOAD_MAX_FILE_SIZE_BYTES` | `5242880` | 5 MB |

---

## How images flow

1. Admin uploads via `/api/admin/posts/[id]/assets` or editor assets panel.
2. File saved to local disk (or future object store).
3. Database `assets` row stores metadata + `storageKey` + `publicUrl`.
4. Markdown, cover, and OG reference asset IDs.
5. Public pages render images via `PostImage` → `/api/assets/...` or stored public URL.

---

## When local storage is enough

| Scenario | Local storage OK? |
|----------|-------------------|
| Local development | Yes |
| Single VPS with persistent disk | Yes |
| Docker on a server with a mounted volume | Yes |
| Vercel / serverless | **No** (ephemeral disk) |
| Multiple app instances without shared disk | **No** |

---

## Serverless / Vercel warning

On Vercel and similar platforms:

- Uploaded files may be **lost** on redeploy
- Instances do **not** share local disk
- You need **object storage** with a durable provider

Planned future providers (not all implemented yet):

- Cloudflare R2
- AWS S3
- Supabase Storage
- Compatible S3 APIs

Until an object storage provider ships in PostForge, VPS + local disk is the simplest production path for image-heavy blogs.

---

## Choosing a strategy for your blog

| Your deployment | Recommendation |
|-----------------|----------------|
| Learning locally | `UPLOAD_LOCAL_DIR=./storage/uploads` |
| Personal blog on a $5 VPS | Local storage on persistent volume |
| Vercel + Neon free tier | Plan object storage before going live with images |
| Import-only (few images) | Local may work short-term; still risky on serverless |

---

## Git and backups

- **Do not commit** `storage/uploads/` to Git (add to `.gitignore`).
- Back up uploaded files with your deployment backup strategy.
- Database `assets` table references storage keys — backup DB **and** files together.

---

## Migration between storage backends

When object storage providers are added:

1. Export/copy files from old backend to new bucket.
2. Update asset `storageKey` / `publicUrl` records (migration script).
3. Update env to new provider.
4. Verify `/api/assets` or CDN URLs on public posts.

Document your migration in your blog repo when you perform it.

---

## Related docs

- [DEPLOYMENT.md](DEPLOYMENT.md)
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- [ARCHITECTURE.md](ARCHITECTURE.md) — storage architecture section
