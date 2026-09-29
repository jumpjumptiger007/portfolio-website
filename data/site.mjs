export const siteConfig = Object.freeze({
  url: "https://yliu.tech",
  name: "Yiqiang Adrian Liu",
  personName: "Yiqiang Adrian Liu",
  alternateName: "Adrian Liu",
  homepageTitle: "Yiqiang Adrian Liu — Independent Developer",
  homepageDescription: "Yiqiang Adrian Liu — independent developer and builder of useful, sometimes strange, software.",
  githubUrl: "https://github.com/jumpjumptiger007",
  profileImage: "assets/profile.jpg",
});

export const canonicalHomeUrl = `${siteConfig.url}/`;

export const canonicalProjectUrl = (slug) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Canonical project slug must be lowercase kebab-case.");
  return `${siteConfig.url}/work/${slug}/`;
};

export const absoluteSiteUrl = (path) => new URL(path, `${siteConfig.url}/`).href;

export const canonicalWorkUrl = `${siteConfig.url}/work/`;
