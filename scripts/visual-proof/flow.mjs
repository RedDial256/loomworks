#!/usr/bin/env node
// T33 spike: writes the Maestro flow that captures every sandbox demo in both themes.
// Usage: node scripts/visual-proof/flow.mjs <appId> [pages] > flow.yaml
// Demo ids come from the sandbox index (written by `loom add`), so new demos need no edit here.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [appId, pagesArg = '3'] = process.argv.slice(2);
if (!appId) {
  console.error('Usage: flow.mjs <appId> [pages]');
  process.exit(1);
}
const pages = Number(pagesArg);
const index = fileURLToPath(
  new URL('../../templates/app/src/sandbox/demos.ts', import.meta.url)
);
const ids = [...readFileSync(index, 'utf8').matchAll(/\{ id: '([^']+)'/g)].map(
  (match) => match[1]
);
if (ids.length === 0) {
  console.error(`No demo ids in ${index}`);
  process.exit(1);
}

// The sandbox grid first, then each demo.
const screens = [
  ['sandbox', 'sandbox'],
  ...ids.map((id) => [id, `sandbox/${id}`]),
];
const lines = [
  `appId: ${appId}`,
  '---',
  '- launchApp:',
  '    clearState: true',
];
for (const theme of ['light', 'dark']) {
  lines.push(`- setDarkMode: ${theme === 'dark' ? 'enabled' : 'disabled'}`);
  for (const [name, route] of screens) {
    lines.push(
      `- openLink: loom://${route}`,
      // iOS asks before opening a custom scheme from outside the app.
      '- runFlow:',
      '    when:',
      '      visible: Open',
      '    commands:',
      '      - tapOn: Open',
      '- waitForAnimationToEnd:',
      '    timeout: 3000'
    );
    for (let page = 1; page <= pages; page += 1) {
      if (page > 1) {
        lines.push('- scroll', '- waitForAnimationToEnd:', '    timeout: 2000');
      }
      lines.push(`- takeScreenshot: ${theme}/${name}-${page}`);
    }
  }
}
console.log(lines.join('\n'));
