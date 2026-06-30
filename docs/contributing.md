# Contributing to tgoliveira11-tech

Conservative workflow for humans and AI agents: **branch-first**, **merge via PR**, **manual releases only**.

| Topic | Document |
|-------|----------|
| Releases & version invariant | [releasing.md](releasing.md) |
| GitHub branch protection | [repo-settings.md](repo-settings.md) |
| Product surface inventory | [CURRENT_PRODUCT_SURFACE.md](CURRENT_PRODUCT_SURFACE.md) |
| Upstream PostForge sync | [upstream-sync.md](upstream-sync.md) |

---

## Branch strategy

- **Default base:** `main` (no `develop`).
- **Never commit directly to `main`** unless explicitly requested by the repo owner.
- **Never push to `main`** without explicit owner approval.
- Create a branch from up-to-date `main` before substantive work:

| Prefix | Use for |
|--------|---------|
| `feature/` | Behavior, API, UX |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `chore/` | CI, tooling, dependencies, release plumbing |

**Exception:** `sync/postforge-upstream` is created by the upstream-sync workflow for PostForge merges.

```bash
git checkout main && git pull
git checkout -b feature/my-change
```

---

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new behavior
- `fix:` — bug fix
- `docs:` — documentation
- `refactor:` — code change without behavior change
- `test:` — tests
- `chore:` — tooling, deps, release metadata
- `ci:` — CI/workflows

Optional scope: `feat(api): add post-view rate limit header`.

- Subject: clear and concise; body only when it adds context.
- **Agents:** commit only when the owner asks; otherwise leave work uncommitted.
- **No destructive git** (`push --force`, `reset --hard`, etc.) unless explicitly requested.

---

## Pre-PR checklist (code changes)

Before opening a PR or declaring a task done:

1. Run **`npm run validate`** (typecheck, lint, test, build).
2. Add or update tests for changed behavior.
3. Update **`CHANGELOG.md`** → `## [Unreleased]` for user-visible changes (behavior, API, schema, env vars, jobs/cron, privacy, UX).
4. Update **`docs/CURRENT_PRODUCT_SURFACE.md`** when routes, endpoints, jobs, integrations, or shipped/planned status change.
5. Confirm no secrets (`.env`, credentials) are staged.

Trivial docs-only changes may skip `validate`.

---

## Pull request cycle

1. Push your branch to `origin`.
2. Open a PR against `main` with **`gh pr create`** only when the owner asks (include summary + test plan).
3. Do **not** merge, approve, or push to `main` without explicit owner approval.
4. Prefer **squash merge**.
5. Address review feedback on the same branch.
6. After merge:
   ```bash
   git checkout main && git pull
   git branch -d feature/my-change   # if merged locally
   ```
   Confirm changelog, product surface, and tests before closing the task.

### Required CI checks

| Check | Purpose |
|-------|---------|
| `validate` | typecheck, lint, test, build, audit |
| `branch-name` | branch prefix enforcement |

---

## Changelog

- Work in progress → **`CHANGELOG.md`** section `## [Unreleased]`.
- Follow [Keep a Changelog](https://keepachangelog.com/) categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- Releases consume `[Unreleased]` — see [releasing.md](releasing.md).

---

## Releases (summary)

- **Manual only** — never automatic on push/tag.
- **Invariant:** `VERSION` = `vX.Y.Z` git tag = GitHub Release `vX.Y.Z`.
- **Agents must not** run the release workflow or create tags/releases without explicit owner request.
- Deploy (Vercel) is separate and manual — not part of version bump.

Full process: [releasing.md](releasing.md).

---

## AI agents (Cursor)

Always-apply rule: [`.cursor/rules/branch-pr-release.mdc`](../.cursor/rules/branch-pr-release.mdc).

Quick rules:

- Branch before substantive edits.
- No commits/pushes/PRs/merges/releases unless asked.
- Run `npm run validate` before claiming code work is done.
- Keep `[Unreleased]` and `CURRENT_PRODUCT_SURFACE.md` in sync with behavioral changes.
