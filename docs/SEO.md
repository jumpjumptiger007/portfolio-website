# Technical SEO

Production domain: `https://yliu.tech`. Canonicals are absolute HTTPS URLs on `yliu.tech`, with directory trailing slashes and no query strings or fragments. Public namespaces are `/`, the comprehensive `/work/` directory, and `/work/<slug>/` Project Details.

`data/site.mjs` provides site identity and canonical helpers. `data/projects.mjs` remains the source of project content, visibility, and detail completeness. Project SEO defaults to `<project.title> — Yiqiang Adrian Liu` and `project.summary`. Optional `seo` fields are `title`, `description`, `image` (HTTPS URL or safe site-local path), and `indexable` (boolean). No current overrides are populated.

A complete Project Detail is indexable only when it is visible (`hidden !== true`) and `seo.indexable !== false`. Hidden or explicitly non-indexable complete pages emit `noindex,follow` and are excluded from the sitemap. Prototype and archived statuses do not determine indexability: Samantha AI Assistant and Local Voice Assistant remain eligible.

Personal Tech Magazine's detail canonical is `/work/personal-tech-magazine/`; its live URL is the homepage. These separate documents retain separate self-canonicals. Live and GitHub URLs never determine canonicals.

Homepage JSON-LD describes the WebSite and Person. The Work directory describes a CollectionPage with Home/Work breadcrumbs. Generated details use CreativeWork plus Home/Work/current-project breadcrumbs derived from canonical titles. Project images are included only when explicitly supplied. Homepage and Work metadata remain explicitly authored in their HTML heads; the validator checks consistency.

Run `node scripts/generate-site.mjs` to regenerate all complete details, `sitemap.xml`, and `robots.txt`. Passing a slug regenerates that detail and still refreshes the complete sitemap. Sitemap routes derive from current data and include the homepage, Work directory, and eligible details. No fabricated modification dates are emitted. `robots.txt` permits crawling and advertises `https://yliu.tech/sitemap.xml`.

Seven support entries use `noindex,follow`: demos/bulk-email-sender, demos/password-generator, demos/qpsk-visualization, projects/cable, projects/password-generator, projects/pollen-alert-germany, and projects/qpsk-modulation (each index.html). They stay crawlable so crawlers can read noindex; robots.txt does not block them. They have no cross-page canonical or redirect.

Run `node scripts/check-seo.mjs` to validate metadata, JSON-LD, breadcrumbs, discovery files, support-page directives, and stale architecture references. It derives the expected project set from current data.

## Post-deployment checklist

- Verify `/robots.txt` and `/sitemap.xml` on `https://yliu.tech`.
- Inspect homepage and `/work/` self-canonicals.
- Inspect several Project Detail canonicals, including Personal Tech Magazine.
- Validate homepage, Work directory, and several project JSON-LD blocks.
- Add or verify the yliu.tech Search Console property.
- Submit `https://yliu.tech/sitemap.xml`.
- Use URL Inspection for the homepage, Work directory, and important projects.
- Monitor indexing before content-level SEO refinement.

Search Console configuration and deployed indexing behavior require post-deployment verification.
