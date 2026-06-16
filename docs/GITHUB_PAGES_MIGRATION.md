# GitHub Pages Migration Guide

This guide explains how to import a legacy GitHub Pages / Jekyll Markdown blog into PostForge using the M6 CLI importer.

## Expected source folder shape

```
legacy-blog/
├── _posts/
│   ├── 2024-01-15-hello-world.md
│   └── 2024-02-01-release-notes.md
├── assets/
│   └── images/
│       └── cover.png
└── about.md
```

Markdown files may live anywhere under `--source`. Optional images can be referenced relative to the Markdown file or via `--assets`.

## Supported frontmatter fields

| Field | Usage |
|-------|-------|
| `title` | Post title |
| `description`, `excerpt` | Excerpt / SEO description |
| `date` | Original publish date (stored when explicitly publishing) |
| `published`, `draft` | Source status hint (does not auto-publish by default) |
| `tags` | String or array; comma-separated strings supported |
| `categories`, `category` | First category is assigned in M6 |
| `slug` | Preferred slug |
| `permalink` | Legacy URL path; also used for slug + redirect planning |
| `image`, `cover`, `coverImage` | Local cover image reference |
| `layout`, `author`, `ogImage` | Ignored or reported as unsupported/warning |

Unsupported fields are listed in the import report.

## CLI usage

Dry run (recommended first):

```bash
npm run import:github-pages -- --source ./legacy-blog --mode dry-run
```

Import (creates draft posts by default):

```bash
npm run import:github-pages -- --source ./legacy-blog --mode import --assets ./legacy-blog/assets
```

Useful flags:

| Flag | Default | Notes |
|------|---------|-------|
| `--default-status` | `draft` | Imported PostForge status |
| `--publish-imported` | `false` | Keep `false` unless you explicitly want auto-publish |
| `--preserve-urls` | `true` | Create 301 redirects from legacy paths |
| `--base-old-path` | `/` | Strip old site prefix before redirect mapping |
| `--base-new-path` | `/blog` | Canonical prefix (`/blog/[slug]`) |
| `--author-email` | `ADMIN_EMAIL` | User that owns created posts/assets |
| `--report-dir` | `./.import-reports` | JSON report output |

Requires `DATABASE_URL` and an existing admin user email (`ADMIN_EMAIL` or `--author-email`).

## Dry-run behavior

- Parses all Markdown files
- Validates metadata and slugs
- Detects slug conflicts against existing PostForge posts
- Plans redirects without writing them
- Detects local/remote images and missing files
- Writes a JSON report
- Does **not** create posts, assets, or redirects

## Import behavior

- Creates **draft** posts by default
- Uses existing domain services (`createDraft`, `updateDraft`, optional `publishPost`)
- Creates tags/categories when missing
- Copies local images into PostForge storage and rewrites Markdown URLs
- Preserves remote `https://` images unchanged
- Creates 301 redirects when legacy paths differ from `/blog/[slug]`
- Writes a JSON report to `.import-reports/`

## Image migration

| Reference | Behavior |
|-----------|----------|
| `https://...` | Preserved as-is |
| `./images/a.png` | Copied to post assets if found under source/assets roots |
| Missing local file | Original Markdown kept; warning in report |
| `../` traversal | Rejected |

Cover/frontmatter images are copied when local and assigned to `coverAssetId` / `ogAssetId`.

## Redirect behavior

Legacy paths are derived from:

1. `permalink` frontmatter
2. Relative file path
3. Jekyll-style `_posts/YYYY-MM-DD-slug.md` patterns
4. Date-based `/YYYY/MM/DD/slug` paths

When a legacy path differs from the new canonical `/blog/[slug]`, a 301 redirect is created unless one already exists.

Legacy paths are served by the public catch-all route `/(public)/[...legacyPath]`, which looks up `redirects.sourcePath` and issues a permanent redirect.

## Safety defaults

- Imported posts default to **draft**
- `--publish-imported false` by default
- Source frontmatter `published: true` does **not** publish unless `--publish-imported true`
- Existing slugs are **skipped** (never overwritten)
- Path traversal outside configured roots is rejected
- Raw IP / analytics are not touched

## Limitations (M6)

- No ZIP upload UI (CLI recommended; `/admin/import` provides guidance)
- No `--update-existing` mode
- Only first category is assigned when multiple categories exist
- Separate `ogImage` frontmatter is reported as warning only
- No automatic remote cover download
- Raw `analytics_events` are not created during import

## Recommended manual validation after import

1. Open `/admin/posts` and confirm imported posts are drafts.
2. Open each draft and verify Markdown rendering and images.
3. Publish one post and confirm `/blog/[slug]`.
4. Visit a legacy URL and confirm redirect to the new path.
5. Review `.import-reports/*.json` for warnings and missing images.

## Admin page

Visit `/admin/import` for:

- **Import from URL** — paste a single post URL (GitHub Pages/Jekyll HTML) to create a draft
- **GitHub Pages folder import** — CLI examples and recent report filenames

## Single post URL import

Use **Admin → Import → Import from URL** to paste one HTML post URL (for example a legacy GitHub Pages article).

**Important:** Only import posts you own or have permission to reuse.

### What is imported

| Field | Source priority |
|-------|-----------------|
| Title | Article `h1` → `og:title` → `twitter:title` → document title |
| Excerpt / subtitle | `h2` after `h1` → meta description → `og:description` → first paragraph |
| Slug | Last URL path segment (date prefixes preserved, e.g. `2023-06-16-my-post`) |
| Content | Article HTML converted to Markdown |
| Main image | `og:image` → `twitter:image` → first article image → uploaded as PostForge asset |
| Status | Always **draft** |

### Image behavior

- The **main image** is downloaded and uploaded through the current storage provider (local or Vercel Blob).
- It is set as **cover** and **OG** image with alt/caption = post title.
- If the same image appears in content, its Markdown URL is rewritten to the PostForge asset URL.
- **Other inline images** remain remote URLs in MVP.

### Redirect option

Optional checkbox: **Create redirect from source path to new post**

- Default: off
- Only created when the source URL hostname matches `APP_BASE_URL` / `NEXTAUTH_URL`
- Maps source pathname → `/blog/{slug}` with 301

### Limitations

- Not all themes expose subtitles consistently (`h2` after `h1` works best).
- Not every page has a clear `<article>` container.
- Only the **main image** is imported as a PostForge asset by default.
- Remote inline images may remain remote.
- JavaScript-rendered content may not import well (server fetches static HTML only).
- Do not create redirects for arbitrary external domains unless this site serves those old paths.
- SSRF protections block localhost, private IPs, and non-http(s) URLs.
