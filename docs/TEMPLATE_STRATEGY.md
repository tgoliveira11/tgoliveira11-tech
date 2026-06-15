# PostForge template strategy

This document explains how PostForge is meant to be distributed and why.

---

## 1. PostForge is the official template / starter repository

The upstream repository ([github.com/tgoliveira11/postforge](https://github.com/tgoliveira11/postforge)) is the **reference implementation** and **GitHub Template** for creating new blogs.

Each blog owner creates a **new independent repository** from the template — not a long-lived fork of upstream for day-to-day blogging.

---

## 2. One blog = one repository

Each blog is a **final product** with its own:

- Git repository and commit history
- Environment variables and secrets
- PostgreSQL database
- Uploaded images / storage
- Domain and deployment
- Content, categories, tags, and branding

Examples:

| Repository | Purpose |
|------------|---------|
| `tgoliveira11/postforge` | Official upstream / template |
| `you/my-personal-blog` | Your personal blog |
| `you/engineering-notes` | A separate technical blog |
| `you/daily-prayer-blog` | Another independent site |

---

## 3. Template is preferred over fork (for new blogs)

| Template | Fork |
|----------|------|
| Clean starting point with no upstream commit history | Carries upstream history and default remote |
| Clearly signals “this is **my** blog” | Often implies contributing back to upstream |
| No accidental PRs to PostForge | Easy to confuse upstream with your blog |
| Independent versioning and releases | Merge relationship with upstream is manual anyway |

**Use the template when:** you want to run your own blog.

**Use a fork when:**

- You plan to **contribute changes back** to PostForge
- You want to maintain an explicit `upstream` remote and merge selectively
- You are experimenting with PostForge itself, not launching a production blog

---

## 4. NPM packaging is not recommended now

PostForge is a **full application**:

- App Router routes (public + admin + API)
- Drizzle schema and migrations
- Admin UI and public editorial UI
- Storage integration and deployment assumptions
- Blog-specific business logic

Packaging PostForge as `@postforge/app` today would:

- Complicate customization (themes, routes, branding)
- Make upgrades harder before boundaries are stable
- Duplicate what a template repo already solves well

**What *is* an npm package today:** [`@tgoliveira/secure-auth`](https://www.npmjs.com/package/@tgoliveira/secure-auth) — authentication, sessions, 2FA, passkeys, account settings.

---

## 5. Future evolution (not committed)

Possible later steps — **none required for template users today**:

1. **Template / starter stabilization** (current phase)
2. Extract reusable packages, e.g.:
   - `@postforge/core` — domain logic
   - `@postforge/ui` — shared components
   - `@postforge/storage` — storage providers
   - `@postforge/importers` — migration tools
3. Optional hosted / multi-tenant SaaS (much later)

Template users can adopt extracted packages when they exist; until then, treat your blog repo as the full app.

---

## 6. Enable GitHub Template mode (maintainers)

To allow **Use this template** on GitHub:

1. Open the PostForge repository on GitHub.
2. Go to **Settings**.
3. Under **General**, find **Template repository**.
4. Check **Template repository**.
5. Save if prompted.

After enabling, the green **Use this template** button appears on the repo home page.

### Optional: GitHub CLI

If you use the GitHub CLI and have admin access:

```bash
gh api repos/tgoliveira11/postforge -X PATCH -f is_template=true
```

This is optional; the Settings UI is the primary documented path.

---

## 7. What template users should customize first

After creating a repo from the template:

1. `.env.local` — secrets, `ADMIN_EMAIL`, `APP_BASE_URL`
2. `APP_NAME` / blog settings (title, description) via admin or `blog_settings`
3. Public branding (optional CSS, copy, footer attribution)
4. Deployment provider and object storage for production uploads
5. Domain and DNS

Do **not** commit `.env.local` or `storage/uploads/` to Git.
