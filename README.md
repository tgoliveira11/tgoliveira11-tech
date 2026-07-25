# Thiago Goulart de Oliveira — Professional Website

This repository powers Thiago Goulart de Oliveira's professional website and technical publication platform. The site presents selected work and writing on enterprise AI, agentic systems, cloud and solution architecture, product engineering, engineering leadership, and technology strategy.

[Live website](https://www.tgoliveira11.tech/) · [LinkedIn](https://www.linkedin.com/in/tgoliveira) · [GitHub](https://github.com/tgoliveira11) · [Résumé](https://www.tgoliveira11.tech/files/thiago-goulart-de-oliveira-resume.pdf)

## Purpose

The site has three primary objectives:

1. Present Thiago's current professional positioning as an Engineering Director.
2. Publish practical, evidence-based technical and leadership content.
3. Provide hiring managers, recruiters, engineers, and technology leaders with a clear view of his experience, thinking, and selected work.

The website is not intended to be a generic personal blog or a complete replacement for LinkedIn or the résumé. It is a curated professional surface built around current positioning, selected writing, and durable public discovery.

## Professional focus

### Enterprise AI Platforms

Production AI systems, conversational interfaces, agentic workflows, LLM orchestration, Text-to-SQL, governed enterprise data, evaluation, observability, reliability, and responsible AI adoption.

### Software & Solution Architecture

Distributed systems, cloud-native platforms, APIs, integration, security, data architecture, scalability, resilience, and architectural decision-making.

### Engineering Leadership

Engineering strategy, team development, coaching, technical standards, cross-functional alignment, delivery systems, and organizational effectiveness.

### Product & Technology Strategy

Product engineering, platform evolution, commercialization, business and technology alignment, organizational scaling, and pragmatic investment decisions.

## Editorial structure

The site uses five canonical editorial categories:

1. AI Engineering
2. Software & Solution Architecture
3. Engineering Leadership
4. Technology Strategy
5. Career & Reflections

### AI Engineering

Production AI systems, agentic workflows, enterprise data, evaluation, governance, observability, and reliability.

### Software & Solution Architecture

Software design, distributed systems, cloud architecture, APIs, integration, security, and architectural decisions.

### Engineering Leadership

Teams, management, technical standards, delivery, coaching, and organizational effectiveness.

### Technology Strategy

Product engineering, platform strategy, commercialization, and business-technology alignment.

### Career & Reflections

Career development, professional reinvention, learning, culture, and personal reflections.

Every article should have one primary category. Categories express the main editorial domain; tags provide narrower technical context. Categories and tags must not be treated as interchangeable.

## Featured content

These strategic articles are published on the public site:

1. [What Breaks First When Text-to-SQL Moves from Demo to Production?](https://www.tgoliveira11.tech/blog/2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production)
2. [Software vs. Solution vs. System Architecture: Scope, Decisions and Accountability](https://www.tgoliveira11.tech/blog/2023-06-16-software-solution-system-architecture)
3. [From Concept to Commercialization: Building and Scaling a B2B Mobility Platform](https://www.tgoliveira11.tech/blog/2026-07-24-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform)
4. [From Software Engineer to Engineering Director: 24 Years of Reinvention](https://www.tgoliveira11.tech/blog/2024-10-08-a-letter-to-my-past-self)
5. [Securing Enterprise APIs in Production: Identity, Authorization, Abuse Prevention and Observability](https://www.tgoliveira11.tech/blog/2023-06-04-api-security)
6. [Choosing a Distributed Cache: Consistency, Availability, Cost and Operational Trade-offs](https://www.tgoliveira11.tech/blog/2022-09-16-in-memory-cache)
7. [Evaluating Enterprise AI Systems: From Model Accuracy to Operational Trust](https://www.tgoliveira11.tech/blog/2026-07-24-evaluating-enterprise-ai-operational-trust)
8. [Observability for Agentic Systems: Tracing Decisions, Tools, Data and Failure](https://www.tgoliveira11.tech/blog/2026-07-24-observability-agentic-systems)

## Technology stack

| Area | Implementation |
|---|---|
| Application framework | Next.js 16.2.11 App Router with React 19.2.4 |
| Language | TypeScript 5.9.3 |
| Package manager | npm with `package-lock.json`; CI installs with `npm ci` |
| Content model | PostgreSQL with Drizzle ORM; DB-backed posts, revisions, categories, tags, assets, redirects, analytics, and blog settings |
| Styling | Tailwind CSS 4.3.3 via `@tailwindcss/postcss`, global design tokens in `src/app/globals.css`, plus secure-auth and Outpost package styles |
| Authentication | `@tgoliveira/secure-auth` 0.5.0, NextAuth integration, app-specific cookies, 2FA/passkey-capable account surfaces, and admin authorization |
| Analytics | Google Analytics 4 measurement `G-XJ5W80DYKL` on public routes plus DB-backed post-view analytics |
| SEO | Next metadata, canonical URLs, Open Graph/Twitter metadata, BlogPosting/Website/Person/Breadcrumb JSON-LD, dynamic sitemap, robots, RSS, and AI-readable `llms.txt` endpoints |
| Deployment | Documented Vercel deployment with managed PostgreSQL, Neon production notes, Vercel Blob support, and manual database migrations |
| CI | GitHub Actions for validation, branch naming, CodeQL, dependency review, Gitleaks, Semgrep, OWASP ZAP baseline, releases, and upstream sync |

## Architecture

The application is a site-specific fork of PostForge. PostForge remains the upstream template source; this repository carries Thiago's public positioning, editorial taxonomy, assets, analytics, and production content behavior.

Public pages live under `src/app/(public)` and include home, blog listing, article detail, categories, tags, search, About, RSS, sitemap, robots, and AI discovery routes. Admin and account surfaces live under `src/app/admin`, `src/app/settings`, and the secure-auth route groups.

Publishing is database-backed. Markdown content, post lifecycle state, SEO fields, category assignment, tags, cover/OG asset references, revisions, and public ordering are stored in PostgreSQL through Drizzle schemas under `src/modules`.

Images use two paths:

- static public assets under `public/images` and `public/files`;
- uploaded post assets with database metadata and either local filesystem storage or Vercel Blob, selected through `UPLOAD_PROVIDER`.

Public rendering uses Next `Image` for profile and post images. The Next config allows Vercel Blob hostnames and adds cache/security headers for public metadata, article pages, discovery endpoints, and the résumé PDF.

## Repository structure

```text
.
|-- src/app                 Next.js App Router routes for public pages, admin, auth, APIs, sitemap, robots, RSS, and AI discovery.
|-- src/components          Public, admin, theme, analytics, and shared React components.
|-- src/db                  Drizzle schema exports and database wiring.
|-- src/lib                 Cross-cutting utilities for auth, environment parsing, email, security, pagination, uploads, and legacy redirects.
|-- src/modules             Feature modules for posts, taxonomy, assets, analytics, public rendering, import, redirects, settings, and admin authorization.
|-- drizzle                 Committed Drizzle migrations and migration metadata.
|-- public                  Static assets, brand icons, About imagery, cover images, and the public résumé PDF.
|-- scripts                 Content validation, migrations, import, upstream sync, inspection, and icon generation scripts.
|-- docs                    Maintainer documentation for environment, deployment, releases, product surface, and upstream sync.
|-- .github/workflows       CI, security, release, branch-name, ZAP, and upstream synchronization workflows.
|-- docker-compose.yml      Local PostgreSQL service on host port 5434.
```

## Local development

Prerequisites: Node.js 20+, npm, and Docker when using the local PostgreSQL service.

```bash
git clone https://github.com/tgoliveira11/tgoliveira11-tech.git
cd tgoliveira11-tech
npm ci
cp .env.example .env.local
docker compose up -d
npm run db:migrate
npm run dev
```

The development server runs on [http://localhost:3011](http://localhost:3011).

| Task | Command |
|---|---|
| Install dependencies | `npm ci` |
| Start development server | `npm run dev` |
| Produce a production build | `npm run build` |
| Serve a production build | `npm run start` |
| Formatting | No dedicated formatting script is configured |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Run tests | `npm run test` |
| Run tests with coverage | `npm run test:coverage` |
| Validate content and internal canonical links | `npm run content:validate` |
| Full local validation | `npm run validate` |
| Apply database migrations | `npm run db:migrate` |
| Open Drizzle Studio | `npm run db:studio` |
| Generate Drizzle migrations after schema changes | `npm run db:generate` |
| Audit dependencies | `npm run audit`, `npm run audit:prod`, `npm run audit:security`, or `npm run audit:ci` |

There is no separate link-check or route-check script. The content validator checks published content, canonical internal links, taxonomy, cover assets, duplicate canonical URLs, article H1 usage, and selected SEO/content invariants when `DATABASE_URL` is configured.

## Environment configuration

Use `.env.example` as the local template and `docs/ENVIRONMENT_VARIABLES.md` as the detailed reference. Do not commit `.env.local` or production secrets.

Important environment groups include:

- application identity and base URLs: `APP_BASE_URL`, `APP_NAME`, `APP_SLUG`, `NEXTAUTH_URL`;
- database: `DATABASE_URL`, `DATABASE_POOL_MAX`;
- authentication and admin: `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, cookie isolation, session, password, WebAuthn, 2FA, OAuth, rate-limit, and account-policy variables;
- email and transactional outbox: console or Resend provider settings plus Outpost HMAC/webhook configuration;
- uploads: local filesystem or Vercel Blob through `UPLOAD_PROVIDER`;
- public behavior: pagination, recent posts, category limits, forced theme, RSS and analytics settings through blog settings;
- operations: `CRON_SECRET`, audit/security-related flags, and deployment-specific HTTPS cookie settings.

The public résumé path is `/files/thiago-goulart-de-oliveira-resume.pdf`, backed by `public/files/thiago-goulart-de-oliveira-resume.pdf`.

## Validation and CI

For code changes, run:

```bash
npm run validate
```

That command runs type checking, ESLint, test coverage, content validation, and a production build.

GitHub Actions currently include:

- `CI`: `npm ci`, typecheck, lint, tests, build, and high-severity production audit;
- `Branch name`: PR branch prefix enforcement;
- `CodeQL`, `Dependency Review`, `Gitleaks`, `Semgrep CE`, and `OWASP ZAP Baseline`;
- `Release`: manual release workflow;
- `Sync upstream PostForge`: weekly/manual upstream sync PR workflow.

Docs-only changes may skip the full validation run when they do not affect application behavior. For README-only edits, at minimum check the Markdown diff and whitespace with `git diff --check`.

## Maintenance practices

This repository follows a conservative branch/PR/release model documented in `docs/contributing.md`, `docs/releasing.md`, and `docs/repo-settings.md`.

Key maintenance rules:

- branch before substantive work;
- do not commit, push, open PRs, merge, tag, release, or deploy unless explicitly requested;
- keep `CHANGELOG.md` and `docs/CURRENT_PRODUCT_SURFACE.md` updated when behavior, routes, endpoints, jobs, integrations, or shipped status changes;
- preserve local customizations when merging upstream PostForge changes;
- run validation before claiming code work is complete.

The upstream remote is `https://github.com/tgoliveira11/postforge.git` and is configured as fetch-only. Use the upstream sync scripts and workflow to review PostForge changes without pushing this site's customizations back to the template.

## Deployment

The documented production path is Vercel for the Next.js app, managed PostgreSQL for content and auth data, and Vercel Blob for durable uploaded assets on Vercel. The current product surface documents the canonical deployed domain as `www.tgoliveira11.tech` with Vercel and Neon.

Database migrations are manual. Run `npm run db:migrate` against the intended database after reviewing migration contents and before relying on changed schemas in production.

Deployments should be treated separately from releases. Releases are manual and tied to the `VERSION` file, git tags, and GitHub Releases.

## Long-term content strategy

The site should remain a curated professional publication, not a catch-all blog. New content should strengthen one or more of the approved focus areas:

- production AI systems, enterprise AI platforms, and agentic workflows;
- software and solution architecture for distributed, cloud-native, secure systems;
- engineering leadership, team development, standards, delivery, and organizational effectiveness;
- product engineering, commercialization, platform evolution, and technology strategy;
- career development and reflections when they support the professional narrative.

Each article should keep a single primary category, focused tags, a useful excerpt or SEO description, canonical metadata, cover/OG imagery when appropriate, and internal links that point to canonical routes. Public discovery surfaces such as sitemap, RSS, `robots.txt`, `llms.txt`, and `llms-full.txt` should remain accurate so search engines and AI assistants can understand the site.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Thiago Oliveira.
