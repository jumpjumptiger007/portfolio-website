# Portfolio V5

This repository contains a static personal technical portfolio and magazine for software, tools, systems, and experiments.

## Repository structure

- `index.html` — homepage
- `css/styles.css` — homepage styles
- `js/projects.js` — homepage project rendering
- `data/projects.mjs` — canonical project data
- `scripts/project-detail-template.mjs` — shared Project Detail renderer
- `scripts/generate-site.mjs` — Project Detail generator
- `work/<slug>/index.html` — generated Project Details
- `demos/<slug>/` — embedded V5 project interactions
- `projects/<slug>/` — legacy and historical project artifacts
- `docs/PROJECT-DETAILS.md` — Project Detail authoring guide
- `DESIGN.md` — visual source of truth
- `assets/brand/yal-mark.svg` — production brand mark

## Project Details

The repository has 9 canonical projects and 8 generated Project Details. Portfolio V1 remains archive/index-only. InterDemTV has a separate public Live Demo. Bulk Email Sender, QPSK Visualization, and Password Generator include embedded V5 interactions.

Generate all complete Project Details:

```sh
node scripts/generate-site.mjs
```

Generate one Project Detail:

```sh
node scripts/generate-site.mjs <slug>
```

Files under `work/<slug>/index.html` are generated output. Update the canonical data or shared renderer, then regenerate; do not edit generated pages manually.

## Hosting and contact

The site is static HTML, CSS, and JavaScript and is compatible with GitHub Pages. `CNAME` contains `yliu.tech`. The publishing source branch is not specified in this repository; verify the repository's Pages settings for the active source.

Contact: [contact@yliu.tech](mailto:contact@yliu.tech). V5 does not use a contact backend.
