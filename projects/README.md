# Portfolio V5 Project Guide

V5 project metadata lives in `data/projects.mjs`. Add or update project definitions there; do not duplicate canonical metadata in `js/projects.js`, which renders the homepage from that data.

## Project Details

Set `detail.status` to `"complete"` when a project has a generated Project Detail. Complete details route from the homepage to `work/<slug>/` and are rendered by `scripts/project-detail-template.mjs`.

Generate one detail with:

```sh
node scripts/generate-site.mjs <slug>
```

Generate all complete details with:

```sh
node scripts/generate-site.mjs
```

The output is `work/<slug>/index.html`. Do not edit generated pages manually; update the canonical data or shared renderer, then regenerate.

## Interactive Demos and Legacy Files

Put V5 embedded interactive demo files in `demos/<slug>/` and reference them from the project’s canonical detail modules. Keep any required legacy or historical artifacts under `projects/<slug>/`; `projects/` may remain useful for compatibility, but it is not the canonical V5 Project Detail system.

For module fields, rendering behavior, and generator details, see [`docs/PROJECT-DETAILS.md`](../docs/PROJECT-DETAILS.md).
