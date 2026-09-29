import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { canonicalHomeUrl, canonicalWorkUrl, canonicalProjectUrl, siteConfig } from "../data/site.mjs";
import { hasCompleteDetail, isIndexableProject, projectsData } from "../data/projects.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function readPage(relativePath) {
  try {
    return await readFile(path.join(root, relativePath), "utf8");
  } catch {
    check(false, `${relativePath}: file is missing or unreadable.`);
    return null;
  }
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : null;
}

function metaTags(html) {
  return tags(html, "meta");
}

function matchingMeta(html, attributeName, expectedValue) {
  return metaTags(html).filter((tag) => attribute(tag, attributeName)?.toLowerCase() === expectedValue.toLowerCase());
}

function decodeHtml(value) {
  return value.replace(/&(?:amp|lt|gt|quot|apos|#39);/g, (entity) => ({
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&#39;": "'",
  })[entity]);
}

function expectMeta(html, page, attributeName, key, expectedValue) {
  const matches = matchingMeta(html, attributeName, key);
  check(matches.length === 1, `${page}: expected exactly one meta ${attributeName}="${key}"; found ${matches.length}.`);
  const value = matches[0] ? decodeHtml(attribute(matches[0], "content") ?? "") : null;
  if (expectedValue !== undefined) check(value === expectedValue, `${page}: ${attributeName}="${key}" has an unexpected value.`);
  return value;
}

function expectCanonical(html, page, expectedUrl) {
  const links = tags(html, "link").filter((tag) => (attribute(tag, "rel") ?? "").toLowerCase().split(/\s+/).includes("canonical"));
  check(links.length === 1, `${page}: expected exactly one canonical link; found ${links.length}.`);
  const value = links[0] ? attribute(links[0], "href") : null;
  check(value === expectedUrl, `${page}: canonical must equal ${expectedUrl}.`);
  return value;
}

function expectTitleAndDescription(html, page, expectedTitle) {
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)];
  check(titles.length === 1, `${page}: expected exactly one <title>; found ${titles.length}.`);
  if (expectedTitle !== undefined && titles[0]) {
    check(decodeHtml(titles[0][1].trim()) === expectedTitle, `${page}: <title> has an unexpected value.`);
  }
  expectMeta(html, page, "name", "description");
}

function expectNoKeywords(html, page) {
  const count = matchingMeta(html, "name", "keywords").length;
  check(count === 0, `${page}: meta keywords must not be present.`);
}

function expectNoindexState(html, page, shouldBeNoindex) {
  const robots = matchingMeta(html, "name", "robots");
  const noindex = robots.some((tag) => /\bnoindex\b/i.test(attribute(tag, "content") ?? ""));
  if (shouldBeNoindex) {
    check(robots.some((tag) => attribute(tag, "content")?.toLowerCase() === "noindex,follow"), `${page}: expected robots noindex,follow.`);
  } else {
    check(!noindex, `${page}: indexable page must not contain noindex.`);
  }
}

function parseJsonLd(html, page) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .filter((match) => attribute(`<script ${match[1]}>`, "type")?.toLowerCase() === "application/ld+json");
  check(scripts.length === 1, `${page}: expected exactly one JSON-LD block; found ${scripts.length}.`);
  if (!scripts[0]) return null;
  try {
    return JSON.parse(scripts[0][2]);
  } catch (error) {
    check(false, `${page}: JSON-LD is invalid JSON (${error.message}).`);
    return null;
  }
}

function expectSocialMetadata(html, page, { title, description, canonical, image, project }) {
  const ogFields = [
    ["og:type", "website"],
    ["og:site_name", siteConfig.name],
    ["og:title", title],
    ["og:description", description],
    ["og:url", canonical],
  ];
  for (const [key, value] of ogFields) expectMeta(html, page, "property", key, value);

  const ogImages = matchingMeta(html, "property", "og:image");
  if (image) {
    check(ogImages.length === 1, `${page}: expected exactly one og:image.`);
    if (ogImages[0]) check(decodeHtml(attribute(ogImages[0], "content") ?? "") === image, `${page}: og:image has an unexpected value.`);
  } else {
    check(ogImages.length === 0, `${page}: og:image must be omitted when no project SEO image exists.`);
  }

  const twitterCard = expectMeta(html, page, "name", "twitter:card");
  check(twitterCard === (project ? (image ? "summary_large_image" : "summary") : "summary"), `${page}: twitter:card has an unexpected value.`);
  expectMeta(html, page, "name", "twitter:title", title);
  expectMeta(html, page, "name", "twitter:description", description);
  const twitterImages = matchingMeta(html, "name", "twitter:image");
  if (image) {
    check(twitterImages.length === 1, `${page}: expected exactly one twitter:image.`);
    if (twitterImages[0]) check(decodeHtml(attribute(twitterImages[0], "content") ?? "") === image, `${page}: twitter:image has an unexpected value.`);
  } else {
    check(twitterImages.length === 0, `${page}: twitter:image must be omitted when no project SEO image exists.`);
  }
}

function expectedProjectImage(project) {
  return project.seo?.image ? new URL(project.seo.image, `${siteConfig.url}/`).href : null;
}

function xmlDecode(value) {
  return value.replace(/&(amp|lt|gt|quot|apos);/g, (_, entity) => ({
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
  })[entity]);
}

function expectBreadcrumb(document, page, expected) {
  const breadcrumb = document?.["@graph"]?.find((node) => node["@type"] === "BreadcrumbList");
  check(Boolean(breadcrumb), `${page}: BreadcrumbList is missing.`);
  const items = breadcrumb?.itemListElement ?? [];
  check(items.length === expected.length && items.every((item, index) => item["@type"] === "ListItem" && item.position === index + 1 && item.name === expected[index].name && item.item === expected[index].item), `${page}: breadcrumb hierarchy is incorrect.`);
}

async function checkWorkDirectory() {
  const page = "work/index.html";
  const html = await readPage(page);
  if (!html) return;
  const title = "Work — Yiqiang Adrian Liu";
  const description = "The complete work directory: software, tools, systems, and experiments by Yiqiang Adrian Liu.";
  expectTitleAndDescription(html, page, title);
  expectMeta(html, page, "name", "description", description);
  expectCanonical(html, page, canonicalWorkUrl);
  expectSocialMetadata(html, page, { title, description, canonical: canonicalWorkUrl, image: null, project: false });
  expectNoKeywords(html, page);
  expectNoindexState(html, page, false);
  const document = parseJsonLd(html, page);
  const collection = document?.["@graph"]?.find((node) => ["CollectionPage", "WebPage"].includes(node["@type"]));
  check(collection?.url === canonicalWorkUrl && collection?.name === title && collection?.description === description, `${page}: collection metadata is incorrect.`);
  check(collection?.isPartOf?.["@id"] === `${siteConfig.url}/#website`, `${page}: collection must reference the WebSite.`);
  expectBreadcrumb(document, page, [{ name: "Home", item: canonicalHomeUrl }, { name: "Work", item: canonicalWorkUrl }]);
  check(collection?.breadcrumb?.["@id"] === `${canonicalWorkUrl}#breadcrumb`, `${page}: collection breadcrumb reference is incorrect.`);
}

async function checkStaleArchitecture(directory = root) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await checkStaleArchitecture(filename);
    else if (/\.(?:html|mjs|js)$/.test(entry.name)) {
      const source = await readFile(filename, "utf8");
      const staleRepository = "https://github.com/jumpjumptiger007/" + "portfolio-website";
      check(!source.includes(staleRepository), `${path.relative(root, filename)}: stale repository URL found.`);
    }
  }
}

async function checkHomepage() {
  const page = "index.html";
  const html = await readPage(page);
  if (!html) return;
  expectTitleAndDescription(html, page, siteConfig.homepageTitle);
  expectMeta(html, page, "name", "description", siteConfig.homepageDescription);
  const canonical = expectCanonical(html, page, canonicalHomeUrl);
  expectSocialMetadata(html, page, {
    title: siteConfig.homepageTitle,
    description: siteConfig.homepageDescription,
    canonical,
    image: new URL(siteConfig.profileImage, `${siteConfig.url}/`).href,
    project: false,
  });
  expectNoKeywords(html, page);
  expectNoindexState(html, page, false);

  const jsonLd = parseJsonLd(html, page);
  check(Array.isArray(jsonLd?.["@graph"]), `${page}: JSON-LD must contain an @graph array.`);
  const graph = jsonLd?.["@graph"] ?? [];
  const website = graph.find((node) => node["@type"] === "WebSite");
  const person = graph.find((node) => node["@type"] === "Person");
  check(website?.["@id"] === `${siteConfig.url}/#website`, `${page}: expected the configured WebSite node.`);
  check(website?.url === canonicalHomeUrl && website?.name === siteConfig.name, `${page}: WebSite URL or name is incorrect.`);
  check(website?.description === siteConfig.homepageDescription, `${page}: WebSite description is incorrect.`);
  check(website?.publisher?.["@id"] === `${siteConfig.url}/#person`, `${page}: WebSite must reference the Person publisher.`);
  check(person?.["@id"] === `${siteConfig.url}/#person` && person?.name === siteConfig.personName, `${page}: expected the configured Person node.`);
  check(person?.alternateName === siteConfig.alternateName, `${page}: Person alternateName is incorrect.`);
  check(person?.url === canonicalHomeUrl && person?.image === new URL(siteConfig.profileImage, `${siteConfig.url}/`).href, `${page}: Person URL or image is incorrect.`);
  check(person?.jobTitle === "Independent Developer & Builder", `${page}: Person jobTitle is incorrect.`);
  check(Array.isArray(person?.sameAs) && person.sameAs.includes(siteConfig.githubUrl), `${page}: Person must include the configured GitHub profile.`);
}

async function checkProject(project) {
  const relativePath = `work/${project.slug}/index.html`;
  const html = await readPage(relativePath);
  if (!html) return;

  const indexable = isIndexableProject(project);
  expectNoindexState(html, relativePath, !indexable);

  const effectiveTitle = project.seo?.title ?? `${project.title} — ${siteConfig.personName}`;
  const effectiveDescription = project.seo?.description ?? project.summary;
  expectTitleAndDescription(html, relativePath, effectiveTitle);
  const canonical = expectCanonical(html, relativePath, canonicalProjectUrl(project.slug));
  expectMeta(html, relativePath, "name", "description", effectiveDescription);
  const image = expectedProjectImage(project);
  expectSocialMetadata(html, relativePath, {
    title: effectiveTitle,
    description: effectiveDescription,
    canonical,
    image,
    project: true,
  });
  expectNoKeywords(html, relativePath);

  const document = parseJsonLd(html, relativePath);
  const jsonLd = document?.["@graph"]?.find((node) => node["@type"] === "CreativeWork");
  expectBreadcrumb(document, relativePath, [{ name: "Home", item: canonicalHomeUrl }, { name: "Work", item: canonicalWorkUrl }, { name: project.title, item: canonical }]);
  check(jsonLd?.["@type"] === "CreativeWork", `${relativePath}: structured data must use CreativeWork.`);
  check(jsonLd?.url === canonical, `${relativePath}: CreativeWork URL must equal the canonical URL.`);
  check(jsonLd?.name === project.title && jsonLd?.description === effectiveDescription, `${relativePath}: CreativeWork name or description is incorrect.`);
  check(jsonLd?.creator?.["@id"] === `${siteConfig.url}/#person`, `${relativePath}: CreativeWork creator must reference the Person entity.`);
  check(jsonLd?.isPartOf?.["@id"] === `${siteConfig.url}/#website`, `${relativePath}: CreativeWork must reference the WebSite entity.`);
  if (image) check(jsonLd?.image === image, `${relativePath}: CreativeWork image is incorrect.`);
}

async function checkSitemap() {
  const sitemap = await readPage("sitemap.xml");
  if (!sitemap) return;
  check(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "sitemap.xml: expected an XML declaration.");
  check((sitemap.match(/<urlset\b/g) ?? []).length === 1 && /<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"[^>]*>/.test(sitemap), "sitemap.xml: expected one valid sitemap urlset root.");
  check((sitemap.match(/<\/urlset>/g) ?? []).length === 1, "sitemap.xml: expected a closing urlset element.");
  const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  const rawLocs = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => match[1]);
  const locs = rawLocs.map(xmlDecode);
  check(entries.length === rawLocs.length, "sitemap.xml: each URL entry must contain exactly one loc element.");
  check(entries.every((entry) => (entry.match(/<loc>/g) ?? []).length === 1), "sitemap.xml: each URL entry must contain exactly one loc element.");
  check(rawLocs.length > 0 && rawLocs.length === (sitemap.match(/<loc>/g) ?? []).length, "sitemap.xml: every loc element must have valid basic structure.");
  check(new Set(locs).size === locs.length, "sitemap.xml: duplicate loc URLs were found.");

  for (const loc of locs) {
    try {
      const url = new URL(loc);
      check(url.protocol === "https:", `sitemap.xml: ${loc} must use HTTPS.`);
      check(url.hostname === "yliu.tech", `sitemap.xml: ${loc} must use yliu.tech.`);
      check(!url.hash && !url.search, `sitemap.xml: ${loc} must not contain a fragment or query.`);
      check(url.href === loc, `sitemap.xml: ${loc} must be an absolute canonical URL.`);
    } catch {
      check(false, `sitemap.xml: ${loc} is not an absolute URL.`);
    }
    check(!loc.includes("/projects/") && !loc.includes("/demos/"), `sitemap.xml: legacy URL ${loc} must be excluded.`);
    check(!loc.includes("#"), `sitemap.xml: fragment URL ${loc} must be excluded.`);
  }

  const expected = [canonicalHomeUrl, canonicalWorkUrl, ...projectsData.filter(isIndexableProject).map((project) => canonicalProjectUrl(project.slug))].sort();
  check([...locs].sort().join("\n") === expected.join("\n"), "sitemap.xml: URLs do not match the exact set of expected canonical pages.");
  for (const project of projectsData.filter((item) => item.seo?.indexable === false && hasCompleteDetail(item))) {
    check(!locs.includes(canonicalProjectUrl(project.slug)), `sitemap.xml: explicitly non-indexable project ${project.slug} must be absent.`);
  }
}

async function checkRobots() {
  const robots = await readPage("robots.txt");
  if (!robots) return;
  const lines = robots.split(/\r?\n/).map((line) => line.trim());
  check(lines.includes("User-agent: *"), "robots.txt: missing User-agent: *.");
  check(lines.includes("Allow: /"), "robots.txt: missing Allow: /.");
  check(lines.filter((line) => /^Sitemap:/i.test(line)).length === 1 && lines.includes(`Sitemap: ${siteConfig.url}/sitemap.xml`), "robots.txt: sitemap directive is missing or incorrect.");
  check(!/^Disallow:\s*\//im.test(robots), "robots.txt: canonical public pages must not be blocked.");
}

async function checkLegacyPages() {
  const pages = [
    "demos/bulk-email-sender/index.html",
    "demos/password-generator/index.html",
    "demos/qpsk-visualization/index.html",
    "projects/cable/index.html",
    "projects/password-generator/index.html",
    "projects/pollen-alert-germany/index.html",
    "projects/qpsk-modulation/index.html",
  ];
  for (const page of pages) {
    const html = await readPage(page);
    if (!html) continue;
    const robots = matchingMeta(html, "name", "robots");
    check(robots.some((tag) => attribute(tag, "content")?.toLowerCase() === "noindex,follow"), `${page}: expected robots noindex,follow.`);
  }
}

async function main() {
  check(!projectsData.some((project) => project.slug === "portfolio-v1" || project.title === "Portfolio V1"), "Canonical data must not contain Portfolio V1.");
  await checkHomepage();
  await checkWorkDirectory();
  await checkStaleArchitecture();
  for (const project of projectsData.filter(hasCompleteDetail)) await checkProject(project);
  await checkSitemap();
  await checkRobots();
  await checkLegacyPages();

  if (failures.length) {
    console.error(`SEO validation failed with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(`SEO validation passed: homepage, Work directory, ${projectsData.filter(isIndexableProject).length} indexable Project Detail page(s), sitemap, robots, and legacy directives.`);
}

const requestedScript = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (requestedScript === import.meta.url) {
  main().catch((error) => {
    console.error(`SEO validation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
