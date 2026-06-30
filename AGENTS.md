<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Repository workflow

This fork (**tgoliveira11-tech**) uses a conservative branch/PR/release model. Read before making changes:

| Topic | Document |
|-------|----------|
| Contributing (branch, PR, commits, checklist) | [docs/contributing.md](docs/contributing.md) |
| Manual releases & version invariant | [docs/releasing.md](docs/releasing.md) |
| GitHub branch protection | [docs/repo-settings.md](docs/repo-settings.md) |
| Product surface inventory | [docs/CURRENT_PRODUCT_SURFACE.md](docs/CURRENT_PRODUCT_SURFACE.md) |
| Cursor agent guardrails | [.cursor/rules/branch-pr-release.mdc](.cursor/rules/branch-pr-release.mdc) |

**Quick rules for agents:** branch before substantive edits; no commits/pushes/PRs/merges/releases unless asked; run `npm run validate` before claiming code work is done; update `CHANGELOG.md` `[Unreleased]` and `CURRENT_PRODUCT_SURFACE.md` when behavior or routes change.
