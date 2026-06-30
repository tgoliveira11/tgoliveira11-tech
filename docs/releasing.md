# Releasing tgoliveira11-tech

This repository is **not** an npm package. A release means cutting a **versioned snapshot** in git and publishing **GitHub Release notes** (and optionally artifacts later). Production deploy (Vercel) is a **separate manual step**.

---

## Version invariant

For every release `X.Y.Z`:

```text
VERSION (file)  =  X.Y.Z
git tag           =  vX.Y.Z
GitHub Release    =  vX.Y.Z
```

| Source | Path |
|--------|------|
| Canonical version | [`VERSION`](../VERSION) |
| Synced metadata | [`package.json`](../package.json) `version` field (internal only; not published) |
| Release notes source | [`CHANGELOG.md`](../CHANGELOG.md) |

The release workflow enforces all three in one run, or completes missing pieces in **recovery mode** without double-bumping.

---

## Manual only

| Action | Automatic? |
|--------|------------|
| GitHub Release | **No** — `workflow_dispatch` only |
| Version bump commit on `main` | **No** — same manual workflow |
| `npm publish` | **N/A** — app repo, `private: true` |
| Vercel deploy | **No** — external / dashboard or separate process |

**Agents:** do not run [`.github/workflows/release.yml`](../.github/workflows/release.yml) or create tags without explicit owner approval.

---

## Workflow

**File:** `.github/workflows/release.yml`  
**Trigger:** Actions → **Release** → **Run workflow**

### Inputs

| Input | Description |
|-------|-------------|
| `version` | `auto` (default), `patch`, `minor`, `major`, or exact `X.Y.Z` |
| `recovery` | `true` to retry tag/release for current `VERSION` without bump |

### New release (normal path)

1. Ensure `## [Unreleased]` in `CHANGELOG.md` has notes for this release.
2. Merge all PRs to `main`.
3. Run workflow with `recovery: false` and desired `version` bump.
4. Workflow:
   - Runs `scripts/prepare-release.mjs` (reads `[Unreleased]`, bumps `VERSION`, rolls changelog, syncs `package.json`).
   - If files changed: commits `chore(release): X.Y.Z` to `main` as `github-actions[bot]`.
   - Creates annotated tag `vX.Y.Z` and pushes it.
   - Creates GitHub Release **tgoliveira11-tech X.Y.Z** with notes from `## [X.Y.Z]` (fallback: `--generate-notes`).

### Recovery mode

Use when a previous release run failed **after** the version bump commit but **before** tag or GitHub Release was created.

1. Confirm `VERSION` already reflects the intended release.
2. Ensure `## [Unreleased]` is **empty** (content already rolled to `## [X.Y.Z]`).
3. Run workflow with **`recovery: true`**.
4. Workflow reuses current `VERSION`, skips bump, creates missing tag and/or GitHub Release.

### Fail-fast cases

| Situation | Result |
|-----------|--------|
| `patch` / `minor` / `major` / `X.Y.Z` with empty `[Unreleased]` | Workflow fails with clear message — use recovery or add notes |
| Recovery with non-empty `[Unreleased]` | Fails — use normal release |
| Invalid `VERSION` or changelog structure | Fails in `prepare-release.mjs` |

---

## Local dry-run

```bash
# Inspect what auto-bump would pick (does not write files in recovery)
node scripts/prepare-release.mjs --bump auto

# Extract notes for an existing version section
node scripts/prepare-release.mjs extract-notes 0.1.0
```

> Local `prepare-release.mjs` **writes files** on a normal (non-recovery) run. Use a throwaway branch or revert afterward.

---

## First release bootstrap

If `VERSION` is `0.1.0` but no `v0.1.0` tag exists:

1. Ensure `CHANGELOG.md` has `## [0.1.0] - YYYY-MM-DD`.
2. Leave `## [Unreleased]` with only the new infrastructure notes (or empty).
3. Run **recovery** to create `v0.1.0` tag + GitHub Release, **or** run a normal `0.1.1` release after filling `[Unreleased]`.

---

## After release

1. Verify on GitHub: tag `vX.Y.Z` and Release notes match `CHANGELOG.md`.
2. Deploy to production manually (Vercel) if desired — not triggered by this workflow.
3. Continue development on feature branches; accumulate changes under `## [Unreleased]`.

---

## Optional future extensions

Not implemented unless requested:

- Attach build artifacts (`.next` export, etc.)
- `production` GitHub Environment with required reviewers for deploy workflow
- `CODEOWNERS`
