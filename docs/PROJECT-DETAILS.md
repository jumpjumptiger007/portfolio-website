# Project Detail source and generation

`data/projects.mjs` is the canonical project definition source for both the homepage renderer and Project Detail generator. Homepage metadata stays in this file; a completed detail is represented by `detail: { status: "complete", modules: [...] }`.

Generate every completed detail page with:

```sh
node scripts/generate-site.mjs
```

Or generate one page by slug:

```sh
node scripts/generate-site.mjs job-search-agent
```

The renderer lives in `scripts/project-detail-template.mjs`. Generated pages are written to `work/<slug>/index.html`; do not edit those outputs directly. Keep legacy demos under `projects/<slug>/` and V5 embedded demos under `demos/<slug>/`.

## Interactive modules

Use an `interactive` module for a local, isolated interactive artifact. It requires `type`, `label`, `title`, `src`, and `frameTitle`; `caption` is optional. `src` must be a site-root-relative local file that exists inside the repository. The renderer embeds it in a lazy, script-only sandboxed iframe. Use this module when interaction materially supports the Project Detail without adding project-specific renderer logic.

## Image modules

Use an `image` module for a local editorial image. It requires `type`, `label`, `title`, `src`, `alt`, `width`, and `height`; `caption` is optional. `width` and `height` must be verified positive integer intrinsic pixel dimensions from the source asset. Do not estimate or guess them. The shared renderer emits the intrinsic dimensions with `loading="lazy"` and `decoding="async"`.

## Report tables

Use `report-table` for structured report/output evidence. Required fields are `type`, `label`, `title`, a non-empty string list `headers`, and a non-empty array `rows`. Every row must have exactly as many cells as headers. Optional `note` and `caption` are non-empty explanatory text; illustrative data must be explicitly identified as non-live in `note`.

Cells are non-empty strings or strict `{ text: "Low (1)", emphasis: true }` objects. Object cells require non-empty `text` and boolean `emphasis`; no other keys are supported. `emphasis: false` renders normal text. Emphasis marks meaningful status with semantic strong text and the shared signal color; it is not a styling configuration. All content is escaped, never interpreted as HTML.

The shared renderer emits a semantic table with column headers and a labelled, keyboard-focusable horizontal scroll region. CSS preserves readable columns on small screens. Keep this module factual and compact; do not use it as a general layout grid or add data-driven colors, classes, links, or HTML cells.
