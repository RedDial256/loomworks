#!/usr/bin/env node
// T33 spike: drops repeated scroll pages and writes the PR comment for the captured screenshots.
// Usage: node scripts/visual-proof/report.mjs <dir> <baseUrl> > comment.md
// <dir> holds <platform>/<theme>/<demo>-<page>.png; <baseUrl> is where <dir> is published.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const [dir, baseUrl] = process.argv.slice(2);
const PLATFORMS = ['ios', 'android'];
const THEMES = ['light', 'dark'];
const hash = (file) =>
  createHash('sha256').update(readFileSync(file)).digest('hex');

// demo -> page -> column -> file
const table = new Map();
for (const platform of PLATFORMS) {
  for (const theme of THEMES) {
    const folder = join(dir, platform, theme);
    if (!existsSync(folder)) continue;
    const files = readdirSync(folder)
      .filter((name) => name.endsWith('.png'))
      .sort();
    let previous;
    for (const name of files) {
      const [, demo, page] = name.match(/^(.+)-(\d+)\.png$/) ?? [];
      if (!demo) continue;
      const file = join(folder, name);
      const digest = `${demo}:${hash(file)}`;
      // The last scroll of a short demo shows the same page again.
      if (digest === previous) {
        rmSync(file);
        continue;
      }
      previous = digest;
      const pages = table.get(demo) ?? new Map();
      const row = pages.get(page) ?? {};
      row[`${platform}-${theme}`] = `${platform}/${theme}/${name}`;
      pages.set(page, row);
      table.set(demo, pages);
    }
  }
}

const columns = PLATFORMS.flatMap((platform) =>
  THEMES.map((theme) => `${platform}-${theme}`)
);
const out = [
  '### Visual proof',
  '',
  `Sandbox demos, iOS and Android, light and dark. ${table.size} demos.`,
  '',
];
for (const [demo, pages] of [...table].sort(([a], [b]) => a.localeCompare(b))) {
  out.push(`<details><summary><code>${demo}</code></summary>`, '');
  out.push(
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`
  );
  for (const [, row] of [...pages].sort(([a], [b]) => Number(a) - Number(b))) {
    const cells = columns.map((column) =>
      row[column] ? `<img src="${baseUrl}/${row[column]}" width="180">` : ''
    );
    out.push(`| ${cells.join(' | ')} |`);
  }
  out.push('', '</details>', '');
}
console.log(out.join('\n'));
