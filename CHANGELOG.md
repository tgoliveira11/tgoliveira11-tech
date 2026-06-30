# Changelog

All notable changes to **tgoliveira11-tech** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/tgoliveira11/tgoliveira11-tech/compare/v0.1.1...HEAD
[0.1.0]: https://github.com/tgoliveira11/tgoliveira11-tech/releases/tag/v0.1.0
[0.1.1]: https://github.com/tgoliveira11/tgoliveira11-tech/releases/tag/v0.1.1
