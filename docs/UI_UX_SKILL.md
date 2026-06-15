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

## Deferred

- Inline tag creation
- Auto-publish cron UI beyond schedule datetime
- Rich-text WYSIWYG editor
- Autosave revisions
