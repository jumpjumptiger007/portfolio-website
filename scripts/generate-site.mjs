import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { hasCompleteDetail, projectsData } from "../data/projects.mjs";
import { renderProjectDetail, supportedDetailModules } from "./project-detail-template.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const projectStatuses = new Set(["active", "live", "prototype", "archived"]);

function requireText(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string.`);
}

function requireTextList(value, label) {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must contain at least one item.`);
  value.forEach((item, index) => requireText(item, `${label}[${index}]`));
}

function validateModule(module, label) {
  if (!module || typeof module !== "object" || Array.isArray(module)) throw new Error(`${label} must be an object.`);
  if (!supportedDetailModules.has(module.type)) throw new Error(`${label} has unsupported type "${module.type}".`);
  requireText(module.title, `${label}.title`);
  requireText(module.label, `${label}.label`);

  if (["overview", "technical"].includes(module.type)) {
    requireTextList(module.paragraphs, `${label}.paragraphs`);
  } else if (module.type === "signal") {
    requireTextList(module.stages, `${label}.stages`);
  } else if (module.type === "workflow") {
    if (!Array.isArray(module.steps) || module.steps.length === 0) throw new Error(`${label}.steps must contain at least one step.`);
    module.steps.forEach((step, index) => {
      requireText(step?.title, `${label}.steps[${index}].title`);
      requireText(step?.text, `${label}.steps[${index}].text`);
    });
  } else if (module.type === "output") {
    if (!Array.isArray(module.items) || module.items.length === 0) throw new Error(`${label}.items must contain at least one item.`);
    module.items.forEach((item, index) => {
      requireText(item?.title, `${label}.items[${index}].title`);
      requireText(item?.text, `${label}.items[${index}].text`);
    });
  } else if (module.type === "image") {
    requireText(module.src, `${label}.src`);
    requireText(module.alt, `${label}.alt`);
    const imagePath = path.resolve(root, module.src);
    const relative = path.relative(root, imagePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`${label}.src must stay inside the site root.`);
  } else if (module.type === "interactive") {
    requireText(module.src, `${label}.src`);
    requireText(module.frameTitle, `${label}.frameTitle`);
    if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(module.src) || module.src.startsWith("/") || module.src.split("/").includes("..") || module.src.includes("\\") || /[?#]/.test(module.src)) {
      throw new Error(`${label}.src must be a site-root-relative local path without traversal.`);
    }
    const interactivePath = path.resolve(root, module.src);
    const relative = path.relative(root, interactivePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`${label}.src must stay inside the site root.`);
  } else if (module.type === "system") {
    if (!Array.isArray(module.rows) || module.rows.length === 0) throw new Error(`${label}.rows must contain at least one row.`);
    module.rows.forEach((row, index) => requireTextList(row, `${label}.rows[${index}]`));
  }

  if (module.caption !== undefined) requireText(module.caption, `${label}.caption`);
}

export function validateProjectDefinitions(projects) {
  if (!Array.isArray(projects) || projects.length === 0) throw new Error("Project definitions must be a non-empty array.");
  const slugs = new Set();
  const numbers = new Set();

  for (const [index, project] of projects.entries()) {
    const label = `projects[${index}]`;
    if (!project || typeof project !== "object" || Array.isArray(project)) throw new Error(`${label} must be an object.`);
    requireText(project.slug, `${label}.slug`);
    if (!slugPattern.test(project.slug)) throw new Error(`${label}.slug must be lowercase kebab-case.`);
    if (slugs.has(project.slug)) throw new Error(`Duplicate project slug: ${project.slug}.`);
    slugs.add(project.slug);
    if (!Number.isInteger(project.number) || project.number < 1) throw new Error(`${label}.number must be a positive integer.`);
    if (numbers.has(project.number)) throw new Error(`Duplicate project number: ${project.number}.`);
    numbers.add(project.number);
    requireText(project.title, `${label}.title`);
    requireText(project.type, `${label}.type`);
    requireText(project.status, `${label}.status`);
    if (!projectStatuses.has(project.status)) throw new Error(`${label}.status must be one of: ${[...projectStatuses].join(", ")}.`);
    requireText(project.summary, `${label}.summary`);

    for (const key of ["featured", "selectedSystem", "hidden"]) {
      if (typeof project[key] !== "boolean") throw new Error(`${label}.${key} must be a boolean.`);
    }
    if (!Number.isInteger(project.year)) throw new Error(`${label}.year must be an integer.`);
    for (const key of ["githubUrl", "liveUrl"]) {
      const url = project[key];
      if (url == null) continue;
      requireText(url, `${label}.${key}`);
      if (/^https?:\/\//i.test(url)) {
        const parsed = new URL(url);
        if (!parsed.hostname || !["http:", "https:"].includes(parsed.protocol)) throw new Error(`${label}.${key} must use HTTP(S).`);
        if (key === "githubUrl" && (parsed.hostname !== "github.com" || parsed.pathname.split("/").filter(Boolean).length < 2)) {
          throw new Error(`${label}.githubUrl must point to a GitHub repository.`);
        }
      } else if (key === "githubUrl" || !url.startsWith("projects/") || url.split("/").includes("..") || url.includes("\\") || /[?#]/.test(url)) {
        throw new Error(`${label}.${key} must be an absolute HTTP(S) URL or a site-root-relative demo path.`);
      }
    }

    if (project.featured) {
      requireTextList(project.featureHeadline, `${label}.featureHeadline`);
      requireTextList(project.featureFlow, `${label}.featureFlow`);
      requireTextList(project.tags, `${label}.tags`);
    }
    if (project.detail != null) {
      if (project.detail.status !== "complete") throw new Error(`${label}.detail.status must be "complete" to enable detail routing.`);
      const actions = project.detail.actions;
      if (actions !== undefined) {
        if (!actions || typeof actions !== "object" || Array.isArray(actions)) throw new Error(`${label}.detail.actions must be an object.`);
        const unsupportedActions = Object.keys(actions).filter((key) => key !== "liveDemo");
        if (unsupportedActions.length) throw new Error(`${label}.detail.actions contains unsupported properties: ${unsupportedActions.join(", ")}.`);
        if (actions.liveDemo !== undefined && typeof actions.liveDemo !== "boolean") throw new Error(`${label}.detail.actions.liveDemo must be a boolean.`);
      }
      if (actions?.liveDemo === true && !project.liveUrl) throw new Error(`${label}.detail.actions.liveDemo is true but ${label}.liveUrl is missing.`);
      if (!Array.isArray(project.detail.modules) || project.detail.modules.length === 0) throw new Error(`${label}.detail must contain at least one content module.`);
      if (project.detail.titleLines !== undefined) {
        if (!Array.isArray(project.detail.titleLines) || project.detail.titleLines.length !== 2) throw new Error(`${label}.detail.titleLines must contain exactly two lines.`);
        project.detail.titleLines.forEach((line, lineIndex) => requireText(line, `${label}.detail.titleLines[${lineIndex}]`));
      }
      project.detail.modules.forEach((module, moduleIndex) => validateModule(module, `${label}.detail.modules[${moduleIndex}]`));
    }
  }

  if (projects.filter((project) => project.featured).length !== 1) throw new Error("Project definitions must contain exactly one featured project.");
}

async function generate(slug) {
  validateProjectDefinitions(projectsData);
  const detailProjects = projectsData.filter(hasCompleteDetail);
  const selected = slug
    ? detailProjects.filter((project) => project.slug === slug)
    : detailProjects;
  if (slug && !selected.length) throw new Error(`No complete Project Detail is defined for "${slug}".`);
  if (!selected.length) throw new Error("No complete Project Details are defined.");

  for (const project of selected) {
    for (const [index, module] of project.detail.modules.entries()) {
      if (["image", "interactive"].includes(module.type)) {
        const modulePath = path.resolve(root, module.src);
        try {
          if (!(await stat(modulePath)).isFile()) throw new Error("not a file");
        } catch {
          throw new Error(`Missing ${module.type} source for ${project.slug} module ${index}: ${module.src}`);
        }
      }
    }
    const directory = path.join(root, "work", project.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), renderProjectDetail(project), "utf8");
    console.log(`Generated work/${project.slug}/index.html`);
  }
}

const requestedScript = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (requestedScript === import.meta.url) {
  const [slug, extra] = process.argv.slice(2);
  if (extra) {
    console.error("Usage: node scripts/generate-site.mjs [project-slug]");
    process.exitCode = 1;
  } else {
    generate(slug).catch((error) => {
      console.error(`Project Detail generation failed: ${error.message}`);
      process.exitCode = 1;
    });
  }
}
