# Security dependency audit

How PostForge manages `npm audit` findings without risky bulk fixes.

## Running audits

```bash
npm run audit          # full tree (dev + prod)
npm run audit:prod     # production dependencies only
npm run audit:ci     # fail CI on moderate+ (full tree)
```

Before committing dependency changes, always run:

```bash
npm ls @tgoliveira/secure-auth drizzle-orm drizzle-kit next next-auth esbuild postcss uuid
npm audit
npm audit --omit=dev
npm run typecheck
npm test
npm run lint
npm run db:generate
npm run build
```

## Do not use `npm audit fix --force`

`npm audit fix --force` often proposes **breaking downgrades** (for example Next.js 9, next-auth 3.x, old drizzle-kit). Treat audit output as a signal, then fix the **root cause** with targeted upgrades or `overrides`.

## Current overrides (PostForge)

Defined in `package.json`:

| Override | Why |
| --- | --- |
| `esbuild@^0.28.1` | Patches GHSA-67mh-4wv8-2f99 and GHSA-gv7w-rqvm-qjhr. `drizzle-kit@0.31.10` still bundles older esbuild transitively. |
| `drizzle-kit → @esbuild-kit/esm-loader → tsx` | Removes deprecated `@esbuild-kit/*` chain ([drizzle-orm#4852](https://github.com/drizzle-team/drizzle-orm/issues/4852)). Upstream fix lands in `drizzle-kit@beta` (Drizzle v1). |
| `postcss@^8.5.10` | Patches GHSA-qx2v-qp2m-jg93. Next.js 16.2.x still vendors `postcss@8.4.31`; fixed in Next 16.3+ preview/canary. Override is build-time only. |
| `uuid@^11.1.1` | Patches GHSA-w5hq-g745-h8pq. `next-auth@4.24.14` still depends on `uuid@^8.3.2`. |

Remove overrides when upstream packages ship fixed versions on the versions PostForge uses.

## Updating `@tgoliveira/secure-auth`

1. Check peer dependencies in the new release (`drizzle-orm`, `next`, `next-auth`, `react`).
2. Bump the package version in `package.json`.
3. Align peers (for example `drizzle-orm@^0.45.2` for `0.1.10-internal`).
4. Run `npm install` (no `--legacy-peer-deps`).
5. Run the validation commands above.
6. Smoke-test login, register, and `/admin` access.

Auth logic lives in the package — do not reimplement it in PostForge.

## Peer dependency conflicts

- Resolve by upgrading the **consumer** peer to the range the package declares.
- If a peer is optional (OAuth providers), missing env vars are fine; missing required peers are not.
- Prefer `overrides` only for **transitive** vulnerabilities with no upstream fix (see table above).

## Dependency classification

| Package | Kind | Notes |
| --- | --- | --- |
| `drizzle-orm` | `dependencies` | Runtime DB access |
| `drizzle-kit` | `devDependencies` | Migrations / generate only |
| `tsx` | `devDependencies` | CLI import script |
| `vitest` | `devDependencies` | Tests |
| `next` | `dependencies` | App framework |
| `@tgoliveira/secure-auth` | `dependencies` | Auth composition root |
| `next-auth` | `dependencies` | Required peer of secure-auth |

## Follow-ups owned elsewhere

| Issue | Owner | Notes |
| --- | --- | --- |
| `drizzle-kit` + `@esbuild-kit/esm-loader` | drizzle-team | Fixed in `drizzle-kit@beta`; migrate to Drizzle v1 when stable. |
| `next-auth` + `uuid@8` | next-auth / secure-auth | `next-auth@4.24.14` has no uuid 11 release yet; PostForge overrides uuid until upstream updates. |
| `next` + bundled `postcss` | Vercel | `next@16.3.0+` bundles `postcss@8.5.10+`; remove postcss override after upgrading Next stable. |
