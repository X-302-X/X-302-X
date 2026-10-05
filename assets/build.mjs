// Composes the individual icons in assets/icons/ into wide rows, the same way
// skillicons.dev does it server-side: one <img> per row instead of five, so the
// README does not fight GitHub's baseline alignment.
//
// Usage: node assets/build.mjs
//
// Output: assets/rows/skills-{dark,light}.svg, assets/rows/tools-{dark,light}.svg

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const iconDir = join(root, "assets", "icons");
const outDir = join(root, "assets", "rows");

const ICON = 256; // every icon is drawn on a 256x256 grid
const GAP = 40; // matches the breathing room skillicons leaves between tiles

const rows = {
  skills: ["python", "rust", "cpp", "html", "css"],
  tools: ["vscode", "visualstudio", "git", "terminal", "linux"],
};

const svgTag = /<svg([^>]*)>/;

/**
 * Re-emits an icon's inner content wrapped in a <g>, shifted to `x` on the row
 * canvas.
 *
 * The content is inlined rather than nested in a child <svg>: a nested viewport
 * is positioned differently by different renderers (and by GitHub's sanitiser),
 * while a plain translate on a <g> behaves identically everywhere. Icons are all
 * authored on the same 256x256 grid as the row, so no rescaling is needed — the
 * viewBox is only consulted to keep unusual sources aligned.
 *
 * Only icons with a neutral tile carry a `-light` variant; brand-coloured or
 * transparent-tile icons are theme independent, so they fall back to the base file.
 */
function place(name, theme, x) {
  const base = join(iconDir, `${name}.svg`);
  const themed = join(iconDir, `${name}-light.svg`);
  const file = theme === "light" && existsSync(themed) ? themed : base;
  const src = readFileSync(file, "utf8");

  const attrs = svgTag.exec(src)?.[1] ?? "";
  const viewBox = (/viewBox="([^"]*)"/.exec(attrs)?.[1] ?? "0 0 256 256")
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const [minX, minY, vbW, vbH] = viewBox;
  const scale = ICON / vbW;

  const transform =
    `translate(${x} ${0}) ` +
    (scale === 1 ? "" : `scale(${scale}) `) +
    `translate(${-minX} ${-minY})`;

  const inner = src
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(svgTag, "")
    .replace(/<\/svg>\s*$/, "")
    .trim();

  return `<g transform="${transform.trim()}">${inner}</g>`;
}

mkdirSync(outDir, { recursive: true });

for (const [row, names] of Object.entries(rows)) {
  const width = names.length * ICON + (names.length - 1) * GAP;

  for (const theme of ["dark", "light"]) {
    const body = names.map((n, i) => place(n, theme, i * (ICON + GAP))).join("\n");

    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${ICON}"`,
      `  viewBox="0 0 ${width} ${ICON}" fill="none" role="img"`,
      `  aria-label="${row}: ${names.join(", ")}">`,
      `  <title>${row}: ${names.join(", ")}</title>`,
      body,
      `</svg>`,
      ``,
    ].join("\n");

    const out = join(outDir, `${row}-${theme}.svg`);
    writeFileSync(out, svg);
    console.log(`${out.replace(root + "/", "")}  ${width}x${ICON}  ${names.length} icons`);
  }
}
