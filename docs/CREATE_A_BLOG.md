# Create a blog from the PostForge template

Step-by-step guide to go from the GitHub template to a running blog.

---

## Prerequisites

- GitHub account
- Node.js 20+ and npm
- Docker (recommended for local PostgreSQL)
- A code editor

---

## Step 1 — Use the GitHub template

### For blog owners

1. Open [github.com/tgoliveira11/postforge](https://github.com/tgoliveira11/postforge).
2. Click **Use this template** → **Create a new repository**.
3. Choose a name for **your** blog, e.g.:
   - `my-personal-blog`
   - `engineering-notes`
   - `daily-prayer-blog`
4. Create the repository (public or private).

You now own an **independent** repo — not a fork tied to upstream day-to-day work.

### For PostForge maintainers

Enable template mode once on the upstream repo: **Settings → General → Template repository**. See [TEMPLATE_STRATEGY.md](TEMPLATE_STRATEGY.md).

---

## Step 2 — Clone your new repository

```bash
git clone https://github.com/<your-user>/<your-blog-repo>.git
cd <your-blog-repo>
```

---

## Step 3 — Install dependencies

```bash
npm install
```

---

## Step 4 — Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`. At minimum set:

- `DATABASE_URL`
- `APP_BASE_URL=http://localhost:3000`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET` — long random string
- `ADMIN_EMAIL` — the email you will use to register

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for the full list.

---

## Step 5 — Start PostgreSQL

With Docker (matches `docker-compose.yml`):

```bash
docker compose up -d
```

Default connection (also in `.env.example`):

```
postgres://postforge:postforge@localhost:5432/postforge
```

---

## Step 6 — Run migrations

```bash
npm run db:migrate
```

### When to run `db:generate`

| Command | When |
|---------|------|
| `npm run db:migrate` | **Every** fresh setup and after pulling new migrations |
| `npm run db:generate` | Only when **you** change Drizzle schema in code |

A new blog cloned from the template already includes migration SQL files — you usually **do not** need `db:generate` on first setup.

---

## Step 7 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Step 8 — Create your first admin account

1. Confirm `ADMIN_EMAIL` in `.env.local` matches the email you will register with.
2. Open [http://localhost:3000/register](http://localhost:3000/register).
3. Create an account with **that email**.
4. Verify email if your configuration requires it (see `EMAIL_VERIFICATION_*` in `.env.example`).

Only `ADMIN_EMAIL` may access `/admin` and publish posts.

---

## Step 9 — Open the admin

1. Sign in at `/login`.
2. Open [http://localhost:3000/admin](http://localhost:3000/admin).

If you see a forbidden page, the signed-in email does not match `ADMIN_EMAIL`.

---

## Step 10 — Create and publish your first post

Follow [FIRST_POST.md](FIRST_POST.md).

---

## Step 11 — Verify the public site

- Home: `/`
- Blog: `/blog`
- Your post: `/blog/<slug>`
- RSS: `/rss.xml`
- Sitemap: `/sitemap.xml`

---

## Step 12 — Deploy (when ready)

See [DEPLOYMENT.md](DEPLOYMENT.md) and [STORAGE_STRATEGY.md](STORAGE_STRATEGY.md).

---

## Quality checks (optional)

Before deploying or after major changes:

```bash
npm run typecheck
npm test
npm run lint
npm run build
npm run db:generate   # should report no new migrations if schema unchanged
```
