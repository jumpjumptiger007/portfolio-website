import { projectsData } from "../data/projects.mjs";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

function renderProject(project) {
  const href = `${escapeHtml(project.slug)}/`;
  return `<article class="project-card status-${escapeHtml(project.status)}" data-reveal>
    <a class="card-main" href="${href}">
      <div class="index-meta"><p class="card-no">${String(project.number).padStart(2, "0")}</p>
        <div class="card-head"><span>${escapeHtml(project.type)}</span><b>${escapeHtml(project.status)}</b></div></div>
      <div class="index-copy"><h3 class="card-title">${escapeHtml(project.title)}</h3><p class="card-summary">${escapeHtml(project.summary)}</p></div>
    </a>
    <a class="card-cta" href="${href}" aria-label="Read the ${escapeHtml(project.title)} article"><span>READ ARTICLE</span><span aria-hidden="true">↗</span></a>
  </article>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const target = document.querySelector("#work-cards");
  if (!target) return;
  const projects = projectsData.filter((project) => !project.hidden).sort((left, right) => Number(left.number) - Number(right.number));
  target.innerHTML = projects.map(renderProject).join("");
  const count = document.querySelector("#work-count");
  if (count) count.textContent = String(projects.length).padStart(2, "0");
});
