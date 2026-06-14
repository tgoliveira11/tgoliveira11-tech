# PostForge Domain Model

This document defines PostForge-owned database tables. **Authentication tables are not defined here** — they are owned by `@tgoliveira/secure-auth` and already exist in the database.

---

## Data ownership

```
┌─────────────────────────────────────────────────────────────┐
│  @tgoliveira/secure-auth (package-owned, DO NOT MODIFY)     │
│  users, account_sessions, account_tokens, audit_events,     │
│  passkey_credentials, rate_limit_buckets, webauthn_*,       │
│  user_two_factor_*                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ FK references (createdBy, etc.)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PostForge (app-owned, TO BE IMPLEMENTED)                   │
│  posts, categories, tags, post_tags, assets,                │
│  post_revisions, redirects, analytics_events,               │
│  post_daily_stats, blog_settings, blog_audit_logs           │
└─────────────────────────────────────────────────────────────┘
```

### Critical rule

**Do not create a PostForge `users` table.**

Import `users` from `@tgoliveira/secure-auth/drizzle/schema` (already re-exported via `src/db/schema.ts`). PostForge tables reference `users.id` for ownership and audit attribution.

---

## Schema organization (planned)

When implemented, extend `src/db/schema.ts`:

```typescript
// src/db/schema.ts (future)
export * from "@tgoliveira/secure-auth/drizzle/schema";
export * from "./blog-schema"; // PostForge-owned tables
```

Blog migrations go to `drizzle/` (separate from auth migration `0000_*`). Use `drizzle-kit generate` after adding blog schema.

---

## Enums

### `post_status`

```typescript
type PostStatus = "draft" | "scheduled" | "published" | "unpublished" | "archived";
```

| Value | Meaning |
|-------|---------|
| `draft` | Work in progress; admin only |
| `scheduled` | Will auto-publish at `scheduledAt` |
| `published` | Visible on public site |
| `unpublished` | Was published; now hidden |
| `archived` | Preserved but inactive |

### `asset_kind` (recommended)

```typescript
type AssetKind = "image" | "file";
```

MVP uses `image` only. `file` reserved for future attachments.

### `redirect_type` (recommended)

```typescript
type RedirectType = "permanent" | "temporary";
```

Default: `permanent` (301).

---

## Tables

### `posts`

Core blog content. One row = one blog post / post project.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | ✅ | PK, default `gen_random_uuid()` |
| `title` | `text` | ✅ | Display title |
| `slug` | `text` | ✅ | Unique, URL-safe, indexed |
| `excerpt` | `text` | ❌ | Short summary for listings/SEO fallback |
| `contentMarkdown` | `text` | ✅ | Source of truth; default `""` for new drafts |
| `contentHtmlCache` | `text` | ❌ | Sanitized rendered HTML; rebuilt on save/publish |
| `coverAssetId` | `uuid` | ❌ | FK → `assets.id` |
| `status` | `post_status` | ✅ | Default `draft` |
| `featured` | `boolean` | ✅ | Default `false` |
| `pinned` | `boolean` | ✅ | Default `false` |
| `pinnedPriority` | `integer` | ✅ | Default `0`; higher = first on home |
| `categoryId` | `uuid` | ❌ | FK → `categories.id` |
| `publishedAt` | `timestamptz` | ❌ | Set on publish |
| `scheduledAt` | `timestamptz` | ❌ | Required when `status = scheduled` |
| `unpublishedAt` | `timestamptz` | ❌ | Set on unpublish |
| `seoTitle` | `text` | ❌ | Fallback: `title` |
| `seoDescription` | `text` | ❌ | Fallback: `excerpt` |
| `canonicalUrl` | `text` | ❌ | Fallback: `/blog/{slug}` |
| `ogTitle` | `text` | ❌ | Fallback: `seoTitle` or `title` |
| `ogDescription` | `text` | ❌ | Fallback: `seoDescription` or `excerpt` |
| `ogAssetId` | `uuid` | ❌ | FK → `assets.id`; fallback: `coverAssetId` |
| `readingTimeMinutes` | `integer` | ❌ | Computed on save |
| `createdBy` | `uuid` | ✅ | FK → `users.id` |
| `updatedBy` | `uuid` | ✅ | FK → `users.id` |
| `createdAt` | `timestamptz` | ✅ | Default `now()` |
| `updatedAt` | `timestamptz` | ✅ | Default `now()` |

#### Indexes (recommended)

- `unique(slug)`
- `(status, publishedAt desc)` — public listing
- `(status, scheduledAt)` — scheduler query
- `(featured, pinned, pinnedPriority desc, publishedAt desc)` — home page
- GIN full-text on `title`, `excerpt`, `contentMarkdown` — search

#### Constraints

- `scheduled` status requires `scheduledAt IS NOT NULL`
- `published` status requires `publishedAt IS NOT NULL`
- `slug` must match `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` (enforced in service layer + DB check optional)

---

### `categories`

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | ✅ | PK |
| `name` | `text` | ✅ | Display name |
| `slug` | `text` | ✅ | Unique, URL-safe |
| `description` | `text` | ❌ | Optional category description |
| `createdAt` | `timestamptz` | ✅ | |
| `updatedAt` | `timestamptz` | ✅ | |

#### Indexes

- `unique(slug)`
- `unique(name)` (optional — prevent duplicate names)

---

### `tags`

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | ✅ | PK |
| `name` | `text` | ✅ | Display name |
| `slug` | `text` | ✅ | Unique, URL-safe |
| `createdAt` | `timestamptz` | ✅ | |
| `updatedAt` | `timestamptz` | ✅ | |

#### Indexes

- `unique(slug)`
- `unique(name)` (optional)

---

### `post_tags`

Many-to-many join table.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `postId` | `uuid` | ✅ | FK → `posts.id` ON DELETE CASCADE |
| `tagId` | `uuid` | ✅ | FK → `tags.id` ON DELETE CASCADE |

#### Primary key

- `(postId, tagId)`

---

### `assets`

Image and file metadata. Binary stored via `StorageProvider`.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | ✅ | PK |
| `postId` | `uuid` | ✅ | FK → `posts.id` ON DELETE CASCADE |
| `kind` | `asset_kind` | ✅ | Default `image` |
| `filename` | `text` | ✅ | Sanitized original filename |
| `storageKey` | `text` | ✅ | Provider-specific path/key |
| `mimeType` | `text` | ✅ | Validated on upload |
| `sizeBytes` | `integer` | ✅ | |
| `width` | `integer` | ❌ | Pixels, if image |
| `height` | `integer` | ❌ | Pixels, if image |
| `altText` | `text` | ❌ | Accessibility |
| `caption` | `text` | ❌ | Optional caption |
| `publicUrl` | `text` | ✅ | URL served to readers/editor |
| `createdBy` | `uuid` | ✅ | FK → `users.id` |
| `createdAt` | `timestamptz` | ✅ | |

#### Indexes

- `(postId, createdAt desc)` — image library per post

#### Notes

- `publicUrl` may be `/api/assets/{id}` or CDN URL depending on provider
- `storageKey` must never be exposed to clients

---

### `post_revisions`

Snapshot of content at each meaningful save.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | ✅ | PK |
| `postId` | `uuid` | ✅ | FK → `posts.id` ON DELETE CASCADE |
| `title` | `text` | ✅ | Snapshot |
| `contentMarkdown` | `text` | ✅ | Snapshot |
| `excerpt` | `text` | ❌ | Snapshot |
| `revisionNumber` | `integer` | ✅ | Monotonic per post |
| `createdBy` | `uuid` | ✅ | FK → `users.id` |
| `createdAt` | `timestamptz` | ✅ | |

#### Indexes

- `(postId, revisionNumber desc)`

#### Behavior

- Create revision on explicit save and autosave (debounced — e.g. one revision per 5 min max)
- Restore revision → copy snapshot to `posts`, create new revision noting restore

---

### `redirects`

URL continuity for slug changes and GitHub Pages migration.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | ✅ | PK |
| `fromPath` | `text` | ✅ | Unique; e.g. `/old-slug` or `/2024/01/old-post` |
| `toPath` | `text` | ✅ | Target path |
| `type` | `redirect_type` | ✅ | Default `permanent` |
| `postId` | `uuid` | ❌ | FK → `posts.id` ON DELETE SET NULL |
| `createdAt` | `timestamptz` | ✅ | |

#### Indexes

- `unique(fromPath)`

---

### `analytics_events`

Raw view events. Privacy-conscious design.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | ✅ | PK |
| `postId` | `uuid` | ✅ | FK → `posts.id` ON DELETE CASCADE |
| `viewedAt` | `timestamptz` | ✅ | Default `now()` |
| `referrer` | `text` | ❌ | Sanitized Referer header |
| `deviceType` | `text` | ❌ | `mobile` \| `desktop` \| `tablet` \| `unknown` |
| `countryCode` | `text` | ❌ | ISO 3166-1 alpha-2, optional |
| `visitorHash` | `text` | ❌ | Daily salted hash for dedup — **not** raw IP |

#### Indexes

- `(postId, viewedAt desc)`
- `(viewedAt)` — retention cleanup

#### Privacy rules

- Never store raw IP
- `visitorHash` = `hash(salt + ip + date)` if dedup needed; rotate salt daily

---

### `post_daily_stats`

Aggregated daily view counts for admin reports.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `postId` | `uuid` | ✅ | FK → `posts.id` ON DELETE CASCADE |
| `date` | `date` | ✅ | UTC date |
| `viewCount` | `integer` | ✅ | Default 0 |
| `uniqueVisitorCount` | `integer` | ❌ | If dedup implemented |

#### Primary key

- `(postId, date)`

#### Aggregation

- Nightly job or inline increment on view
- Admin dashboard reads from this table for charts

---

### `blog_settings` (recommended)

Site-wide configuration. Single-row or key-value pattern.

**Option A — single row:**

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK (singleton) |
| `siteTitle` | `text` | Blog name |
| `siteDescription` | `text` | Tagline |
| `siteUrl` | `text` | Canonical base URL |
| `defaultOgAssetId` | `uuid` | FK → `assets.id` (nullable) |
| `postsPerPage` | `integer` | Default 12 |
| `rssTitle` | `text` | |
| `rssDescription` | `text` | |
| `githubPagesBaseUrl` | `text` | For migration reference |
| `updatedAt` | `timestamptz` | |

**Option B — key-value** (`key text PK`, `value jsonb`) — more flexible, slightly more complex.

**Recommendation:** Option A for MVP simplicity.

---

### `blog_audit_logs` (optional)

Only if secure-auth `audit_events` cannot cover content actions.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `uuid` | ✅ | PK |
| `actorUserId` | `uuid` | ✅ | FK → `users.id` |
| `action` | `text` | ✅ | e.g. `post.publish`, `post.unpublish`, `asset.upload` |
| `entityType` | `text` | ✅ | e.g. `post`, `asset` |
| `entityId` | `uuid` | ✅ | |
| `metadata` | `jsonb` | ❌ | Action-specific details |
| `createdAt` | `timestamptz` | ✅ | |

#### When to use

- Prefer secure-auth audit for auth-related actions
- Use `blog_audit_logs` for: publish, unpublish, schedule, archive, import, slug change, asset delete

---

## Relationships diagram

```
users (secure-auth)
  │
  ├──< posts.createdBy
  ├──< posts.updatedBy
  ├──< assets.createdBy
  ├──< post_revisions.createdBy
  └──< blog_audit_logs.actorUserId

categories
  └──< posts.categoryId

posts
  ├──< post_tags >── tags
  ├──< assets.postId
  ├──< post_revisions.postId
  ├──< redirects.postId
  ├──< analytics_events.postId
  └──< post_daily_stats.postId

assets
  ├──< posts.coverAssetId
  └──< posts.ogAssetId
```

---

## Query patterns

### Public post listing (always use)

```sql
WHERE status = 'published'
  AND publishedAt IS NOT NULL
  AND publishedAt <= now()
ORDER BY
  pinned DESC,
  pinnedPriority DESC,
  publishedAt DESC
```

### Scheduler query

```sql
WHERE status = 'scheduled'
  AND scheduledAt IS NOT NULL
  AND scheduledAt <= now()
```

### Admin post list (all statuses)

No status filter by default; apply filters from query params.

---

## Migration strategy

1. Create `src/db/blog-schema.ts` with all PostForge tables
2. Update `src/db/schema.ts` to re-export blog schema alongside auth schema
3. Run `npm run db:generate` — produces `drizzle/0001_*.sql` (auth is `0000_*`)
4. Run `npm run db:migrate`
5. Verify in `npm run db:studio` — auth tables unchanged, blog tables added

**Never alter package-owned tables in PostForge migrations.**

---

## Related documents

- [POSTFORGE_TDR.md](./POSTFORGE_TDR.md) — product requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) — module layout
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — Phase 1 tasks
