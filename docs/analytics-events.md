# Analytics events

This site uses the existing GA4 public integration and does not add a second page-view tracker.

## Provider

- Provider: Google Analytics / Google tag.
- Public-only loading: `src/app/(public)/layout.tsx`.
- Measurement ID source: `src/modules/public/google-analytics.ts`.
- Page views: emitted manually with `send_page_view: false` to avoid duplicates during App Router navigation.
- UTM fields captured when present: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`.

## Events

| Event | Trigger | Key parameters |
|---|---|---|
| `page_view` | Public route navigation | `page_location`, `page_path`, `page_referrer`, `page_title`, UTM fields |
| `view_search_results` | `/search?q=...` public search | `search_term`, UTM fields |
| `about_page_visit` | `/about` route view | `page_location`, UTM fields |
| `entry_article` | First session entry on `/blog/[slug]` from external/no referrer | `article_path`, `page_referrer`, UTM fields |
| `home_explore_work_click` | Home hero primary CTA | `component`, `link_url`, `link_text` |
| `home_featured_insight_click` | Featured Insight card/title/read link | `component`, `article_slug`, `link_url`, `link_text` |
| `about_cta_click` | Home hero About CTA | `component`, `link_url`, `link_text` |
| `about_work_cta_click` | About page work CTA | `component`, `link_url`, `link_text` |
| `about_selected_work_click` | About selected work article card | `component`, `article_slug`, `link_url`, `link_text` |
| `linkedin_cta_click` | LinkedIn CTA in hero, About, or footer | `component`, `link_url`, `link_text` |
| `resume_download_click` | Résumé CTA when configured | `component`, `link_url`, `link_text` |
| `github_cta_click` | GitHub CTA in About/footer | `component`, `link_url`, `link_text` |
| `email_contact_click` | Footer email link | `component`, `link_url`, `link_text` |
| `article_cta_click` | Article LinkedIn CTA | `component`, `link_url`, `link_text` |
| `article_author_about_click` | Article author-box About link | `component`, `link_url`, `link_text` |
| `related_article_click` | Related article card/title/read link | `component`, `article_slug`, `link_url`, `link_text` |
| `article_card_click` | Generic article card/title/read link | `component`, `article_slug`, `link_url`, `link_text` |
| `article_scroll_depth` | Article scroll at 25%, 50%, and 75% | `article_slug`, `scroll_depth` |
| `article_completion` | Article reaches approximately 90% or page bottom | `article_slug`, `scroll_depth` |
| Web Vitals metric names | `useReportWebVitals` callback | `metric_name`, `metric_value`, `metric_rating`, `metric_navigation_type` |

## Notes

- Internal canonical URLs are not modified with UTM parameters.
- Campaign UTMs should be added only to campaign/source links where appropriate.
- The résumé CTA is intentionally conditional because no verified résumé URL is committed in the repository. Set `NEXT_PUBLIC_RESUME_URL` or `RESUME_URL` to enable it.
