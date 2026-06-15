# PostForge

A **Markdown-based blog publishing platform** built with Next.js, TypeScript, PostgreSQL, Drizzle ORM, and [`@tgoliveira/secure-auth`](https://www.npmjs.com/package/@tgoliveira/secure-auth) for authentication and account management.

PostForge is a **complete deployable application** — not an npm library. It is intended to be used as a **[GitHub Template Repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)**: each blog owner creates their **own independent repository** from the template, with their own database, content, domain, and deployment.

**Official template:** [github.com/tgoliveira11/postforge](https://github.com/tgoliveira11/postforge)

Licensed under the [MIT License](LICENSE).

---

## Features

- **Markdown publishing** — write in Markdown with preview, excerpts, slugs, and reading time
- **Editorial public site** — home, blog index, post detail, search, tags, categories, RSS, sitemap
- **Admin workspace** — writing-first post editor, assets, taxonomy, SEO, scheduling, featured/pinned posts
- **Images & assets** — cover/OG images, upload, insert into Markdown
- **Analytics** — lightweight post view tracking
- **Import** — GitHub Pages / Jekyll migration CLI
- **Auth** — registration, login, 2FA, passkeys, sessions via `@tgoliveira/secure-auth`
- **Single admin (MVP)** — one `ADMIN_EMAIL` controls publishing; other users can exist but cannot access `/admin`

---

## How PostForge is intended to be used

| Approach | When to use |
|----------|-------------|
| **GitHub Template** (recommended) | You want your **own blog** — independent repo, database, and deployment |
| **Fork** | You want to **contribute to PostForge upstream** or maintain a manual upstream relationship |
| **npm package** | **Not supported today** — PostForge is an app, not a library (see [docs/TEMPLATE_STRATEGY.md](docs/TEMPLATE_STRATEGY.md)) |

Example independent blogs created from the template:

- `my-personal-blog`
- `engineering-notes`
- `daily-prayer-blog`

Each is a separate Git repository — not a branch of PostForge.

---

## Create your blog from the template

1. On GitHub, open [tgoliveira11/postforge](https://github.com/tgoliveira11/postforge) and click **Use this template** → **Create a new repository**.
2. Clone your new repo, install dependencies, configure `.env.local`, run migrations, and start the dev server.

**Full walkthrough:** [docs/CREATE_A_BLOG.md](docs/CREATE_A_BLOG.md)

> **Maintainers:** enable template mode under **Settings → General → Template repository** on the upstream PostForge repo. See [docs/TEMPLATE_STRATEGY.md](docs/TEMPLATE_STRATEGY.md).

---

## Local development

**Prerequisites:** Node.js 20+, npm, Docker (for local PostgreSQL)

```bash
git clone https://github.com/<you>/<your-blog-repo>.git
cd <your-blog-repo>
npm install
cp .env.example .env.local
# Edit .env.local — set ADMIN_EMAIL and secrets
docker compose up -d
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Copy `.env.example` to `.env.local` and set at minimum:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `APP_BASE_URL` | Public site URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Auth session secret (long random string) |
| `ADMIN_EMAIL` | Email allowed to access `/admin` |

**Full reference:** [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)

---

## Database setup

```bash
docker compose up -d          # PostgreSQL on localhost:5432
npm run db:migrate          # Apply migrations
npm run db:studio           # Optional: Drizzle Studio UI
```

- Run `npm run db:generate` only when **you change the schema** in code — not on every fresh clone (migrations are already in the repo).
- Auth tables come from `@tgoliveira/secure-auth` and are included in migrations.

---

## First admin account

1. Set `ADMIN_EMAIL` in `.env.local` to the email you will register with.
2. Open `/register` and create an account with **that same email**.
3. Sign in and open `/admin`.

Only the configured `ADMIN_EMAIL` may publish posts.

---

## First post

1. In `/admin`, create a new post.
2. Add title, slug, excerpt, and Markdown content.
3. Upload images, set cover/OG if needed, add category and tags.
4. Save, then publish.
5. View the public post at `/blog/<slug>`.

**Step-by-step guide:** [docs/FIRST_POST.md](docs/FIRST_POST.md)

---

## Deployment

Recommended low-cost stack:

- **App:** Vercel Hobby (or any Node host)
- **Database:** Neon Free or Supabase Free (PostgreSQL)
- **Storage:** object storage for production (R2, S3, etc.) — **do not rely on local disk on serverless**

**Deployment guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)  
**Storage guide:** [docs/STORAGE_STRATEGY.md](docs/STORAGE_STRATEGY.md)

---

## Upgrading

Blogs created from the template **do not auto-update** when PostForge upstream changes. You can merge upstream manually or cherry-pick changes.

**Upgrade guide:** [docs/UPGRADING_FROM_POSTFORGE.md](docs/UPGRADING_FROM_POSTFORGE.md)

---

## Documentation

| Doc | Description |
|-----|-------------|
| [CREATE_A_BLOG.md](docs/CREATE_A_BLOG.md) | Step-by-step: template → running blog |
| [TEMPLATE_STRATEGY.md](docs/TEMPLATE_STRATEGY.md) | Why template vs fork vs npm |
| [ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) | All env vars explained |
| [FIRST_POST.md](docs/FIRST_POST.md) | Create and publish your first article |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment checklist |
| [STORAGE_STRATEGY.md](docs/STORAGE_STRATEGY.md) | Local vs object storage |
| [UPGRADING_FROM_POSTFORGE.md](docs/UPGRADING_FROM_POSTFORGE.md) | Receive upstream updates |
| [FAQ.md](docs/FAQ.md) | Common questions |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture |
| [ROADMAP.md](docs/ROADMAP.md) | Milestones and future work |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest unit tests |
| `npm run db:generate` | Generate Drizzle migrations (schema changes only) |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Drizzle Studio |
| `npm run import:github-pages` | Import from GitHub Pages / Jekyll |
| `npm run audit` | `npm audit` security check |

---

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Thiago Oliveira.

Public sites built with PostForge may show a subtle **“Powered by PostForge”** footer attribution linking to the [official repository](https://github.com/tgoliveira11/postforge). You may customize or remove it in your own blog repo if you prefer.
