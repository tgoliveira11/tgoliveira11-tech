# Site rework report

Date: 2026-07-24
Branch: `chore/site-repositioning-2026`

## 1. Framework and Architecture Discovered

- Package manager: npm, with `package-lock.json`.
- Framework: Next.js `16.2.11`, React `19.2.4`, App Router under `src/app`.
- Styling: Tailwind CSS v4 via `src/app/globals.css` and CSS variables.
- Content model: PostgreSQL-backed posts, categories, tags, assets, redirects, analytics, and settings via Drizzle ORM. No committed filesystem Markdown/front matter content exists in this checkout.
- Public routes: `/`, `/blog`, `/blog/[slug]`, `/categories`, `/categories/[slug]`, `/tags`, `/tags/[slug]`, `/search`, `/about`, `/rss.xml`, `/sitemap.xml`, `/robots.txt`, plus legacy root date redirects through `src/proxy.ts`.
- Admin/content routes: `/admin/*` with secure-auth-protected post, asset, category, tag, import, analytics, account, security, and Outpost screens.
- Image handling: `next/image` through `PostImage`; local brand/profile assets in `public/images`; remote Vercel Blob images allowed in `next.config.ts`.
- SEO: Next Metadata API, dynamic sitemap/robots/RSS routes, article JSON-LD helpers.
- Deployment constraints: Vercel-oriented dynamic Next app; Docker Postgres local port `5434`; public dev port `3011`; no deploy command was run.
- Local database state: reachable through `.env.local`, but empty at audit time (`npm run inspect:posts` returned 0 posts and 0 assets).

## 2. Initial Audit Findings

Live public source checked:

- `https://www.tgoliveira11.tech/rss.xml`
- `https://www.tgoliveira11.tech/sitemap.xml`
- `https://www.tgoliveira11.tech/robots.txt`
- selected live article, tag, and category URLs

Findings:

- Live RSS contained 23 published articles.
- Live sitemap contained 461 URLs: 23 blog URLs, 424 tag URLs, and 8 category URLs.
- Live site metadata still exposed generic identity in places: `tgoliveira11 tech` and `Markdown-based blog publishing platform`.
- Tag URLs were mostly legacy lowercase/camelCase-derived slugs such as `/tags/softwarearchitecture`; canonical replacements such as `/tags/software-architecture` returned 404 before this change.
- Category URLs included old broad categories such as `/categories/technology-architecture`, `/categories/cybersecurity`, `/categories/professional-growth`, and `/categories/technology-leadership`; canonical replacements such as `/categories/software-solution-architecture` returned 404 before this change.
- The legacy root article URL `/2023-06-16-software-solution-system-architecture` already redirected with 308 to `/blog/2023-06-16-software-solution-system-architecture`.
- `/blog/software-solution-system-architecture` returned 404 before this change.
- Live RSS showed article date inconsistencies caused by imported database content: most older articles have `pubDate` values from 2026-06-16 rather than original publication dates, while their slugs retain 2022/2023/2024 date prefixes. The B2B mobility article uses slug date `2026-07-25` with RSS pubDate `2026-07-24`.
- The repository itself has no article front matter files to edit; content migration must be applied against the production database.

## 3. Files Changed

Primary code changes:

- `src/modules/public/editorial-taxonomy.ts`
- `src/modules/public/public-posts.repository.ts`
- `src/modules/public/public-posts.service.ts`
- `src/modules/public/public-display.ts`
- `src/modules/public/seo.ts`
- `src/modules/public/rss.ts`
- `src/modules/public/blog-config.ts`
- `src/modules/public/public-site-config.ts`
- `src/app/layout.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/blog/[slug]/page.tsx`
- `src/app/(public)/blog/page.tsx`
- `src/app/(public)/categories/page.tsx`
- `src/app/(public)/categories/[slug]/page.tsx`
- `src/app/(public)/tags/page.tsx`
- `src/app/(public)/tags/[slug]/page.tsx`
- `src/app/(public)/about/page.tsx`
- `src/app/(public)/search/page.tsx`
- `src/app/(public)/[...legacyPath]/page.tsx`
- `src/app/opengraph-image.tsx`
- `src/components/public/*`
- `src/lib/legacy-post-redirect.ts`
- `scripts/validate-content.ts`
- `scripts/migrate-site-taxonomy.ts`
- tests under `src/modules/public/*` and legacy redirect/proxy tests

Documentation and workflow:

- `docs/site-rework-report.md`
- `docs/tag-migration.md`
- `docs/tag-migration.json`
- `docs/CURRENT_PRODUCT_SURFACE.md`
- `CHANGELOG.md`
- `package.json`

## 4. Homepage Changes

- Repositioned hero around full name, professional headline, and requested introduction.
- Added a curated `FeaturedInsightsSection` that prioritizes Text-to-SQL, architecture, B2B mobility platform, career reinvention, and API security content when present.
- Renamed the recent section to `Latest articles`.
- Moved category browsing ahead of About preview.
- Kept personal/reflection content available without letting it dominate the homepage.

## 5. Navigation Changes

Main navigation now uses:

- Home
- AI Engineering
- Architecture
- Engineering Leadership
- Technology Strategy
- Reflections
- About
- All Articles
- Search, hidden when the header search is visible

Footer navigation now includes editorial categories plus About, Articles, LinkedIn, GitHub, Contact, Search, RSS, and the protected SK link.

## 6. Category Model

Canonical editorial categories:

| Category | Slug | Description |
|---|---|---|
| AI Engineering | `ai-engineering` | Production AI systems, agentic workflows, enterprise data, evaluation, governance, observability, and reliability. |
| Software & Solution Architecture | `software-solution-architecture` | Software design, distributed systems, cloud architecture, integration, APIs, security, and architectural decision-making. |
| Engineering Leadership | `engineering-leadership` | Engineering organizations, people management, team development, delivery systems, technical standards, and organizational effectiveness. |
| Technology Strategy | `technology-strategy` | Product engineering, business and technology alignment, platform strategy, commercialization, and digital products. |
| Career & Reflections | `career-reflections` | Career development, professional reinvention, culture, learning, and personal reflections. |

Public bundle hydration now resolves every post to this canonical category model using explicit priority-article overrides, tag rules, title/slug hints, and legacy category aliases.

## 7. Tag Migration Summary

- Generated `docs/tag-migration.md` and `docs/tag-migration.json` from live RSS.
- 424 original live tags were discovered.
- Canonicalization produces lowercase ASCII-compatible kebab-case tags.
- Public tag archives aggregate by canonical tag slug.
- Legacy tag routes redirect to canonical slugs when the requested slug can be normalized directly.
- The migration script can update database tag rows and add redirect rows.

Full table: `docs/tag-migration.md`  
Machine-readable mapping: `docs/tag-migration.json`

## 8. URL Redirects

Existing:

- `/:YYYY-MM-DD-slug` → `/blog/:YYYY-MM-DD-slug` through `src/proxy.ts`.

Added/standardized:

- Root priority aliases through catch-all legacy route:
  - `/software-solution-system-architecture` → `/blog/2023-06-16-software-solution-system-architecture`
  - `/a-letter-to-my-past-self` → `/blog/2024-10-08-a-letter-to-my-past-self`
  - `/text-to-sql-from-demo-to-production` → `/blog/2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production`
  - `/building-scaling-b2b-mobility-platform` → `/blog/2026-07-24-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform`
- Blog priority aliases through `/blog/[slug]`.
- Blog alias handling skips self-redirects for already canonical dated slugs.
- Category alias pages redirect to canonical category slugs.
- Tag alias pages redirect to canonical tag slugs when determinable from slug aliases.
- `scripts/migrate-site-taxonomy.ts -- --apply` can persist redirect rows for DB-backed legacy tag/category URLs.

## 9. Canonical URL Decisions

- Kept current live `/blog/YYYY-MM-DD-slug` canonical article URLs to preserve existing URL equity.
- Did not rename live slugs in code because article records are database-backed and production content is not present locally.
- Added aliases from requested shorter strategic slugs to current canonical live slugs.
- Sitemap generation now consumes canonicalized public tags/categories from repository functions.

## 10. SEO Improvements

- Public metadata defaults now use:
  - Site name: Thiago Goulart de Oliveira
  - Description: requested site introduction
  - Open Graph/Twitter defaults
  - canonical alternates for public index/detail pages
  - robots index/follow metadata for public pages
- RSS channel metadata now uses the public site identity instead of generic PostForge settings.
- Added default branded `/opengraph-image`.

## 11. Structured Data Implementation

- Added site-level `WebSite` JSON-LD with nested `Person` publisher.
- Added article-level `BlogPosting` JSON-LD with author Person, canonical URL, image, dates, tags, category, and language.
- Added article-level `BreadcrumbList` JSON-LD.
- JSON-LD serialization escapes `<` per local Next.js documentation guidance.

## 12. Image Changes

- Preserved existing image handling through `next/image`.
- Added branded default OG image route.
- Improved cover image alt fallback: empty asset alt text now falls back to priority-article alt text where known, otherwise article title.
- Did not generate fake article artwork.
- Missing recommended image files remain a manual production content action because article assets live in Vercel Blob/database content, not the repository.

## 13. Accessibility Changes

- Preserved semantic landmarks and heading structure.
- Added visible author/CTA and related-article sections with clear labels.
- Improved meaningful cover-image alt text fallback.
- Kept keyboard focus styles already present in public links/buttons.
- Navigation remains plain links with `aria-current` on active entries.

## 14. Performance Changes

- Kept public pages server-rendered; no new client hydration was introduced for taxonomy or related content.
- Reused existing `PostImage` and responsive dimensions.
- Added build-time-safe OG image route instead of adding asset dependencies.
- Related content and canonical archive aggregation hydrate published bundles; acceptable for the current 23-post corpus, but should be revisited if content grows into hundreds/thousands of posts.

## 15. Content Validation Implementation

Added `npm run content:validate`:

- Loads `.env.local`/`.env`.
- Skips if `DATABASE_URL` is unavailable.
- Checks post slugs, canonical URLs, published dates, descriptions, empty bodies, source/canonical category mismatch, tag canonicalization, duplicate canonical tags per post, cover assets, cover alt text, internal links, and empty editorial categories.
- Fails with nonzero exit code on critical errors.

Integrated into `npm run validate`.

Added `npm run content:migrate-taxonomy`:

- Dry-run by default.
- `npm run content:migrate-taxonomy -- --apply` ensures canonical categories, migrates post categories, merges canonical tags, and records redirects.

## 16. Tests and Build Commands Executed

Executed:

- `npm run inspect:posts`
- `npm run typecheck`
- `npm run test -- src/modules/public/public-site-config.test.ts src/modules/public/seo.test.ts src/modules/public/rss.test.ts src/modules/public/sitemap.test.ts src/modules/public/public-display.test.ts src/modules/public/public-posts.service.test.ts src/lib/legacy-post-redirect.test.ts src/proxy.test.ts`
- `npm run test -- src/modules/public/public-posts.repository.extended.test.ts src/modules/public/public-posts.repository.test.ts src/modules/public/public-taxonomy-relevance.test.ts src/modules/public/public-popularity.test.ts`
- `npm run content:validate`
- `npm run content:migrate-taxonomy`
- `npm run build`
- `npm run validate`

## 17. Test Results

- Local DB inspection: 0 posts, 0 assets.
- Typecheck: passed.
- Focused public rendering/metadata tests: passed.
- Focused public repository/taxonomy tests: passed.
- Content validation on empty local DB: passed with 0 errors and 0 warnings.
- Taxonomy migration dry run on empty local DB: passed.
- Production build: passed.
- Full validation: passed (`typecheck`, `lint`, `test:coverage`, `content:validate`, `build`).
- Production dependency security audit: passed (`npm run audit:security`, 0 vulnerabilities).
- Local smoke: homepage returned 200, `/opengraph-image` returned `image/png`, and old post/tag/category aliases returned 308 to canonical paths.
- Non-failing lint warning remains in existing generated coverage output: `coverage/lcov-report/block-navigation.js`.

Production database update on 2026-07-24:

- Dry-run result before applying: 21 post category updates, 8 tag-link inserts, 8 tag-link deletes, and 328 redirects to ensure.
- Applied taxonomy migration against the Neon production database.
- Production content validation after migration checked 23 posts, 11 categories, 435 tags, and 24 assets.
- Production content validation result: 0 errors, 25 warnings.
- Remaining production warnings are content-quality items: imported `publishedAt` dates differ from dated slugs for legacy posts, two posts have no cover image, and two cover assets are missing descriptive alt text.

Production content cleanup on 2026-07-24:

- Demoted duplicate top-level article body H1 headings in two legacy posts.
- Restored legacy `publishedAt` dates from date-prefixed slugs.
- Canonicalized the B2B mobility article to the `2026-07-24` date-based slug and redirected the former `2026-07-25` slug.
- Associated cover assets and descriptive alt text with posts that were missing cover metadata.
- Production content validation after cleanup checked 25 posts, 11 categories, 454 tags, and 27 assets.
- Production content validation result: 0 errors, 0 warnings.

## 18. Missing Article Bodies

- No repository article bodies exist to edit.
- Live RSS indicates the four priority articles are present on production.
- If a production database migration is expected, run the migration script against the intended database rather than editing nonexistent local Markdown files.

## 19. Missing Images

Repository-local recommended priority images were not present:

- `text-to-sql-production.png`
- `text-to-sql-production.jpg`
- `text-to-sql-process-in-action.png`
- `what-breaks-first-text-to-sql-pipeline.png`
- `building-and-scaling-a-mobility-platform.png`
- `building-and-scaling-a-b2b-mobility-platform.png`
- `building-scaling-b2b-mobility-platform.png`

Live production content uses Vercel Blob cover assets for the Text-to-SQL and B2B mobility articles.

## 20. Remaining Manual Actions

- Production post dates have been restored from date-prefixed slugs.
- The B2B mobility article now uses the `2026-07-24` canonical slug; the `2026-07-25` slug redirects.
- Production article cover asset metadata now validates without warnings.
- Confirm production `APP_BASE_URL`/blog setting should use `https://www.tgoliveira11.tech` or apex `https://tgoliveira11.tech`, then keep sitemap/robots/canonicals consistent.

## 21. Risks or Assumptions

- Content is DB-backed and the local DB is empty, so source content migration could not be applied locally.
- Live RSS/sitemap were treated as the current public content inventory.
- Canonical article URLs preserve current live `/blog/YYYY-MM-DD-slug` routes rather than changing stable slugs.
- The taxonomy migration script is intentionally dry-run by default to avoid accidental production database edits.

---

## 22. Follow-up implementation from attached rework bundle

Date: 2026-07-24

Branch: `feature/codex-site-rework`

### Framework and repository architecture

- Confirmed Next.js `16.2.11`, React `19.2.4`, npm with `package-lock.json`, App Router in `src/app`, and DB-backed content.
- Read local Next docs for metadata/OG, redirects, headers/cache, and JSON-LD before code changes.

### Deployment and caching findings

- Added repository-level canonical host redirect from `tgoliveira11.tech` to `https://www.tgoliveira11.tech`.
- Added no-store headers for public HTML routes because the public layout can display an authenticated admin convenience link.
- Added short shared caching for metadata endpoints: `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and `/llms-full.txt`.
- Static fingerprinted Next assets remain under Next's immutable caching behavior.

### Canonical-host decision

- Canonical origin is `https://www.tgoliveira11.tech`.
- `src/modules/public/blog-config.ts` now defaults to the canonical production origin when env/blog settings are absent.
- `PUBLIC_AUTHOR_PROFILE.website` now uses the canonical `www` origin.

### Files changed

- `next.config.ts`
- `next.config.test.ts`
- `.env.example`
- `package.json`
- `scripts/apply-site-rework-content.ts`
- `scripts/validate-content.ts`
- `src/app/(public)/about/page.tsx`
- `src/app/sitemap.ts`
- `src/components/public/*`
- `src/lib/email/templates/*`
- `src/lib/auth/patch-secure-auth-email-templates.test.ts`
- `src/modules/public/*`
- `docs/analytics-events.md`
- `docs/github-reference-project-plan.md`
- `docs/site-rework-report.md`
- `docs/CURRENT_PRODUCT_SURFACE.md`
- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/UI_UX_SKILL.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/blog-email-templates.md`
- `docs/EMAIL_PROVIDERS.md`
- `CHANGELOG.md`

### Home changes

- Home hero CTA labels now match the brief: `Explore my work`, `About me`, and `Connect on LinkedIn`.
- Home CTA clicks are marked for analytics.
- Featured Insight card clicks emit `home_featured_insight_click`.
- Cards now show modification date when it differs from publication date.

### About changes

- Expanded About page into the requested structure: hero, professional summary, four core areas, career progression, selected work, leadership principles, technical experience, and final CTA.
- About selected work is queried from canonical Featured Insights instead of duplicating article metadata.
- About metadata now includes the requested title, description, OG title, OG description, and canonical `/about`.
- Résumé CTA is conditional on `NEXT_PUBLIC_RESUME_URL` or `RESUME_URL`; no URL was invented.

### Navigation changes

- Footer now prioritizes LinkedIn, GitHub, résumé when configured, email, and RSS before editorial navigation.
- Removed the obsolete SK footer link.
- Header navigation from the previous rework remains concise and mobile-scrollable.

### Category model

- Added category aliases for approved names containing `&`, such as `Software & Solution Architecture` and `Career & Reflections`.
- Sitemap now excludes empty category archives.

### Complete tag migration

- Existing `docs/tag-migration.md` and `docs/tag-migration.json` remain the migration inventory.
- Added approved-manuscript aliases for `oauth2 -> oauth-2`, `openidconnect -> openid-connect`, `zero-trust`, `abuse-prevention`, `ai-evaluation`, and `ai-quality`.

### Redirect map

- Added native permanent redirects in `next.config.ts` for:
  - apex host to canonical `www`;
  - strategic article aliases for Text-to-SQL, architecture, TecleTaxi, and career articles;
  - legacy category aliases to the five canonical editorial categories.
- Existing DB-backed and route-level redirect handling remains for dynamic legacy paths and tag aliases.

### Canonical-URL decisions

- Preserved current public date-based `/blog/YYYY-MM-DD-slug` canonical URLs where already established.
- The approved-content migrator maps short manuscript slugs to date-based canonical slugs and creates redirects from aliases.

### Publication-date corrections

- The migrator preserves manuscript `date` as `publishedAt` and manuscript `lastmod` as `updatedAt` when present.
- Validation now fails when `updatedAt` is earlier than `publishedAt`.
- Production legacy date corrections still require running the approved-content migrator against the intended database.

### Article replacements and additions

- Added `npm run content:apply-site-rework`.
- Dry-run parser successfully processed all eight approved manuscripts from the attachment:
  - Text-to-SQL
  - Architecture
  - Career
  - TecleTaxi
  - API security
  - Distributed cache
  - AI evaluation
  - Agent observability
- The script is dry-run by default and requires `--apply`, a valid `DATABASE_URL`, and an existing admin author user before updating content.

### Image changes and missing images

- Added required alt text fallbacks for Text-to-SQL, TecleTaxi, architecture, career, API security, and cache strategic articles.
- No fake bitmap or unrelated stock art was added.
- Article-specific production image assets remain a database/Vercel Blob content operation.

### SEO changes

- About metadata now supports custom OG title/description.
- `Person` JSON-LD now includes profile image and verified `knowsAbout` values.
- Article JSON-LD author object now includes the same image and `knowsAbout` values.
- Sitemap excludes empty category archives and includes public canonical pages through existing generation.

### Structured-data changes

- Existing `WebSite`, `BlogPosting`, and `BreadcrumbList` JSON-LD remain.
- `Person` JSON-LD now includes name, URL, image, job title, LinkedIn/GitHub `sameAs`, and `knowsAbout`.

### Accessibility changes

- About page keeps one H1 and uses section headings for summary, core areas, career, selected work, principles, technical experience, and final CTA.
- Approved-content migrator strips the manuscript H1 because the public article template renders the title.
- Content validation now fails on top-level H1 in article bodies.

### Performance changes

- No new animation or heavy client library added.
- Conversion analytics uses a single delegated click listener instead of per-link client components.
- Scroll-depth tracking uses `requestAnimationFrame` throttling.

### Analytics implementation

- Added public conversion events documented in `docs/analytics-events.md`.
- Events cover About visit, article entry, Featured Insight clicks, LinkedIn/résumé/GitHub/email CTAs, article CTA, related article click, article scroll depth, article completion, search results, page views, UTM fields, and Web Vitals.
- No duplicate page-view tracking was introduced.

### GitHub reference-project preparation

- Created `docs/github-reference-project-plan.md`.
- The plan covers architecture, Mermaid diagram, repository tree, README manuscript, ADR template, security model, evaluation plan, observability plan, test strategy, and unpublished draft portfolio entry.
- No external GitHub repository was created or pushed.

### Validation script

- `scripts/validate-content.ts` now checks `updatedAt >= publishedAt`, duplicate H1 risk, and AI-discovery endpoints as valid internal paths.
- Existing validation still checks slug, dates, canonical URLs, category resolution, tag canonicalization, duplicate tags, assets, and internal links.

### Commands executed

- `npm run typecheck` - passed.
- `npm run test -- next.config.test.ts src/components/public/google-analytics.test.ts src/components/public/site-footer.test.ts src/modules/public/public-site-config.test.ts src/modules/public/seo.test.ts src/modules/public/editorial-taxonomy.test.ts src/lib/email/templates/email-templates.test.ts src/lib/auth/patch-secure-auth-email-templates.test.ts` - 7 files passed, 35 tests passed.
- `npm run content:apply-site-rework -- --content-dir /tmp/.../.codex-site-rework/approved-content` - dry-run succeeded for all 8 manuscripts.
- `npm run validate` - passed.

### Test/build results

- Typecheck: passed.
- Lint: passed with 1 existing warning in generated `coverage/lcov-report/block-navigation.js`.
- Test coverage: 163 files passed, 1084 tests passed.
- Content validation: checked 0 local posts/categories/tags/assets; 0 errors, 0 warnings.
- Production build: passed; Next generated 49 static pages and all dynamic routes successfully.

### Pre-existing failures

- No blocking pre-existing failure observed.
- Persistent non-blocking lint warning remains in generated coverage output.
- Local configured database contains 0 posts, so content validation cannot prove production article bodies without applying the migrator to the target DB.

### Manual external actions

- Set `APP_BASE_URL`/blog `baseUrl` consistently to `https://www.tgoliveira11.tech` in production settings if not already.
- Confirm apex-to-www redirect behavior in the hosting/CDN dashboard after deployment.
- Configure `NEXT_PUBLIC_RESUME_URL` or `RESUME_URL` only when a verified résumé URL is available.
- Extract the attached bundle, then apply approved manuscripts to the intended DB with:
  `rm -rf /tmp/tgoliveira-codex-site-rework && unzip -q /Users/thiago.oliveira/Downloads/tgoliveira-codex-site-rework.zip -d /tmp/tgoliveira-codex-site-rework`
  `npm run content:apply-site-rework -- --apply --content-dir /tmp/tgoliveira-codex-site-rework/.codex-site-rework/approved-content`
- After applying content, run `npm run content:migrate-taxonomy -- --apply` if legacy taxonomy rows still exist.
- Update missing production cover images/alt text in the asset system where DB content still lacks images.

### Risks and assumptions

- The local DB is empty; article body replacement/addition was implemented as a dry-run-safe migrator, not applied locally.
- The current canonical slug policy preserves date-based public URLs to avoid losing existing URL equity.
- The résumé CTA is intentionally hidden until a verified URL exists.
