# First post guide

How to create, publish, and verify your first article after setup.

---

## 1. Sign in as admin

1. Ensure `ADMIN_EMAIL` in `.env.local` matches your account email.
2. Open `/login` and sign in.
3. Open `/admin`.

---

## 2. Create a new post

1. In the admin dashboard, click **New post** (or go to `/admin/posts/new`).
2. You start in **draft** status.

---

## 3. Fill in the writing fields

### Title

The headline shown on the public site, in cards, RSS, and SEO.

Example: `My First Post`

### Slug

The URL segment for the post.

- Auto-derived from the title; you can edit it.
- Use lowercase, hyphens, no spaces.
- **Slug = URL path** under `/blog/`.

| Title | Slug | Public URL |
|-------|------|------------|
| My First Post | `my-first-post` | `/blog/my-first-post` |

### Excerpt

A short summary used in:

- Home and blog cards
- Search results
- SEO meta description (when no custom SEO description)
- RSS feed

Keep it concise (1–3 sentences).

### Markdown content

Write the article body in the Markdown editor.

- Use **Write**, **Preview**, or **Split** tabs.
- Insert images from the **Assets** panel in the sidebar.

---

## 4. Upload an image (optional)

1. Open the post’s **Assets** panel or `/admin/posts/[id]/assets`.
2. Upload an image (JPEG, PNG, WebP, GIF — see accept list in UI).
3. Use **Insert into Markdown** to add the image to your content.

---

## 5. Set cover and OG images (optional)

In the sidebar **Assets** panel:

- **Cover** — hero image on the public post and cards
- **OG image** — social sharing preview (falls back to cover when unset)

Cover/OG are saved via asset actions — not the main save form.

---

## 6. Add category and tags

In the **Taxonomy** sidebar card:

- **Category** — one broad topic (e.g. `Engineering`)
- **Tags** — specific labels (e.g. `nextjs`, `postgres`)

Type to search existing items or press Enter to create new ones.

---

## 7. Preview

Click **Preview** in the sticky editor header to open `/admin/posts/[id]/preview`.

Preview requires an admin session.

---

## 8. Save

Click **Save draft** (or **Save changes** if already published).

Validation errors appear at the top of the editor.

---

## 9. Publish

Click **Save and publish** in the editor header.

This **saves first**, then publishes the **same post** — you will not get duplicate posts.

Alternatively, publish from the posts list after saving.

---

## 10. View the public post

Open:

```
/blog/<your-slug>
```

Also check:

- `/` — may appear in featured/recent if configured
- `/blog` — full listing
- `/rss.xml` — feed entry

---

## 11. Check analytics (optional)

If analytics is enabled (default in `blog_settings`):

1. Visit the public post in a browser.
2. Open `/admin/posts/[id]/analytics` for view counts.

Views are rate-limited and only tracked for **published** posts.

---

## Optional: SEO, schedule, promotion

- **SEO** — collapsed sidebar section for custom title/description/canonical
- **Schedule** — set future publish datetime (requires cron in production)
- **Promotion** — mark as featured or pinned for home page ordering

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| 403 on `/admin` | Signed-in email must match `ADMIN_EMAIL` |
| Post not on public site | Status must be **published** |
| Images broken | `UPLOAD_PUBLIC_BASE_URL`, storage path, and deployment storage strategy |
| Duplicate posts after publish | Use editor **Save and publish** (fixed upstream behavior) |

---

## Next steps

- [DEPLOYMENT.md](DEPLOYMENT.md) — go live
- [GITHUB_PAGES_MIGRATION.md](GITHUB_PAGES_MIGRATION.md) — import existing content
- [UPGRADING_FROM_POSTFORGE.md](UPGRADING_FROM_POSTFORGE.md) — receive template updates
