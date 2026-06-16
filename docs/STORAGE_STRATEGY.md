# Storage strategy

How PostForge stores uploaded images and how to choose a strategy for your blog.

PostForge is a **GitHub template** — production-ready Vercel Blob support ships in the template so every new blog can deploy to Vercel without ephemeral filesystem uploads.

---

## Architecture

```
Admin upload (POST /api/admin/posts/[id]/assets)
        │
        ▼
  assets.service.uploadPostAsset()
        │
        ▼
  storage-provider-factory.createStorageProvider()
        │
   ┌────┴────┐
   ▼         ▼
 local    vercel-blob
   │         │
   ▼         ▼
 disk    @vercel/blob put()
   │         │
   ▼         ▼
/api/assets  https://...blob.vercel-storage.com/...
```

### `StorageProvider` interface (unchanged)

| Method | Purpose |
|--------|---------|
| `upload(input)` | Store binary, return `storageKey` + `publicUrl` |
| `delete(storageKey)` | Remove binary |
| `getPublicUrl(storageKey)` | Derive URL (local only; Blob uses URL from `put`) |

### Provider selection

`src/modules/assets/storage-provider-factory.ts` reads `UPLOAD_PROVIDER`:

| Value | Provider class |
|-------|----------------|
| `local` (default) | `LocalStorageProvider` |
| `vercel-blob` | `VercelBlobStorageProvider` |
| other | Configuration error |

`BLOB_READ_WRITE_TOKEN` is required **only** when `UPLOAD_PROVIDER=vercel-blob`.

### Storage key convention

Shared helper: `buildPostAssetStorageKey(postId, safeFilename)`

```
posts/{postId}/{safeFilename}
```

- `safeFilename` — sanitized, collision-avoided via `buildUniqueSafeFilename()`
- Same convention for local and Blob providers
- Path traversal blocked by `assertSafeStorageKey()`

### Database fields (no migration needed)

Existing `assets` table columns:

| Column | Local example | Blob example |
|--------|---------------|--------------|
| `storageProvider` | `local` | `vercel-blob` |
| `storageKey` | `posts/{id}/photo.png` | `posts/{id}/photo.png` |
| `publicUrl` | `/api/assets/posts/...` | `https://...blob.vercel-storage.com/...` |

---

## Local storage (`UPLOAD_PROVIDER=local`)

| Aspect | Behavior |
|--------|----------|
| Storage | `UPLOAD_LOCAL_DIR` (default `./storage/uploads`) |
| Public URL | `UPLOAD_PUBLIC_BASE_URL` + path (default `/api/assets`) |
| Serving | `GET /api/assets/[...path]` streams from disk |
| Delete | Remove file from disk |
| Token | Not required |

**Use for:** local development, VPS with persistent disk.

### Local manual test

1. Set `UPLOAD_PROVIDER=local`, `UPLOAD_LOCAL_DIR=./storage/uploads`, `UPLOAD_PUBLIC_BASE_URL=/api/assets`.
2. `npm run dev` → login as admin.
3. Upload image on a post.
4. Confirm file under `storage/uploads/posts/{postId}/`.
5. Set cover → publish → public page shows `/api/assets/...`.
6. Delete → file removed from disk.

---

## Vercel Blob (`UPLOAD_PROVIDER=vercel-blob`)

| Aspect | Behavior |
|--------|----------|
| Package | `@vercel/blob` |
| Upload | `put(pathname, buffer, { access: "public", contentType, token })` |
| Public URL | Returned by `put()` — stored in `assets.publicUrl` |
| Storage key | Blob `pathname` — stored in `assets.storageKey` |
| Serving | **Direct Blob URL** — no `/api/assets` proxy |
| Delete | `del(storageKey, { token })` |
| Token | `BLOB_READ_WRITE_TOKEN` **required** |

**Ignored env vars:** `UPLOAD_LOCAL_DIR`, `UPLOAD_PUBLIC_BASE_URL`

**Use for:** Vercel and other serverless production deployments.

### Vercel production manual test

1. Connect Vercel Blob store (public) → confirm `BLOB_READ_WRITE_TOKEN`.
2. Set `UPLOAD_PROVIDER=vercel-blob` → redeploy.
3. Upload image → `publicUrl` contains `blob.vercel-storage.com`.
4. Publish post → image renders on public site.
5. Delete asset → Blob deletion via `del()`.

Full guide: [deployment-vercel-neon.md](deployment-vercel-neon.md)

---

## Provider comparison

| | **Local** | **Vercel Blob** |
|--|-----------|-----------------|
| `UPLOAD_PROVIDER` | `local` | `vercel-blob` |
| Binary storage | `./storage/uploads` | Vercel Blob |
| `publicUrl` | `/api/assets/posts/...` | `https://...blob.vercel-storage.com/...` |
| Serving | `/api/assets/[...path]` | Direct URL |
| Delete | Filesystem `rm` | `del(storageKey)` |
| `BLOB_READ_WRITE_TOKEN` | Not required | Required |
| `UPLOAD_LOCAL_DIR` | Used | Ignored |
| `UPLOAD_PUBLIC_BASE_URL` | Used | Ignored |
| `UPLOAD_MAX_FILE_SIZE_BYTES` | Used | Used |

---

## Upload flow

1. Admin POST to `/api/admin/posts/[id]/assets` (requires `ADMIN_EMAIL` session).
2. Validate MIME, extension, size; reject SVG.
3. Build `safeFilename` and `storageKey` via `buildPostAssetStorageKey()`.
4. Provider `upload()` → persist metadata in `assets` table.
5. Cover/OG/Markdown reference asset by ID or `publicUrl`.

---

## Remote URL rendering

`PostImage` and `isRemoteAssetUrl()` in `assets.utils.ts`:

- Local URLs (`/api/assets/...`) — served via API route; `next/image` unoptimized when dimensions missing
- Blob URLs (`https://...`) — rendered directly; `unoptimized` for remote assets
- `next.config.ts` — `images.remotePatterns` for `*.blob.vercel-storage.com`

Blob assets are **not** proxied through `/api/assets`.

---

## Asset deletion

When admin deletes an asset:

1. Clear `coverAssetId` / `ogAssetId` on post if referenced.
2. Delete binary only if `asset.storageProvider` matches active provider.
3. Remove `assets` database row.
4. Markdown references are **not** rewritten (UI warning).

---

## Downstream blog adoption

Existing blogs merge upstream PostForge:

```bash
git remote add upstream https://github.com/tgoliveira11/postforge.git
git fetch upstream && git merge upstream/main
npm install
```

Configure Vercel:

```env
UPLOAD_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=...
```

- **Existing local assets** — keep `/api/assets/...` URLs in DB
- **New uploads** — use Blob URLs
- **No DB migration**

---

## Future storage providers

The `StorageProvider` abstraction allows additional backends:

- Cloudflare R2
- AWS S3
- Supabase Storage

Not implemented yet. Vercel Blob is the production default for Vercel deployments.

---

## Git and backups

- Do not commit `storage/uploads/` to Git.
- Blob files: manage via Vercel Storage dashboard.
- Backup `assets` table with your database — it holds `publicUrl` and `storageKey`.

---

## Related docs

- [deployment-vercel-neon.md](deployment-vercel-neon.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- [FAQ.md](FAQ.md)
