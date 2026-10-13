#!/usr/bin/env node
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { intro, log, outro } from '@clack/prompts';

import { add } from './commands/add';
import { init } from './commands/init';
import type { ConflictOptions, WriteReport } from './project/files';
import { isInteractive, promptConflict } from './prompt';
import { LOOM_VERSION } from './version';

const HELP = `loom ${LOOM_VERSION}

Usage:
  loom init               Set up the theme, Unistyles and loom.json in an Expo project
  loom add <items...>     Add items and their dependencies to the project

Options:
  --cwd <dir>             Project folder (default: current folder)
  --overwrite             Replace existing files that differ
  --skip-existing         Keep existing files that differ
  --no-install            Do not install npm dependencies
  -h, --help              Show this help
  -v, --version           Show the version
`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    allowNegative: true,
    options: {
      cwd: { type: 'string' },
      overwrite: { type: 'boolean' },
      'skip-existing': { type: 'boolean' },
      install: { type: 'boolean', default: true },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
  const [command] = positionals;

  if (values.version) return console.log(LOOM_VERSION);
  if (values.help || !command) return console.log(HELP);

  const cwd = resolve(values.cwd ?? process.cwd());
  const conflicts: ConflictOptions = {
    overwrite: values.overwrite,
    skipExisting: values['skip-existing'],
    resolveConflict: isInteractive() ? promptConflict : undefined,
  };

  switch (command) {
    case 'init': {
      intro(`loom init`);
      const result = await init({ cwd, install: values.install, ...conflicts });
      printFiles(result.files);
      if (result.configured.length) {
        log.info(`Configured: ${result.configured.join(', ')}`);
      }
      printPackages(result.packages, values.install);
      for (const note of result.notes) log.step(note);
      outro('Theme ready. Import it with `@/theme`.');
      return;
    }
    case 'add': {
      intro(`loom add`);
      const result = await add({
        cwd,
        items: positionals.slice(1),
        install: values.install,
        ...conflicts,
      });
      log.info(`Items: ${result.items.join(', ')}`);
      printFiles(result.files);
      printPackages(result.packages, values.install);
      outro('Done.');
      return;
    }
    default:
      throw new Error(`Unknown command "${command}".\n\n${HELP}`);
  }
}

function printFiles({ written, unchanged, skipped }: WriteReport) {
  if (written.length) log.success(`Wrote ${written.length} file(s)`);
  if (unchanged.length) {
    log.info(`${unchanged.length} file(s) already up to date`);
  }
  for (const file of skipped) log.warn(`Skipped ${file}`);
}

function printPackages(packages: string[], installed: boolean) {
  if (!packages.length) return;
  if (installed) log.success(`Installed ${packages.join(' ')}`);
  else log.warn(`Install skipped. Missing packages: ${packages.join(' ')}`);
}

main().catch((error: unknown) => {
  log.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
