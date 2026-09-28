import { homepageProjectUrl, projectsData } from "../data/projects.mjs";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

const externalAttributes = (url) => /^https?:\/\//i.test(url)
  ? ' target="_blank" rel="noopener noreferrer"'
  : "";

const linkFor = (project, label, className) => {
  const href = homepageProjectUrl(project);
  return `<a class="${className}" href="${escapeHtml(href)}"${externalAttributes(href)}>${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
};

function renderFeatured(project) {
  const target = document.querySelector("#featured-project");
  if (!target || !project) return;
  const headline = project.featureHeadline.map((line, index) =>
    `<span class="${index === 1 ? "green" : ""}">${escapeHtml(line)}</span>`).join("");
  const tags = project.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
  const flow = project.featureFlow.map((step, index) =>
    `<li><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(step)}</strong>${index < project.featureFlow.length - 1 ? '<i aria-hidden="true">→</i>' : ""}</li>`).join("");

  target.innerHTML = `<div class="feature-copy"><p class="feature-count">${String(project.number).padStart(2, "0")}</p><h2 id="featured-title">${headline}</h2><p class="feature-summary">${escapeHtml(project.summary)}</p><ul class="project-tags">${tags}</ul><div class="feature-actions">${linkFor(project, "VIEW PROJECT", "feature-link")}</div></div><figure class="feature-flow" aria-labelledby="feature-flow-title"><figcaption id="feature-flow-title">HOW INTERDEMTV MOVES</figcaption><ol>${flow}</ol><p>Channel logic for finding a stranger next thing.</p></figure>`;
}

function systemArticle(project, className) {
  return `<article class="${className}"><p class="project-number">0${project.number} / ${escapeHtml(project.type.toUpperCase())}</p><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p>${linkFor(project, "OPEN SYSTEM", "system-link")}</article>`;
}

function renderSystems(projects) {
  const target = document.querySelector("#selected-systems");
  if (!target) return;
  const [primary, ...secondary] = projects;
  if (!primary) return;
  target.innerHTML = `<div class="systems-layout"><article class="system-primary"><h3>CODEX PROVIDER <span>SWITCHER</span></h3><p>${escapeHtml(primary.summary)}</p><div class="terminal-visual" aria-label="Provider switcher terminal visual"><code><b>$ codex-provider status</b><br>provider: openai/chatgpt<br>backup: exact restore available<br><br><b>✓ CONFIGURATION HEALTHY</b></code></div></article><div class="systems-stack">${secondary.map((project) => systemArticle(project, "system-secondary")).join("")}</div></div>`;
}

function renderIndex(projects) {
  const target = document.querySelector("#project-rows");
  if (!target) return;
  target.innerHTML = projects.map((project) => {
    const href = homepageProjectUrl(project);
    return `<a class="project-row status-${escapeHtml(project.status)}" href="${escapeHtml(href)}"${externalAttributes(href)} aria-label="Open ${escapeHtml(project.title)}"><span class="row-number">${String(project.number).padStart(2, "0")}</span><span class="row-title">${escapeHtml(project.title)}<small>${escapeHtml(project.type)}</small></span><span class="row-status">${escapeHtml(project.status)}</span><span class="row-year">${escapeHtml(project.year)}</span><span class="row-arrow" aria-hidden="true">↗</span></a>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderFeatured(projectsData.find((project) => project.featured));
  renderSystems(projectsData.filter((project) => project.selectedSystem));
  renderIndex(projectsData.filter((project) => !project.hidden));
});
