# PostForge UI/UX skill

Guidelines for admin and authoring surfaces in PostForge. Use this when building or refactoring admin UI, especially the post editor.

## Core principles

1. **Writing first** — Title, slug, excerpt, and Markdown content are the primary workflow. Everything else is secondary.
2. **Visible primary actions** — Save, preview, and publish belong in a sticky header or persistent action bar.
3. **Progressive disclosure** — SEO, scheduling details, and advanced options stay collapsed or in the sidebar until needed.
4. **Safe publishing** — Never publish without saving current editor state. Never hide validation errors.
5. **No duplicate controls** — One place for featured/pinned, one place for schedule, one save/publish flow.
6. **Destructive separation** — Archive and delete live in a danger zone, far from save/publish.
7. **Functional over decorative** — Clean spacing, clear labels, no heavy UI libraries.
8. **Desktop authoring** — Optimize for wide screens; stack gracefully on tablet/mobile.
9. **Accessibility** — Labels, focus states, semantic headings, keyboard-accessible tabs.
10. **Preserve behavior** — UI changes must not break server actions, validations, or asset associations.

## Admin page layout

- Page title is minimal on editor routes; the editor supplies its own sticky header.
- Use `max-w-7xl` or full-width grid for editor workspaces.
- Cards (`EditorCard`) group related sidebar settings with consistent padding and headings.

## Post editor layout

```
┌─────────────────────────────────────────────────────────────┐
│ Sticky header: back · status · title · slug · save · publish│
├──────────────────────────────┬──────────────────────────────┤
│ Main column (writing)        │ Sidebar (metadata)           │
│ · Title                      │ · Status card                │
│ · Slug                       │ · Assets (compact)           │
│ · Excerpt                    │ · Taxonomy                   │
│ · Markdown (write/preview)   │ · Promotion                  │
│                              │ · SEO (collapsed)            │
│                              │ · Schedule                   │
│                              │ · Danger zone                │
└──────────────────────────────┴──────────────────────────────┘
```

## Sticky action bar

- Stays visible while scrolling (`position: sticky; top: 0`).
- Primary: **Save draft** / **Save changes**, **Preview**, **Save and publish**.
- Secondary: schedule, featured, pin via sidebar — not duplicated in the header.
- Use `form="post-editor-form"` on header buttons so they submit the main editor form.
- Show pending state and last-saved feedback from action results.

## Save / publish workflow

- Single form (`id="post-editor-form"`) owns all fields submitted to `updatePostAction`.
- `intent=save` → save only.
- `intent=publish` → save then publish the **same** post ID.
- Cover/OG asset IDs are **not** in the save form; they are set via asset actions and must not be cleared on save.
- List-view “Publish saved version” remains for posts already persisted without opening the editor.

## Status and feedback

- Status badge always visible in header and status card.
- Show updated timestamp, published/scheduled dates, public URL when relevant.
- Success and error banners use `role="alert"` and high-contrast colors.

## Assets panel

- Compact sidebar panel: cover/OG thumbnails, upload button, recent thumbnails, insert actions.
- Do not place a large upload form above the title field.
- Empty state: explain cover, OG, and Markdown insert in one sentence.

## Markdown editor

- Tabs: **Write**, **Preview**, **Split** (desktop split; stack on small screens).
- Helper text: “Supports Markdown. Images can be inserted from the assets panel.”
- Textarea must keep `name="contentMarkdown"` for form submission.

## SEO settings

- Collapsed `<details>` by default.
- Summary shows completion hint (configured vs not set).

## Promotion (featured / pinned)

- Single card with checkboxes in the main save form.
- Pinned priority visible only when pinned is checked.

## Schedule

- Separate form calling `schedulePostAction` (cannot nest inside main form).
- Explain that auto-publish cron may be deferred.

## Danger zone

- Archive at bottom of sidebar with confirmation.
- Visually distinct border/background.

## Taxonomy (category & tags)

- Single **Taxonomy** card in the sidebar.
- **Category:** searchable combobox, single-select, inline create with Enter.
- **Tags:** creatable multi-select with chips; type to search, Enter/Tab/comma/space to add.
- Keyboard: arrow keys navigate suggestions; Backspace on empty input removes last chip.
- Create-or-reuse: normalized names, slug from existing utility, duplicate slugs/names reuse existing records.
- Helper text explains category (broad) vs tags (specific).

## Deferred

- Auto-publish cron UI beyond schedule datetime
- Rich-text WYSIWYG editor
- Autosave revisions

---

## Public site UI

Public pages should feel **editorial and reader-focused**, not like the admin panel.

### Core principles

1. **Discovery first** — Home prioritizes reading, search, and topic exploration.
2. **Clear hierarchy** — Hero → featured/latest post → recent posts → topics.
3. **Curated taxonomy** — Limit visible tags on cards; group categories and tags in intentional “Explore topics” sections.
4. **No duplication** — Featured post appears once; recent list excludes it.
5. **Published only** — Public surfaces never show drafts, scheduled, unpublished, or archived posts.
6. **Wider reading layout** — Use `max-w-6xl` (~1152px) for public content; keep line length readable in prose blocks.
7. **Card restraint** — Cover images use consistent aspect ratios; hover states and borders differentiate cards from admin forms.

### Home page structure

```
┌─────────────────────────────────────────────────────────────┐
│ Header: logo · nav (Blog, Tags, Categories, Search) · theme │
├─────────────────────────────────────────────────────────────┤
│ Hero: title · description · CTAs · search                   │
├─────────────────────────────────────────────────────────────┤
│ Featured card: pinned > featured > latest (single post)     │
├─────────────────────────────────────────────────────────────┤
│ Recent posts grid (excludes featured) · View all posts      │
├─────────────────────────────────────────────────────────────┤
│ Explore topics: category cards + tag pills (limited)        │
├─────────────────────────────────────────────────────────────┤
│ Footer: description · nav · RSS                             │
└─────────────────────────────────────────────────────────────┘
```

### Post cards

- Default variant for `/blog` and search listings.
- Compact variant for home recent grid.
- Show at most 4 tags; use `+N more` when truncated.
- Category as subtle label; promotion badges only on blog/search default cards.
- Accessible link labels for cover images and read links.

### Empty states

- When no published posts: polished empty state only — no topics section.
- Copy: “No posts published yet” with short explanation.

### Components

- `HomeHero`, `FeaturedPostCard`, `RecentPostsSection`, `TopicsSection`, `PublicSectionHeading`
- `PublicPageShell`, `PublicPageHero`, `PublicEmptyState`, `PublicPagination`, `PublicBackLink`
- `TopicPill`, `TopicCard`, `ArticleHeader`, `ArticleMeta`, `ArticleNavigation`, `SiteNav`
- Helpers in `public-display.ts`: `pickFeaturedPost`, `splitHomePosts`, `limitTagsForDisplay`
- Helpers in `search.ts`: `normalizeSearchQuery`, `hasSearchQuery`, `formatSearchResultLabel`

### Public page shell pattern

All human-facing public pages use:

```
PublicLayout
  └─ PublicPageShell
       ├─ PublicPageHero (title, description, optional search/actions)
       ├─ PublicBackLink (detail pages)
       └─ content section (PostList, TagList, CategoryList, article)
```

- Blog listing: hero + search + post list + pagination (`/blog?page=N`)
- Page size on `/blog` from `PUBLIC_POSTS_PAGE_SIZE` env (default `5`, max `50`)
- Home page: featured hero + recent grid (no pagination; recent count from `blog_settings.postsPerPage`)

### Manual public order (admin)

- Set on `/admin/posts` per published post (`publicOrder` column)
- New drafts receive the next available `publicOrder` automatically
- Lower numbers appear first on home recent list, `/blog`, tag, and category pages
- Posts without manual order fall back to `publishedAt DESC`
- **Not** the same as pinned/featured — those control home hero promotion only
- Schedule action is not shown on `/admin/posts`; use the post editor to schedule
- Admin list filters: status, category, tag (`?tagId=`), search, sort
- RSS feed stays `publishedAt DESC`; search stays relevance / date

### Public page layout (detail/index)

- Post detail: back link + article header + `prose-article` body + prev/next nav
- Search: hero search; empty state with recent posts; results with count label
- Tags/Categories index: hero + pill/card grid
- Tag/Category detail: back link + hero + post list
- Not found: `PublicEmptyState` with action links inside `PublicLayout`

### Article page layout

- Shell width: `max-w-6xl` (layout); article column: `max-w-3xl`
- `ArticleHeader`: category badge, title, excerpt, cover (16:9), all tags as pills
- `ArticleMeta`: published, updated (when newer than published), reading time
- Body: `.prose.prose-article` for final published reading experience

### Topic index/detail layout

- Tags index: `TopicPill` grid — show all public tags, no fake counts
- Categories index: `TopicCard` grid with optional description
- Detail pages: hero with context line + `PostList` with default cards

### Tag display rules

| Surface | Tag behavior |
|---------|----------------|
| Home cards | Max 4 tags + “+N more” |
| Blog/search cards | Max 4 tags + “+N more” |
| Post detail | All tags, pill style below cover |
| Tags index | All tags with published posts |

### Empty state pattern

- `PublicEmptyState`: dashed border card, title, description, optional actions
- Taxonomy indexes: inline empty when no published taxonomy
- Post lists: empty when no posts in context
- Not found: friendly copy + Go home / Browse posts / Search

### Header navigation

- `SiteNav` (client): active state for Blog, Tags, Categories, Search
- Home `/` does not highlight nav items
- Sticky header with backdrop blur
