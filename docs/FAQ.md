# FAQ

Common questions about using PostForge as a blog template.

---

## Should I fork or use the template?

**Use the template** to create your own blog.

**Fork** only if you plan to contribute to PostForge upstream or maintain an explicit merge relationship with the official repo.

See [TEMPLATE_STRATEGY.md](TEMPLATE_STRATEGY.md).

---

## Can I deploy for free?

Yes, with limits:

- **Vercel Hobby** — free tier for Next.js
- **Neon / Supabase** — free PostgreSQL tiers
- **Object storage** — may have free tiers (R2, Supabase Storage)

You still need a custom domain (optional, paid) and must handle storage correctly on serverless. See [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Can I use Vercel?

Yes. PostForge is a standard Next.js App Router app.

Use managed PostgreSQL and plan for **object storage** — not local disk uploads. See [STORAGE_STRATEGY.md](STORAGE_STRATEGY.md).

---

## Where are images stored?

By default, on disk at `UPLOAD_LOCAL_DIR` (usually `./storage/uploads`), served via `/api/assets/...`.

In production on serverless, use object storage or a VPS with persistent disk.

---

## How do I create an admin user?

1. Set `ADMIN_EMAIL` in `.env.local`.
2. Register at `/register` with that email.
3. Sign in and open `/admin`.

Only that email can publish. See [CREATE_A_BLOG.md](CREATE_A_BLOG.md).

---

## Can multiple users write posts?

**MVP:** one publishing admin (`ADMIN_EMAIL`). Other users may register and sign in but get **403** on `/admin`.

Multi-author RBAC is on the roadmap — not in MVP.

---

## Can I customize the public design?

Yes. Your blog repo is yours. Public UI lives under:

- `src/app/(public)/`
- `src/components/public/`
- `src/app/globals.css`

See [UI_UX_SKILL.md](UI_UX_SKILL.md) for public editorial patterns.

---

## Can I remove “Powered by PostForge”?

Yes. The attribution is in `src/components/public/site-footer.tsx` in **your** repo. MIT license allows modification.

---

## How do I update `@tgoliveira/secure-auth`?

```bash
npm update @tgoliveira/secure-auth
npm run db:migrate
npm test && npm run build
```

Auth is versioned separately from your blog template merges.

---

## How do I update PostForge itself?

Your template copy does not auto-update. Merge from upstream or cherry-pick changes.

See [UPGRADING_FROM_POSTFORGE.md](UPGRADING_FROM_POSTFORGE.md).

---

## Is PostForge an npm package?

**No.** PostForge is a full application distributed as a GitHub template.

`@tgoliveira/secure-auth` is the reusable npm package for auth.

---

## What license is PostForge?

MIT — see [LICENSE](../LICENSE). You can use it for personal or commercial blogs.

---

## How do I import posts from GitHub Pages / Jekyll?

```bash
npm run import:github-pages -- --help
```

See [GITHUB_PAGES_MIGRATION.md](GITHUB_PAGES_MIGRATION.md).

---

## Why does `db:generate` say “nothing to migrate”?

That is normal when the schema has not changed. Use `db:migrate` to **apply** existing migrations.

Run `db:generate` only after **you** edit Drizzle schema files.

---

## More help

- [CREATE_A_BLOG.md](CREATE_A_BLOG.md) — setup
- [FIRST_POST.md](FIRST_POST.md) — publishing
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) — configuration
- [ARCHITECTURE.md](ARCHITECTURE.md) — technical overview
