# GitHub repository settings

Recommended protection for **`tgoliveira11/tgoliveira11-tech`**. Apply via **Settings → Branches** or the commands below.

> **Status:** `main` is currently **unprotected**. Enable these rules before relying on them for agent/human guardrails.

---

## Branch protection: `main`

| Rule | Value | Notes |
|------|-------|-------|
| Require pull request | **Yes** | No direct pushes by humans/agents |
| Required status checks | **`validate`**, **`branch-name`** | Strict: branches must be up to date |
| Require linear history | **Yes** | Squash merge recommended |
| Allow force pushes | **No** | |
| Lock branch | **No** | Release workflow must push version metadata to `main` |
| Restrict who can push | Optional | Allow `github-actions[bot]` or use bypass for release workflow |

### Release workflow exception

The [release workflow](../.github/workflows/release.yml) commits `VERSION`, `CHANGELOG.md`, and `package.json` to `main` as `github-actions[bot]`. Options:

1. **Bypass list:** add `github-actions[bot]` to “Allow specified actors to bypass required pull requests”.
2. **Rulesets:** separate ruleset for release automation with narrow path allowlist.

Do **not** enable full branch lock — it blocks release metadata pushes.

---

## Apply via `gh` CLI

Requires admin on the repository.

```bash
# Fetch required check IDs (after at least one run of each workflow on a PR)
gh api repos/tgoliveira11/tgoliveira11-tech/actions/workflows/ci.yml --jq .id
gh api repos/tgoliveira11/tgoliveira11-tech/actions/workflows/branch-name.yml --jq .id

# Example: enable protection (adjust context names after first CI runs)
gh api \
  --method PUT \
  repos/tgoliveira11/tgoliveira11-tech/branches/main/protection \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]=validate \
  -f required_status_checks[contexts][]=branch-name \
  -f enforce_admins=true \
  -f required_pull_request_reviews[required_approving_review_count]=0 \
  -f restrictions=null \
  -F required_linear_history=true \
  -F allow_force_pushes=false \
  -F allow_deletions=false
```

> GitHub UI is often easier for selecting check names from the dropdown after workflows have run once.

---

## Merge settings

**Settings → General → Pull Requests:**

| Setting | Recommendation |
|---------|----------------|
| Allow squash merging | **Yes** (default merge method) |
| Allow merge commits | Optional |
| Allow rebase merging | Optional |
| Auto-delete head branches | **Yes** |

---

## Actions permissions

**Settings → Actions → General:**

- **Workflow permissions:** Read and write (release workflow pushes tags and commits).
- **Fork PR workflows:** default (not applicable for solo fork workflow).

---

## Environments (optional)

Not required for tag + GitHub Release.

If a future **deploy workflow** is added:

| Environment | Purpose |
|-------------|---------|
| `production` | Manual deploy approval gate |

Current production deploy uses **Vercel** connected to `main` — outside this repo’s release workflow.

---

## Verification checklist

After enabling protection:

- [ ] PR from `feature/test` passes `validate` + `branch-name`
- [ ] PR from `bad-branch-name` fails `branch-name`
- [ ] Direct push to `main` is rejected (for non-bypass actors)
- [ ] Release workflow can still push version commit + tag (test on a patch release)
