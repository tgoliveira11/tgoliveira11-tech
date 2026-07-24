# Changelog

All notable changes to **tgoliveira11-tech** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Canonical editorial taxonomy for AI Engineering, Software & Solution Architecture, Engineering Leadership, Technology Strategy, and Career & Reflections.
- DB-backed content validation and dry-run taxonomy migration scripts.
- Default branded Open Graph image route for social previews.

### Changed

- Reposition public site identity around Thiago Goulart de Oliveira, AI platforms, cloud/solution architecture, and engineering leadership.
- Rework homepage, navigation, article metadata, RSS, sitemap taxonomy output, author CTA, and related-article logic around the new editorial IA.
- Normalize public tag display/archive behavior to lowercase kebab-case with migration documentation.
- Sync PostForge upstream (`7359a65`): secure-auth v0.2/v0.3 env mappings (magic link, captcha, GitHub OAuth, invites, profile, HIBP), additional test coverage from template.

### Fixed

- Preserve static priority article aliases and legacy taxonomy URLs through canonical redirects or alias-aware archive resolution.

### Security

- Upgrade Next.js, `eslint-config-next`, `next-auth`, `js-yaml`, `@tailwindcss/postcss`, `postcss`, and `sharp` resolution to clear high+ `npm audit` findings in CI.

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
