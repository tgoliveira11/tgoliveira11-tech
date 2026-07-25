# Site final alignment report

Reviewed on 2026-07-24 from branch `feature/final-site-alignment-resume`.

## 1. Framework and repository structure

- Framework: Next.js `16.2.11`, App Router under `src/app`.
- Package manager: npm with `package-lock.json`.
- Public routes: `src/app/(public)`.
- Public components: `src/components/public`.
- Public SEO, sitemap, RSS, AI discovery, taxonomy, and display logic: `src/modules/public`.
- Static assets: `public/`.
- Validation entrypoint: `npm run validate`.

## 2. Resume source and final public path

- Source file used: `/Users/thiago.oliveira/Downloads/Thiago_Goulart_Resume_2026.pdf`.
- Final public asset: `public/files/thiago-goulart-de-oliveira-resume.pdf`.
- Public URL: `/files/thiago-goulart-de-oliveira-resume.pdf`.
- SHA-256 source and public copy matched: `caa61efbe25d44ef5e33f6c71d9ba64e522e2bbee19984d716992d31a10021b7`.
- The PDF was copied byte-for-byte; it was not regenerated, compressed, converted, or visually modified.

## 3. Resume CTA locations

- About hero: `Download résumé`, after `View my work`.
- About final CTA: `Download résumé`, with LinkedIn and GitHub.
- Footer: `Résumé`, ordered after LinkedIn and before GitHub.
- Homepage hero: no extra résumé button added, preserving the existing three-button hierarchy.

## 4. Analytics event changes

- Résumé downloads use existing GA4 tracking.
- Event: `resume_download`.
- Parameters: `source`, `file`, `component`, `link_url`, `link_text`, plus existing page and UTM fields.
- Sources implemented: `about-hero`, `about-final-cta`, `footer`.

## 5. Navigation-label changes

- `Engineering Leadership` nav label changed to `Leadership`.
- `Technology Strategy` nav label changed to `Strategy`.
- `All Articles` nav label changed to `Articles`.
- Category route names and page headings remain unchanged.
- Authenticated Admin behavior was not changed.

## 6. Category-card changes

- Homepage category descriptions now use concise full descriptions from the brief.
- Line clamping was removed from category description cards that caused automatic ellipses.
- Card alignment remains responsive without oversized card styling.

## 7. Homepage About-card changes

- `About me` changed to `About Thiago`.
- `Learn more about me` changed to `View professional background`.
- The card remains compact and does not add a résumé button.

## 8. About-page readability changes

- Long-text areas now use narrower max widths, increased paragraph spacing, and comfortable line height.
- Professional Summary intro copy now reads: `I work where engineering leadership, architecture, enterprise AI, and product strategy meet accountable execution.`
- The substantive career narrative remains intact.

## 9. Footer changes

- Professional link order: LinkedIn, Résumé, GitHub, Email, RSS.
- `Powered by PostForge` was retained unchanged. No local configuration or license evidence was found requiring or permitting removal as part of this task.
- Footer remains wrapped and usable on mobile.

## 10. Article image mappings

| Article | Image | Alt text |
|---|---|---|
| Choosing a Distributed Cache: Consistency, Availability, Cost and Operational Trade-offs | `/images/covers/choosing-distributed-cache-cover.png` | A distributed cache architecture illustrating consistency, availability, cost, and operational trade-offs. |
| Evaluating Enterprise AI Systems: From Model Accuracy to Operational Trust | `/images/covers/evaluating-enterprise-ai-systems-cover.png` | An enterprise AI evaluation framework covering quality, safety, reliability, explainability, cost, and business impact. |
| Observability for Agentic Systems: Tracing Decisions, Tools, Data and Failure | `/images/covers/observability-agentic-systems-cover.png` | An agentic system workflow showing decisions, tools, data, failures, traces, logs, metrics, and evaluation. |

All three production records use the same asset for cover and Open Graph image with dimensions `1600x900`.

## 11. H1 corrections

- Production validation found no remaining duplicate body H1 in `Git Ignore`.
- Production validation found no remaining duplicate body H1 in `Microservices as APIs`.
- No article body rewrite was needed in this task.

## 12. Content validator before and after

- Initial production content validation: `0 errors`, `0 warnings`.
- Final production content validation after image-alt alignment: `0 errors`, `0 warnings`.
- Local configured database contains no posts; local content validation also completed with `0 errors`, `0 warnings`.

## 13. Remaining warnings

- None from the production content validator.
- None from ESLint after the existing generated coverage warning was already excluded.

## 14. Canonical URL audit

- Published posts checked: `25`.
- Duplicate canonical URLs: none.
- Sitemap missing published canonical posts: none.
- Sitemap duplicate URLs: none.
- Internal sitemap URLs use the canonical `https://www.tgoliveira11.tech` origin when the app is run with production base URL.

## 15. Redirect audit

- Legacy date-root article routes redirect permanently through `src/proxy.ts`.
- Strategic alias redirects are configured in `next.config.ts`.
- Sample checks returned permanent redirects:
  - `/2022-09-16-in-memory-cache` -> `/blog/2022-09-16-in-memory-cache` (`308`)
  - `/blog/text-to-sql-from-demo-to-production` -> canonical Text-to-SQL article (`308`)
  - `/categories/leadership` -> `/categories/engineering-leadership` (`308`)
- No redirect loops or chains were found in the audited samples.

## 16. Date audit

- Future published posts: none.
- `updatedAt < publishedAt`: none.
- Publication dates were not changed by this task.
- Article image alt updates were treated as metadata cleanup; original publication dates were preserved.

## 17. Tag audit

- Public tags checked: `384`.
- Invalid lowercase/kebab-case tags: none.
- Empty tags and duplicate canonical tag issues: none from production validation.
- Alias handling remains centralized in `src/modules/public/editorial-taxonomy.ts`.

## 18. SEO audit

- Homepage, About, article pages, category pages, tag pages, sitemap, robots, RSS, and résumé asset were reviewed.
- About, article, sitemap, robots, and RSS route checks returned HTTP 200 in the local production build.
- Article pages include canonical URLs, Open Graph metadata, Twitter cards, author metadata, category, tags, dates, and image URLs through existing SEO helpers.
- Résumé asset is public but has no HTML page or structured data, as intended.

## 19. Structured-data audit

- Site-level `WebSite` JSON-LD remains emitted from the public layout.
- Person JSON-LD now includes `Enterprise AI Platforms` in `knowsAbout`.
- About page now emits `Person` and `BreadcrumbList`.
- Article pages continue to emit `BlogPosting` and `BreadcrumbList`.
- The résumé PDF is not used as a Person image.

## 20. Sitemap, robots, and feed audit

- Sitemap route returned `application/xml`.
- Robots route returned `text/plain; charset=utf-8`.
- RSS route returned `application/rss+xml; charset=utf-8`.
- Sitemap excludes admin/auth/account/API admin surfaces.
- Robots disallows `/admin`, `/api/admin`, `/api/auth`, and `/api/account`.
- Robots references the canonical sitemap.
- RSS uses canonical article URLs when production base URL is supplied.

## 21. Accessibility changes

- Résumé links use visible text, accessible labels, and the HTML `download` attribute.
- Buttons remain keyboard-focusable with existing focus-visible styling.
- Article cover alt text was made explicit for the three new images.
- About CTAs wrap vertically on mobile.

## 22. Responsive-layout changes

- Mobile navigation now wraps instead of requiring horizontal scrolling.
- Home/About hero padding and title wrapping were tightened for 320px.
- About profile image size was reduced at the smallest breakpoint.
- Featured card title/content gained safer mobile wrapping.
- Chrome DevTools Protocol checks showed no horizontal overflow for Home and About at `320`, `375`, `768`, `1024`, and `1440` widths.

## 23. Performance changes

- No new dependencies were added.
- Résumé is served as a static public PDF with `application/pdf`, `Content-Disposition`, and public cache headers.
- Existing responsive image handling remains in place for article covers.
- No additional analytics vendor or duplicate page-view tracker was introduced.

## 24. Test and build commands

- `npm run test -- src/components/public/site-footer.test.ts src/components/public/google-analytics.test.ts src/modules/public/seo.test.ts src/modules/public/editorial-taxonomy.test.ts src/components/public/site-header.test.ts`
- `npm run validate`
- `npm run build`
- Production `content:validate`
- Local production-build HTTP route checks with `next start -p 3012`
- Chrome DevTools Protocol responsive overflow checks for Home and About

## 25. Test and build results

- Focused tests: `5` files passed, `30` tests passed.
- Full validation: passed.
- Coverage run: `164` files passed, `1088` tests passed.
- Production content validation: `25 posts`, `11 categories`, `454 tags`, `27 assets`; `0 errors`, `0 warnings`.
- HTTP route checks: résumé, three cover images, About, sample article, sitemap, robots, RSS all returned `200`.
- Résumé headers: `application/pdf`; `Content-Disposition: attachment; filename="thiago-goulart-de-oliveira-resume.pdf"`.

## 26. Manual actions

- Per the task instructions, no commit, push, pull request, merge, or deploy was performed.
- To make the résumé asset live in production, this branch must later be committed, merged, and deployed.
- The three article cover files were already present in the repository and their production DB asset alt text was aligned in this task.

## 27. Editorial backlog

The category distribution still leans toward Architecture content. This is an editorial backlog, not a code defect. Future writing should prioritize:

- AI Engineering
- Engineering Leadership
- Technology Strategy

## 28. Risks and assumptions

- Production data checks used the configured production database URL from the conversation without printing it.
- The local production server needed production-like auth rate-limit env overrides for `next start`.
- Local `.env.local` can point metadata endpoints at localhost; production validation should supply `APP_BASE_URL=https://www.tgoliveira11.tech`.
- The original résumé source remains outside the public site and is not referenced from rendered HTML.
