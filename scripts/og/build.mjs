#!/usr/bin/env node
// Builds the Open Graph share images in public/og/ (1200x630 PNG).
//
//   npm run make:og            render every page
//   npm run make:og -- home    render only the named slugs
//
// Each entry below fills scripts/og/template.html; render-og.mjs then
// screenshots it with headless Chrome (set CHROME_BIN if Chrome is not
// in a standard location). The PNGs are committed, so production never
// needs Chrome. Copy rules: headline <= 7 words, sub line <= 12 words,
// and it must promise only what the page actually delivers.
//
// The page metadata that points at these files lives in src/lib/og.ts.

import { readFileSync, writeFileSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");

// District outline, reused from the map on /problems.
const mapSvg = readFileSync(path.join(root, "public/images/sc01-district-map.svg"), "utf8");
const districtPath = mapSvg.match(/<path d="([^"]+)"/)[1];

export const pages = [
  {
    slug: "home",
    headline: "Clayton Cuteri for U.S. Congress",
    sub: "Write-in candidate for U.S. House, SC District 1",
    art: { kind: "photo", file: "Clayton_Headshot.jpg", position: "50% 30%" },
  },
  {
    slug: "about",
    headline: "Meet Clayton Cuteri",
    sub: "Secretary General of the American Congress Party and SC-01 write-in",
    art: { kind: "photo", file: "clayton-yorktown-patriots-point.jpg", position: "78% 40%" },
  },
  {
    slug: "write-in",
    headline: "How to write in Clayton Cuteri",
    sub: "Step-by-step ballot instructions for South Carolina District 1",
    art: { kind: "ballot" },
  },
  {
    slug: "problems",
    headline: "What District\u00a01 voters are living with",
    sub: "Insurance, housing and cost of living across the Lowcountry",
    art: { kind: "map", path: districtPath },
  },
  {
    slug: "policies",
    headline: "Thirteen priorities for District\u00a01",
    sub: "Taxes, medication, housing and coastal insurance, with the math",
    art: { kind: "number", value: "13", caption: "Priorities" },
  },
  {
    slug: "blog",
    headline: "The Campaign Blog",
    sub: "Lowcountry stories, platform deep dives and campaign news",
    art: { kind: "eagle" },
  },
  {
    slug: "get-involved",
    headline: "Join the Movement",
    sub: "Volunteer, share the campaign and download campaign materials",
    art: { kind: "photo", file: "clayton-red-carpet.jpg", position: "52% 45%" },
  },
  {
    slug: "endorsements",
    headline: "Who Stands With Clayton",
    sub: "Add your voice in support of Clayton's campaign",
    art: { kind: "photo", file: "clayton-seated-direct.jpg", position: "60% 45%" },
  },
  {
    slug: "events",
    headline: "Meet Clayton in Person",
    sub: "Town halls and community events across District 1",
    art: { kind: "photo", file: "clayton-podium.jpg", position: "45% 40%" },
  },
  {
    slug: "press",
    headline: "Media Resources",
    sub: "Bio, photos, press kit and booking for reporters and podcasters",
    art: { kind: "photo", file: "clayton-asia-icon-press.jpg", position: "62% 30%" },
  },
  {
    slug: "donate",
    headline: "Support the Campaign",
    sub: "Secure contributions through Anedot. Federal limits apply.",
    art: { kind: "photo", file: "clayton-seated-smiling.jpg", position: "55% 45%" },
  },
];

const only = process.argv.slice(2);
const todo = only.length ? pages.filter((p) => only.includes(p.slug)) : pages;
if (!todo.length) {
  console.error(`No page matches ${only.join(", ")}. Known: ${pages.map((p) => p.slug).join(", ")}`);
  process.exit(1);
}

// Chrome writes loosely compressed PNGs (photo cards come out near
// 600 KB). Recompress losslessly with sharp, which Next already installs;
// skip quietly if it is not available.
async function recompress(file) {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    return;
  }
  const before = statSync(file).size;
  const buf = await sharp(file).png({ compressionLevel: 9, effort: 10, adaptiveFiltering: true }).toBuffer();
  if (buf.length < before) writeFileSync(file, buf);
  console.log(`  -> ${Math.round(Math.min(buf.length, before) / 1024)} KB after lossless recompression`);
}

const template = readFileSync(path.join(here, "template.html"), "utf8");
const work = mkdtempSync(path.join(tmpdir(), "og-html-"));
try {
  for (const p of todo) {
    const data = JSON.stringify({ ...p, root: `file://${root}` }).replace(/</g, "\\u003c");
    const html = template.replace("/*OG_DATA*/", data);
    const file = path.join(work, `${p.slug}.html`);
    writeFileSync(file, html);
    const out = path.join(root, "public/og", `${p.slug}.png`);
    // One Chrome per page, with one retry: back-to-back headless launches
    // occasionally exit non-zero on macOS.
    const run = (stderr) =>
      execFileSync(process.execPath, [path.join(here, "render-og.mjs"), file, out], {
        stdio: ["ignore", "inherit", stderr],
      });
    try {
      run("ignore");
    } catch {
      run("inherit");
    }
    await recompress(out);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
