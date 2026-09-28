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
