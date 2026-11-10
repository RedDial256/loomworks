#!/usr/bin/env node
// T33 spike: writes the Maestro flow that captures the sandbox grid and every demo.
// Usage: node scripts/visual-proof/flow.mjs <appId> <light|dark> [pages] > <theme>.yaml
// The caller sets the device appearance first: Maestro's setDarkMode did not reach the app.
// Demo ids come from the sandbox index (written by `loom add`), so new demos need no edit here.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [appId, theme, pagesArg = '3'] = process.argv.slice(2);
if (!appId || !['light', 'dark'].includes(theme)) {
  console.error('Usage: flow.mjs <appId> <light|dark> [pages]');
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
  // Android failed a launch right after the night mode switch once, without a reason.
  '- retry:',
  '    maxRetries: 2',
  '    commands:',
  '      - launchApp:',
  '          clearState: true',
  // A link sent before the router is ready lands on Home (seen on Android).
  '- extendedWaitUntil:',
  // Maestro matches the whole text as a regex; a plain `Sandbox` failed on iOS.
  "    visible: '.*Sandbox.*'",
  '    timeout: 15000',
];
for (const [name, route] of screens) {
  lines.push(
    `- openLink: loom://${route}`,
    // iOS asks before opening a custom scheme from outside the app, sometimes
    // only after a delay: wait for the prompt a little, then answer it.
    '- runFlow:',
    '    when:',
    '      platform: iOS',
    '    commands:',
    '      - extendedWaitUntil:',
    '          visible: Open',
    '          timeout: 4000',
    '          optional: true',
    '      - runFlow:',
    '          when:',
    '            visible: Open',
    '          commands:',
    '            - tapOn: Open',
    // The first link can take a moment to leave Home.
    '- extendedWaitUntil:',
    "    notVisible: 'Browse the installed components.*'",
    '    timeout: 10000',
    '- waitForAnimationToEnd:',
    '    timeout: 3000'
  );
  for (let page = 1; page <= pages; page += 1) {
    if (page > 1) {
      lines.push(
        // A slow swipe instead of `scroll`, whose fling varied the offset between runs.
        '- swipe:',
        '    start: 50%, 75%',
        '    end: 50%, 25%',
        '    duration: 1500',
        '- waitForAnimationToEnd:',
        '    timeout: 2000'
      );
    }
    lines.push(`- takeScreenshot: ${theme}/${name}-${page}`);
  }
}
console.log(lines.join('\n'));
