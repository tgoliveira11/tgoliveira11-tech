# Changelog

All notable changes to **tgoliveira11-tech** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Canonical editorial taxonomy for AI Engineering, Software & Solution Architecture, Engineering Leadership, Technology Strategy, and Career & Reflections.
- DB-backed content validation and dry-run taxonomy migration scripts.
- Default branded Open Graph image route for social previews.
- Google Analytics 4 measurement on public pages with SPA page views, site-search events, and Web Vitals forwarding.
- AI-readable public content maps at `/llms.txt` and `/llms-full.txt`.
- Conversion-oriented public analytics events for hero CTAs, Featured Insights, About visits, article entry, related articles, résumé/GitHub/email/LinkedIn CTAs, and article scroll/completion.
- Dry-run approved-content migrator for the site rework manuscripts (`npm run content:apply-site-rework`).
- Reference plan for the future `production-text-to-sql-reference` GitHub project.
- Static public cover images for the distributed cache, enterprise AI evaluation, and agentic observability articles.

### Changed

- Reposition public site identity around Thiago Goulart de Oliveira, AI platforms, cloud/solution architecture, and engineering leadership.
- Rework homepage, navigation, article metadata, RSS, sitemap taxonomy output, author CTA, and related-article logic around the new editorial IA.
- Expand the About page around engineering leadership, enterprise AI platforms, architecture, product/business context, leadership principles, selected work, and technical experience.
- Normalize public tag display/archive behavior to lowercase kebab-case with migration documentation.
- Define `https://www.tgoliveira11.tech` as the canonical default origin and redirect the apex hostname to `www`.
- Apply short no-store caching to public HTML routes and short shared caching to public metadata endpoints.
- Reorder footer links around LinkedIn, GitHub, résumé, email, and RSS, and remove the obsolete SK footer link.
- Use the approved square profile photo on About surfaces and apply circular presentation in CSS.
- Preserve RSS and AI-readable alternate links, canonical metadata, and advanced Googlebot indexing directives across public pages.
- Complete article metadata with canonical URLs, author profile links, Open Graph Article tags, fallback social images, Twitter cards, and BlogPosting JSON-LD.
- Sync PostForge upstream (`7359a65`): secure-auth v0.2/v0.3 env mappings (magic link, captcha, GitHub OAuth, invites, profile, HIBP), additional test coverage from template.
- Audit PostForge upstream `0.1.2` (`af7ebc1`) and document the selective sync strategy for preserving local SEO, analytics, AI discovery, auth, branding, and production content customizations.

### Fixed

- Preserve static priority article aliases and legacy taxonomy URLs through canonical redirects or alias-aware archive resolution.
- Keep the public header navigation stable by replacing the cramped inline search form with a normal Search nav link and horizontal overflow handling.
- Clean production content validation issues by demoting legacy body H1 headings, restoring slug-aligned publication dates, canonicalizing the B2B mobility slug to 2026-07-24, and filling missing cover metadata.
- Assign production cover and Open Graph asset metadata for the distributed cache, enterprise AI evaluation, and agentic observability articles.
- Ignore generated coverage reports in ESLint flat config so validation stays warning-free.

### Security

- Upgrade Next.js, `eslint-config-next`, `next-auth`, `js-yaml`, `@tailwindcss/postcss`, `postcss`, and `sharp` resolution to clear high+ `npm audit` findings in CI.
- Scope the CI high+ npm audit gate to production dependencies while keeping full-tree dev-tool audit findings documented for manual review.

## [0.1.2] - 2026-07-02

### Changed

- Upgrade `@tgoliveira/secure-auth` to `0.5.0` with production security hardening: `server.environment`, Postgres rate limiting in production, and `security.trustForwardedHeaders` for Vercel/CDN deployments.
- OAuth 2FA completion flow: `/login/2fa/complete` page and `POST /api/auth/login/oauth-2fa-complete`.
- `/login/2fa` server page passes `initialUsernameEmail` for password-manager compatibility during 2FA.


## [0.1.1] - 2026-06-30

### Added

- Branch/PR/release workflow documentation, CI branch-name check, and manual GitHub Release pipeline.
- `@tgoliveira/secure-auth` 0.4.1 admin panel UI at `/admin/core/*` with role-based access (`ADMIN_EMAIL` or `users.role = admin`).
- `@tgoliveira/outpost` 1.2.0 operator admin at `/admin/outpost/*` (email queue, config, observability).

### Fixed

- Outpost admin API routes return JSON errors when Outpost env is missing or admin access is denied (instead of empty 500 responses).


## [0.1.0] - 2026-06-15

### Added

- Independent PostForge-based blog (`tgoliveira11-tech`) with Markdown publishing, admin workspace, and `@tgoliveira/secure-auth`.
- Public site: home, blog, tags, categories, search, RSS, sitemap, about.
- Legacy GitHub Pages URL redirects (`YYYY-MM-DD-slug` → `/blog/[slug]`) via `src/proxy.ts`.
- Local dev on port `3011`; Docker Postgres on host port `5434`.
- Upstream sync from [tgoliveira11/postforge](https://github.com/tgoliveira11/postforge).

[Unreleased]: https://github.com/tgoliveira11/tgoliveira11-tech/compare/v0.1.2...HEAD
[0.1.0]: https://github.com/tgoliveira11/tgoliveira11-tech/releases/tag/v0.1.0
[0.1.1]: https://github.com/tgoliveira11/tgoliveira11-tech/releases/tag/v0.1.1
[0.1.2]: https://github.com/tgoliveira11/tgoliveira11-tech/releases/tag/v0.1.2
