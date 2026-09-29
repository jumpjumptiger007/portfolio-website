import { projectsData } from "../data/projects.mjs";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

const isExternal = (url) => /^https?:\/\//i.test(url);
const externalAttributes = (url) => isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
const detailHref = (project) => `${escapeHtml(project.slug)}/`;

function liveHref(project) {
  if (!project.liveUrl) return null;
  if (isExternal(project.liveUrl)) return project.liveUrl;
  return `../${project.liveUrl.replace(/^\/+/, "")}`;
}

function renderActions(project) {
  const detail = `<a href="${detailHref(project)}">DETAIL <span aria-hidden="true">↗</span></a>`;
  const source = project.githubUrl
    ? `<a href="${escapeHtml(project.githubUrl)}"${externalAttributes(project.githubUrl)}>SOURCE <span aria-hidden="true">↗</span></a>`
    : "";
  const liveUrl = project.detail?.actions?.liveDemo === true ? liveHref(project) : null;
  const live = liveUrl
    ? `<a href="${escapeHtml(liveUrl)}"${externalAttributes(liveUrl)}>LIVE <span aria-hidden="true">↗</span></a>`
    : "";
  return `<nav class="work-row-actions" aria-label="${escapeHtml(project.title)} links">${detail}${source}${live}</nav>`;
}

function renderProject(project) {
  return `<article class="work-row status-${escapeHtml(project.status)}"><span class="work-row-number">${String(project.number).padStart(2, "0")}</span><div class="work-row-project"><h3><a href="${detailHref(project)}">${escapeHtml(project.title)}</a></h3><p>${escapeHtml(project.summary)}</p></div><span class="work-row-type">${escapeHtml(project.type)}</span><span class="work-row-year">${escapeHtml(project.year)}</span><span class="work-row-status">${escapeHtml(project.status)}</span>${renderActions(project)}</article>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const target = document.querySelector("#work-rows");
  if (!target) return;
  const projects = projectsData.filter((project) => !project.hidden).sort((left, right) => left.number - right.number);
  target.innerHTML = projects.map(renderProject).join("");
  const count = document.querySelector("#work-count");
  if (count) count.textContent = String(projects.length).padStart(2, "0");
});
