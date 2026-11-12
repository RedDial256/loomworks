#!/usr/bin/env node
// Publishes visual proof for a PR on the orphan `visual-proof` branch and prints the PR comment.
// Usage: node scripts/visual-proof/publish.mjs <dir> <pr-number> > comment.md
// <dir> holds <platform>/<theme>/<screen>.<png|mp4|gif>, e.g. ios/dark/button-pending.png.
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, parse, resolve } from 'node:path';

const [dirArg, pr] = process.argv.slice(2);
if (!dirArg || !/^\d+$/.test(pr ?? '')) {
  console.error('Usage: publish.mjs <dir> <pr-number>');
  process.exit(1);
}
const dir = resolve(dirArg);
const PLATFORMS = ['ios', 'android'];
const THEMES = ['light', 'dark'];
const BRANCH = 'visual-proof';

const git = (args, cwd) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();

// screen -> column -> relative path
const table = new Map();
for (const platform of PLATFORMS) {
  for (const theme of THEMES) {
    const folder = join(dir, platform, theme);
    if (!existsSync(folder)) continue;
    for (const file of readdirSync(folder).sort()) {
      const { ext, name } = parse(file);
      if (!['.png', '.mp4', '.gif'].includes(ext)) continue;
      const row = table.get(name) ?? {};
      row[`${platform}-${theme}`] = `${platform}/${theme}/${file}`;
      table.set(name, row);
    }
  }
}
if (table.size === 0) {
  console.error(`No captures in ${dir}`);
  process.exit(1);
}

const sha = git(['rev-parse', 'HEAD']);
const remote = git(['remote', 'get-url', 'origin']);
// The checkout may push with its own SSH key (core.sshCommand); the clone below uses it too.
const sshCommand = (() => {
  try {
    return git(['config', '--get', 'core.sshCommand']);
  } catch {
    return '';
  }
})();
const ssh = sshCommand ? ['-c', `core.sshCommand=${sshCommand}`] : [];
const repo = remote.match(/github\.com[:/](.+?)(\.git)?$/)?.[1];
const dest = `pr-${pr}/${sha}`;

// A fresh clone of the orphan branch only, so the working tree stays untouched.
const pages = mkdtempSync(join(tmpdir(), 'visual-proof-'));
try {
  git([
    ...ssh,
    'clone',
    '--quiet',
    '--depth',
    '1',
    '--branch',
    BRANCH,
    remote,
    pages,
  ]);
} catch {
  git(['init', '--quiet', '-b', BRANCH, pages]);
  git(['remote', 'add', 'origin', remote], pages);
}
if (sshCommand) git(['config', 'core.sshCommand', sshCommand], pages);
mkdirSync(join(pages, dest), { recursive: true });
cpSync(dir, join(pages, dest), { recursive: true });
git(['add', '-A'], pages);
git(['commit', '--quiet', '-m', `visual proof: PR #${pr} at ${sha}`], pages);
git(['push', '--quiet', 'origin', BRANCH], pages);

const base = `https://raw.githubusercontent.com/${repo}/${BRANCH}/${dest}`;
const blob = `https://github.com/${repo}/blob/${BRANCH}/${dest}`;
const columns = PLATFORMS.flatMap((platform) =>
  THEMES.map((theme) => `${platform}-${theme}`)
);
const cell = (path) => {
  if (!path) return '';
  return path.endsWith('.png') || path.endsWith('.gif')
    ? `<img src="${base}/${path}" width="180">`
    : `[video](${blob}/${path})`;
};
const out = [
  '### Visual proof',
  '',
  `At ${sha.slice(0, 7)}.`,
  '',
  `| screen | ${columns.join(' | ')} |`,
  `| --- | ${columns.map(() => '---').join(' | ')} |`,
  ...[...table].map(
    ([name, row]) =>
      `| \`${name}\` | ${columns.map((column) => cell(row[column])).join(' | ')} |`
  ),
];
console.log(out.join('\n'));
