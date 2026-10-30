#!/usr/bin/env node
import { intro, log, outro } from '@clack/prompts';
import { isAbsolute, relative } from 'node:path';
import { parseArgs } from 'node:util';

import { create } from './create';
import { WEAVER_VERSION } from './version';

const HELP = `weaver ${WEAVER_VERSION}

Usage:
  npm create @red_dial/weaver <dir> -- --yes   (npm needs the -- before flags)

Options:
  -y, --yes               Full setup with the defaults (tooling, install and git included)
  --no-install            Do not install npm dependencies
  --no-git                Do not run git init
  --no-tooling            Do not set up ESLint and Prettier (@red_dial/rn-tooling-config)
  -h, --help              Show this help
  -v, --version           Show the version
`;

const main = async () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    allowNegative: true,
    options: {
      yes: { type: 'boolean', short: 'y' },
      install: { type: 'boolean', default: true },
      git: { type: 'boolean', default: true },
      tooling: { type: 'boolean', default: true },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
  const [dir] = positionals;

  if (values.version) return console.log(WEAVER_VERSION);
  if (values.help) return console.log(HELP);
  // The prompts (T27) will ask for whatever is missing; until then the folder and --yes are required.
  if (!dir || !values.yes) {
    throw new Error(`Pass a folder and --yes.\n\n${HELP}`);
  }

  intro('weaver');
  const result = await create({
    dir,
    install: values.install,
    git: values.git,
    tooling: values.tooling,
  });
  log.success(`Created ${result.name} with ${result.items.join(', ')}`);
  for (const note of result.notes) log.warn(note);

  const pm = result.packageManager;
  const steps = [`cd ${shortPath(result.dir)}`];
  if (!values.install) steps.push(`${pm} install`);
  if (result.packages.length) {
    steps.push(
      `${pm} ${pm === 'npm' ? 'install' : 'add'} ${result.packages.join(' ')}`
    );
  }
  steps.push(
    `${pm} run ios   # or android; Unistyles needs a development build`
  );
  outro(`Next:\n${steps.map((step) => `  ${step}`).join('\n')}`);
};

/** Relative to the current folder when inside it. */
const shortPath = (dir: string) => {
  const path = relative(process.cwd(), dir);
  return path.startsWith('..') || isAbsolute(path) ? dir : path;
};

main().catch((error: unknown) => {
  log.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
