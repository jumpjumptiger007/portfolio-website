import { projectLiveUrl } from "../data/projects.mjs";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

const siteAssetHref = (path) => `../../${path}`;

function renderActions(project) {
  const actions = [];
  if (project.githubUrl) {
    actions.push(`<a class="project-action" href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer">View source <span aria-hidden="true">↗</span></a>`);
  }
  if (project.liveUrl && project.detail?.actions?.liveDemo === true) {
    const external = /^https?:\/\//i.test(project.liveUrl);
    const href = external ? project.liveUrl : projectLiveUrl(project, { fromDetail: true });
    actions.push(`<a class="project-action" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>Live demo <span aria-hidden="true">↗</span></a>`);
  }
  return actions.length ? `<nav class="project-actions" aria-label="Project actions">${actions.join("")}</nav>` : "";
}

function renderSignal(project, module, index) {
  const headingId = `detail-signal-${project.slug}-${index}`;
  const stages = module.stages.map((stage, stageIndex) =>
    `${stageIndex ? ' <span aria-hidden="true">→</span> ' : ""}${escapeHtml(stage)}`).join("");
  return `<section class="signal-section" aria-labelledby="${headingId}"><div class="signal-heading"><h2 id="${headingId}">${escapeHtml(module.label)}</h2><p>${escapeHtml(module.title)}</p></div><div class="signal-terminal"><p class="terminal-command">${escapeHtml(module.title)}</p><p class="workflow-readout">${stages}</p></div></section>`;
}

function renderCopy(module, className) {
  const paragraphs = module.paragraphs.map((paragraph) => `<p class="project-copy">${escapeHtml(paragraph)}</p>`).join("");
  return `<section class="detail-section ${className}" aria-labelledby="${module.id}"><div class="section-label"><p>${escapeHtml(module.label)}</p></div><div class="section-content"><h2 id="${module.id}">${escapeHtml(module.title)}</h2>${paragraphs}</div></section>`;
}

function renderWorkflow(module) {
  const steps = module.steps.map((step, index) => `<li><span class="flow-index">${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></li>`).join("");
  return `<section class="detail-section system-section" aria-labelledby="${module.id}"><div class="section-label"><p>${escapeHtml(module.label)}</p></div><div class="section-content"><h2 id="${module.id}">${escapeHtml(module.title)}</h2><ol class="workflow-list">${steps}</ol></div></section>`;
}

function renderOutput(module) {
  const items = module.items.map((item) => `<div><span>${escapeHtml(item.title)}</span><p>${escapeHtml(item.text)}</p></div>`).join("");
  const caption = module.caption ? `<figcaption>${escapeHtml(module.caption)}</figcaption>` : "";
  return `<section class="detail-section media-section" aria-labelledby="${module.id}"><div class="section-label"><p>${escapeHtml(module.label)}</p></div><div class="section-content"><h2 id="${module.id}">${escapeHtml(module.title)}</h2><figure class="media-slot dashboard-output"><div class="queue-map">${items}</div>${caption}</figure></div></section>`;
}

function renderImage(module) {
  const caption = module.caption ? `<figcaption>${escapeHtml(module.caption)}</figcaption>` : "";
  return `<section class="detail-section media-section" aria-labelledby="${module.id}"><div class="section-label"><p>${escapeHtml(module.label)}</p></div><div class="section-content"><h2 id="${module.id}">${escapeHtml(module.title)}</h2><figure class="media-slot project-image"><img src="${escapeHtml(siteAssetHref(module.src))}" alt="${escapeHtml(module.alt)}">${caption}</figure></div></section>`;
}

function renderInteractive(module) {
  const caption = module.caption ? `<figcaption class="interactive-caption">${escapeHtml(module.caption)}</figcaption>` : "";
  return `<section class="detail-section media-section" aria-labelledby="${module.id}"><div class="section-label"><p>${escapeHtml(module.label)}</p></div><div class="section-content"><h2 id="${module.id}">${escapeHtml(module.title)}</h2><figure class="interactive-frame"><iframe src="${escapeHtml(siteAssetHref(module.src))}" title="${escapeHtml(module.frameTitle)}" loading="lazy" sandbox="allow-scripts"></iframe>${caption}</figure></div></section>`;
}

function renderSystem(module) {
  const rows = module.rows.map((row) => `<div class="system-visual-row">${row.map((node, index) => `${index ? '<span class="system-visual-arrow" aria-hidden="true">→</span>' : ""}<span class="system-visual-node">${escapeHtml(node)}</span>`).join("")}</div>`).join("");
  const caption = module.caption ? `<p class="system-visual-caption">${escapeHtml(module.caption)}</p>` : "";
  return `<section class="detail-section system-section" aria-labelledby="${module.id}"><div class="section-label"><p>${escapeHtml(module.label)}</p></div><div class="section-content"><h2 id="${module.id}">${escapeHtml(module.title)}</h2><div class="system-visual">${rows}</div>${caption}</div></section>`;
}

function renderModule(project, module, index) {
  const current = { ...module, id: `detail-${project.slug}-${index}` };
  switch (current.type) {
    case "signal": return renderSignal(project, current, index);
    case "overview": return renderCopy(current, "overview-section");
    case "technical": return renderCopy(current, "technical-section");
    case "workflow": return renderWorkflow(current);
    case "output": return renderOutput(current);
    case "image": return renderImage(current);
    case "interactive": return renderInteractive(current);
    case "system": return renderSystem(current);
    default: throw new Error(`Unsupported detail module: ${current.type}`);
  }
}

export function renderProjectDetail(project) {
  const title = escapeHtml(project.title);
  const summary = escapeHtml(project.summary);
  const modules = project.detail.modules.map((module, index) => renderModule(project, module, index)).join("\n");
  const status = escapeHtml(project.status);
  const year = escapeHtml(project.year);
  const titleMarkup = project.detail.titleLines?.length === 2
    ? `${escapeHtml(project.detail.titleLines[0])}<br><span>${escapeHtml(project.detail.titleLines[1])}</span>`
    : title;
  const titleLayoutClass = project.detail.titleLines?.some((line) => line.length > 12)
    ? "project-title-layout project-title-layout-long"
    : "project-title-layout";
  const statusClass = `status-${project.status}`;

  return `<!doctype html>
<!-- Generated by scripts/generate-site.mjs — do not edit directly. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${summary}">
  <title>${title} — Yiqiang Adrian Liu</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wdth,wght@75..100,400..700&display=swap" rel="stylesheet">
  <link rel="icon" href="../../assets/favicon/favicon.ico" sizes="any">
  <link rel="stylesheet" href="../../css/project-detail.css">
</head>
<body class="project-detail-page">
  <a class="skip-link" href="#main">Skip to project details</a>
  <header class="detail-header">
    <a class="detail-brand" href="../../index.html#top" aria-label="Yiqiang Adrian Liu — home">
      <img src="../../assets/brand/yal-mark.svg" alt="">
    </a>
    <a class="back-link" href="../../index.html#project-index"><span aria-hidden="true">←</span> Return to work</a>
  </header>
  <main id="main">
    <article>
      <header class="project-heading">
        <div class="project-meta-row">
          <p class="project-class"><span class="project-number">${String(project.number).padStart(2, "0")}</span><span>${escapeHtml(project.type)}</span></p>
          <dl class="project-facts">
            <div><dt>Status</dt><dd class="${statusClass}"><i aria-hidden="true"></i>${status}</dd></div>
            <div><dt>Year</dt><dd>${year}</dd></div>
          </dl>
        </div>
        <div class="${titleLayoutClass}">
          <h1 id="project-title">${titleMarkup}</h1>
          <div class="project-summary-group">
            <p class="project-summary">${summary}</p>
${renderActions(project) ? renderActions(project).replace(/^/gm, "            ") : ""}
          </div>
        </div>
      </header>
${modules}
    </article>
  </main>
  <footer class="detail-footer footer-no-next">
    <a class="footer-return" href="../../index.html#project-index"><span aria-hidden="true">↖</span> Return to project index</a>
    <a class="footer-identity" href="../../index.html#top" aria-label="Yiqiang Adrian Liu — home">
      <img src="../../assets/brand/yal-mark.svg" alt="">
      <span>Yiqiang Adrian Liu<br>Independent Developer &amp; Builder</span>
    </a>
  </footer>
</body>
</html>
`;
}

export const supportedDetailModules = new Set(["signal", "overview", "technical", "workflow", "output", "image", "interactive", "system"]);
