import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workRoot = join(root, "work");
const voidElements = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
  "meta", "param", "source", "track", "wbr",
]);
const rawTextElements = new Set(["script", "style", "textarea", "title"]);

function tagAt(source, start) {
  if (source.startsWith("<!--", start)) {
    const end = source.indexOf("-->", start + 4);
    return { end: end < 0 ? source.length : end + 3, kind: "comment" };
  }

  const declaration = source[start + 1] === "!" || source[start + 1] === "?";
  let cursor = start + 1;
  let closing = false;
  if (!declaration && source[cursor] === "/") {
    closing = true;
    cursor += 1;
  }
  const nameStart = cursor;
  while (/[A-Za-z0-9:-]/.test(source[cursor] ?? "")) cursor += 1;
  if (!declaration && cursor === nameStart) return null;
  const name = source.slice(nameStart, cursor).toLowerCase();

  let quote = "";
  for (; cursor < source.length; cursor += 1) {
    const character = source[cursor];
    if (quote) {
      if (character === quote) quote = "";
    } else if (character === "'" || character === '"') {
      quote = character;
    } else if (character === ">") {
      const raw = source.slice(start, cursor + 1);
      return {
        closing,
        end: cursor + 1,
        kind: declaration ? "declaration" : "tag",
        name,
        selfClosing: /\/\s*>$/.test(raw),
      };
    }
  }

  return { end: source.length, kind: "incomplete" };
}

function location(source, offset) {
  const before = source.slice(0, offset);
  const line = before.split("\n").length;
  const column = offset - before.lastIndexOf("\n");
  return `${line}:${column}`;
}

function validate(source, file) {
  const stack = [];
  let cursor = 0;

  while (cursor < source.length) {
    const start = source.indexOf("<", cursor);
    if (start < 0) break;
    const token = tagAt(source, start);
    if (!token) {
      cursor = start + 1;
      continue;
    }
    if (token.kind === "incomplete") {
      return `${file}:${location(source, start)} incomplete tag`;
    }
    cursor = token.end;
    if (token.kind !== "tag") continue;

    if (token.closing) {
      const open = stack.pop();
      if (!open) return `${file}:${location(source, start)} unexpected </${token.name}>`;
      if (open.name !== token.name) {
        return `${file}:${location(source, start)} </${token.name}> closes <${open.name}> opened at ${location(source, open.offset)}`;
      }
      continue;
    }

    if (token.selfClosing || voidElements.has(token.name)) continue;
    stack.push({ name: token.name, offset: start });

    if (rawTextElements.has(token.name)) {
      const close = new RegExp(`<\\/\\s*${token.name}\\s*>`, "ig");
      close.lastIndex = cursor;
      const match = close.exec(source);
      if (!match) return `${file}:${location(source, start)} unclosed <${token.name}>`;
      cursor = match.index;
    }
  }

  if (stack.length) {
    const open = stack.at(-1);
    return `${file}:${location(source, open.offset)} unclosed <${open.name}>`;
  }
  return null;
}

const args = process.argv.slice(2);
const files = args.length
  ? args.map((file) => resolve(root, file))
  : (await readdir(workRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(workRoot, entry.name, "index.html"));

const failures = [];
for (const file of files) {
  let source;
  try {
    source = await readFile(file, "utf8");
  } catch (error) {
    failures.push(`${file}: ${error.message}`);
    continue;
  }
  const failure = validate(source, file.slice(root.length + 1));
  if (failure) failures.push(failure);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`HTML structure balanced in ${files.length} generated Project Details.`);
}
