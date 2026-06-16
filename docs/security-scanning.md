# Security scanning (tgoliveira11-tech)

Repo-local security baseline for GitHub Actions + Vercel deployment. PostForge upstream is not modified; workflows live in `.github/workflows/`.

## What runs automatically

| Check | Workflow | Trigger | Blocks merge |
|-------|----------|---------|--------------|
| Typecheck, lint, test, build | `ci.yml` | push/PR to `main` | Yes |
| npm audit (high+) | `ci.yml` | push/PR to `main` | Yes |
| CodeQL (SAST) | `codeql.yml` | push/PR to `main` | Findings in Security tab |
| Semgrep CE (SAST) | `semgrep.yml` | push/PR to `main` | Yes on ERROR severity |
| Gitleaks (secrets) | `gitleaks.yml` | push/PR | Yes |
| Dependency Review | `dependency-review.yml` | PR to `main` | Yes on high+ vulns |
| Dependabot PRs | `dependabot.yml` | weekly schedule | Via PR review |
| OWASP ZAP baseline (DAST) | `zap-baseline.yml` | weekly + manual | No (`continue-on-error`) |

## Scheduled scans

| Workflow | Schedule (UTC) |
|----------|----------------|
| CodeQL | Mondays 05:30 |
| ZAP baseline | Sundays 07:00 |
| Dependabot | Mondays 09:00 (npm), 09:30 (Actions) |
| Upstream sync | Mondays 12:00 (separate workflow) |

## Manual only

- **ZAP baseline** — `workflow_dispatch` with optional `target` input
- All workflows also support `workflow_dispatch` for ad-hoc runs

## Where findings appear

- **CodeQL / Semgrep SARIF** → GitHub **Security** → **Code scanning alerts**
- **Gitleaks** → workflow logs (no secrets printed) + job failure
- **npm audit** → CI job logs
- **Dependency Review** → PR checks + summary comment
- **ZAP** → Actions artifact `zap-baseline-report` (HTML/JSON/Markdown)

## Run DAST (OWASP ZAP baseline)

### GitHub UI

1. Open **Actions** → **OWASP ZAP Baseline**
2. Click **Run workflow**
3. Optional: set `target` (default `https://tgoliveira11-tech.vercel.app`)
4. Download artifact **zap-baseline-report** when complete

### After custom domain migration

Change the workflow input default or pass:

```text
https://www.tgoliveira11.tech
```

Update `.github/workflows/zap-baseline.yml` default when the domain is live and stable.

### DAST guardrails

- **Passive/baseline only** — no active attack mode
- **No authenticated scans** (admin/account/auth routes excluded via spider scope)
- **Do not** run aggressive scans against production
- Review findings before tightening `continue-on-error`

Excluded scope (conservative): `/admin`, `/api/account`, `/api/auth`, `/api/admin`

## Triage false positives

### Semgrep

- Fix real issues when practical
- For accepted risk, add a narrow `nosemgrep` comment with justification in code
- Avoid disabling entire rulesets globally

### ZAP

- Add reviewed suppressions to [`.zap/rules.tsv`](../.zap/rules.tsv)
- Document each suppression in a PR comment

### Gitleaks

- Add paths to [`.gitleaksignore`](../.gitleaksignore) only for documented false positives
- **Never** commit real secrets — rotate and remove from history if leaked

### npm audit

- **High/critical** — fix or document exception before merge
- **Moderate** — review manually (`npm run audit:ci`)

## Security headers

Configured in [`next.config.ts`](../next.config.ts) via [`src/lib/security/http-security-headers.ts`](../src/lib/security/http-security-headers.ts):

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (restricts camera/mic/geo/payment/usb)
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security` in production builds only

**Content-Security-Policy** is deferred — Next.js, Vercel Speed Insights, Blob images, and auth flows need a careful policy. Plan a report-only CSP phase before enforcement.

## Local commands

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run audit:security   # high+ only (matches CI gate)
npm run audit:ci         # moderate+ for manual review
```

## Recommended GitHub branch protection (`main`)

Configure in **Settings → Branches → Branch protection rules**:

- Require pull request before merging
- Require approvals (≥ 1)
- Require status checks:
  - `quality` (CI)
  - `analyze (javascript-typescript)` (CodeQL)
  - `semgrep`
  - `gitleaks`
  - `dependency-review` (PRs)
- Require conversation resolution
- Do not allow force pushes
- Do not allow deletions

Enable **Dependency graph** and **Dependabot alerts** under **Settings → Security**.

Enable **Code scanning** (CodeQL uploads) under **Settings → Code security and analysis**.

## Security baseline checklist

- [ ] No secrets in git history (Gitleaks clean)
- [ ] No high/critical npm audit findings unaddressed
- [ ] CodeQL + Semgrep reviewed for new alerts on each PR
- [ ] Dependency Review passing on PRs
- [ ] ZAP baseline reviewed weekly (artifact)
- [ ] Production uses HTTPS with HSTS (Vercel)
- [ ] `EMAIL_PROVIDER=resend` secrets only in Vercel env (not git)
- [ ] Custom domain added to ZAP target after cutover

## Upstream merges

Merging PostForge upstream may add or change workflows. After each upstream sync:

1. Reconcile `.github/workflows/` conflicts
2. Keep tgoliveira11-tech-specific docs in `docs/security-scanning.md`
3. Re-run security workflows on the sync PR

## Known limitations

- Semgrep CE runs OSS rules only (no Semgrep Cloud token)
- ZAP baseline is unauthenticated and passive — does not cover admin flows
- CSP not enforced yet
- `@tgoliveira/secure-auth` is analyzed as application code but not separately scanned in its private registry
- Moderate npm advisories are informational until manually triaged
