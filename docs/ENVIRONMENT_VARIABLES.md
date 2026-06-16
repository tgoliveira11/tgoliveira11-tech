# Environment variables

Reference for PostForge configuration. Copy `.env.example` to `.env.local` for local development.

**Never commit `.env.local` or real secrets.**

---

## Quick reference — required for local dev

| Variable | Example | Required |
|----------|---------|----------|
| `DATABASE_URL` | `postgres://postforge:postforge@localhost:5432/postforge` | Yes |
| `APP_BASE_URL` | `http://localhost:3000` | Yes |
| `NEXTAUTH_URL` | `http://localhost:3000` | Yes (auth) |
| `NEXTAUTH_SECRET` | long random string | Yes (auth) |
| `ADMIN_EMAIL` | `you@example.com` | Yes (admin) |

---

## App

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `APP_BASE_URL` | Canonical public URL | `http://localhost:3000` | Used for SEO, RSS, links |
| `APP_NAME` | Site / blog title fallback | `PostForge` | Overridden by `blog_settings` when set |
| `APP_SLUG` | Internal app slug | `postforge` | Rarely changed |
| `NODE_ENV` | Node environment | `development` | Set by host in production |

---

## Database

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `DATABASE_URL` | PostgreSQL connection string | — | **Required** |
| `DATABASE_POOL_MAX` | Max connections per process | `2` dev / `5` prod | Lower if you see “too many clients” |

---

## Auth (secure-auth / NextAuth)

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `NEXTAUTH_URL` | Auth callback base URL | — | Match `APP_BASE_URL` in most setups |
| `NEXTAUTH_SECRET` | Session encryption secret | — | **Required** in production |
| `AUTH_AFTER_LOGIN_PATH` | Post-login redirect | `/admin` | |
| `AUTH_AFTER_LOGOUT_PATH` | Post-logout redirect | `/login` | |

> **Note:** Some docs refer to `AUTH_SECRET` generically. In this project the actual variable is **`NEXTAUTH_SECRET`** (NextAuth convention used by `@tgoliveira/secure-auth`).

### OAuth — Google

| Variable | Required |
|----------|----------|
| `AUTH_GOOGLE_CLIENT_ID` | Only if enabling Google login |
| `AUTH_GOOGLE_CLIENT_SECRET` | Only if enabling Google login |

### OAuth — Apple

| Variable | Required |
|----------|----------|
| `AUTH_APPLE_CLIENT_ID` | Only if enabling Apple login |
| `AUTH_APPLE_CLIENT_SECRET` | Only if enabling Apple login |

### OAuth — Microsoft

| Variable | Required |
|----------|----------|
| `AUTH_MICROSOFT_CLIENT_ID` | Only if enabling Microsoft login |
| `AUTH_MICROSOFT_CLIENT_SECRET` | Only if enabling Microsoft login |
| `AUTH_MICROSOFT_TENANT_ID` | `common` (default) |

### Email

| Variable | Purpose | Notes |
|----------|---------|-------|
| `EMAIL_FROM` | From address for auth emails | Dev provider may log to console |
| `EMAIL_VERIFICATION_SEND_ON_REGISTER` | Send verification on register | `true` default |
| `EMAIL_VERIFICATION_REQUIRE_BEFORE_SIGN_IN` | Block login until verified | `false` default for easier local dev |

### WebAuthn / passkeys

| Variable | Purpose |
|----------|---------|
| `WEBAUTHN_RP_ID` | Relying party ID (`localhost` in dev) |
| `WEBAUTHN_RP_NAME` | Display name |
| `WEBAUTHN_ORIGIN` | Must match site origin |

### Two-factor, sessions, password policy

See `.env.example` for:

- `TWO_FACTOR_SECRET_ENCRYPTION_KEY`
- `AUTH_SESSION_*`
- `AUTH_PASSWORD_*`
- `AUTH_RATE_LIMIT_STORE`
- `AUTH_COOKIE_SECURE` — set `true` in HTTPS production
- `AUTH_TRACE` — debug only

---

## PostForge blog / admin

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `ADMIN_EMAIL` | Email allowed to use `/admin` | — | **Required**; case-insensitive match |
| `CRON_SECRET` | Protects scheduled publish cron endpoints | — | **Required** in production if cron is used |

---

## Uploads / storage

| Variable | Purpose | Default | Used when |
|----------|---------|---------|-----------|
| `UPLOAD_PROVIDER` | Storage backend selector | `local` | Always — `local` or `vercel-blob` |
| `UPLOAD_LOCAL_DIR` | Local upload directory | `./storage/uploads` | **`local` only** — ignored for `vercel-blob` |
| `UPLOAD_PUBLIC_BASE_URL` | Public URL prefix for assets | `/api/assets` | **`local` only** — ignored for `vercel-blob` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read-write token | — | **`vercel-blob` only** — auto-set when Blob store is connected |
| `UPLOAD_MAX_FILE_SIZE_BYTES` | Max upload size in bytes | `5242880` (5 MB) | Both providers |
| `UPLOAD_MAX_FILE_SIZE` | Alias for max size | — | Same as above |
| `STORAGE_MAX_UPLOAD_BYTES` | Another alias | — | Supported in code |

### Which vars apply where

| Variable | Local dev / VPS | Vercel production |
|----------|-----------------|-------------------|
| `UPLOAD_PROVIDER` | `local` | `vercel-blob` |
| `UPLOAD_LOCAL_DIR` | Required (or default) | **Not used** |
| `UPLOAD_PUBLIC_BASE_URL` | Required (or default) | **Not used** |
| `BLOB_READ_WRITE_TOKEN` | **Not used** | **Required** |
| `UPLOAD_MAX_FILE_SIZE_BYTES` | Optional (default 5 MB) | Optional (default 5 MB) |

### Provider rules

- `UPLOAD_PROVIDER=local` → files on disk, served via `/api/assets/[...path]`; no Blob token
- `UPLOAD_PROVIDER=vercel-blob` → files in Vercel Blob, public URLs from `put()`; `BLOB_READ_WRITE_TOKEN` required at upload/delete time
- Provider is selected at runtime by `storage-provider-factory.ts` from `UPLOAD_PROVIDER`
- Storage keys use shared convention: `posts/{postId}/{safeFilename}` via `buildPostAssetStorageKey()`
- **No database migration** — `assets.storageProvider`, `assets.storageKey`, `assets.publicUrl` are reused

### Example: local development

```env
UPLOAD_PROVIDER=local
UPLOAD_LOCAL_DIR=./storage/uploads
UPLOAD_PUBLIC_BASE_URL=/api/assets
UPLOAD_MAX_FILE_SIZE_BYTES=5242880
```

### Example: Vercel production

```env
UPLOAD_PROVIDER=vercel-blob
BLOB_READ_WRITE_TOKEN=<set-by-vercel-when-blob-connected>
UPLOAD_MAX_FILE_SIZE_BYTES=5242880
```

Do **not** set `UPLOAD_LOCAL_DIR` or `UPLOAD_PUBLIC_BASE_URL` for `vercel-blob` — they are ignored.

See [STORAGE_STRATEGY.md](STORAGE_STRATEGY.md) and [deployment-vercel-neon.md](deployment-vercel-neon.md).

---

## Analytics

| Mechanism | Purpose | Notes |
|-----------|---------|-------|
| `blog_settings.analyticsEnabled` | Toggle post view tracking | DB key; default enabled |
| `ANALYTICS_ENABLED` | Reserved env name | **Not wired in code yet** — use blog settings or future env support |

Post view API: `POST /api/analytics/post-view` (rate-limited, published posts only).

---

## Timezone

| Variable | Purpose | Notes |
|----------|---------|-------|
| `DEFAULT_TIMEZONE` | Suggested default e.g. `America/Sao_Paulo` | **Not wired in code yet** — document for future scheduling/display |

---

## Local vs production

### Local development (minimum)

```
DATABASE_URL
APP_BASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
ADMIN_EMAIL
UPLOAD_PROVIDER=local
UPLOAD_LOCAL_DIR=./storage/uploads
UPLOAD_PUBLIC_BASE_URL=/api/assets
```

OAuth, email SMTP, `CRON_SECRET`, and `BLOB_READ_WRITE_TOKEN` can stay empty for basic local blogging.

### Production on Vercel (additional)

- Strong `NEXTAUTH_SECRET` and `CRON_SECRET`
- `APP_BASE_URL` / `NEXTAUTH_URL` set to your HTTPS domain
- `AUTH_COOKIE_SECURE=true` (HTTPS)
- Managed PostgreSQL `DATABASE_URL`
- `UPLOAD_PROVIDER=vercel-blob` + `BLOB_READ_WRITE_TOKEN` (from connected Blob store)
- **Do not** rely on `UPLOAD_LOCAL_DIR` on serverless — see [STORAGE_STRATEGY.md](STORAGE_STRATEGY.md)
- OAuth secrets if using social login
- Real email provider when beyond dev

### Production on VPS (alternative)

- `UPLOAD_PROVIDER=local` with persistent `UPLOAD_LOCAL_DIR` on mounted disk
- No `BLOB_READ_WRITE_TOKEN` required

---

## Related documentation

- [.env.example](../.env.example) — copy-paste template
- [CREATE_A_BLOG.md](CREATE_A_BLOG.md) — setup walkthrough
- [DEPLOYMENT.md](DEPLOYMENT.md) — production checklist
