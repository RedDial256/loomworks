#!/usr/bin/env node
import { intro, log, outro } from '@clack/prompts';
import { createEmbeddedSource, isInteractive } from '@red_dial/loom';
import { isAbsolute, relative } from 'node:path';
import { parseArgs } from 'node:util';

import { create } from './create';
import { resolveChoices } from './prompts';
import { WEAVER_VERSION } from './version';

const HELP = `weaver ${WEAVER_VERSION}

Usage:
  npm create @red_dial/weaver [dir] -- [options]   (npm needs the -- before flags)

Asks for whatever the flags leave out. Without a terminal, pass every flag or --yes.

Options:
  -y, --yes               Use the defaults for what the flags leave out: every
                          component and hook, install, git and tooling
  --components <names>    Components to add on top of the template's, comma-separated ("" for none)
  --hooks <names>         Hooks to add on top of the template's, comma-separated ("" for none)
  --[no-]install          Install npm dependencies
  --[no-]git              Run git init and commit
  --[no-]tooling          Set up ESLint and Prettier (@red_dial/rn-tooling-config)
  -h, --help              Show this help
  -v, --version           Show the version
`;

const main = async () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    allowNegative: true,
    options: {
      yes: { type: 'boolean', short: 'y' },
      components: { type: 'string' },
      hooks: { type: 'string' },
      install: { type: 'boolean' },
      git: { type: 'boolean' },
      tooling: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
  const [dir] = positionals;

  if (values.version) return console.log(WEAVER_VERSION);
  if (values.help) return console.log(HELP);

  intro('weaver');
  const choices = await resolveChoices(
    { ...values, dir },
    {
      manifest: await createEmbeddedSource().getManifest(),
      interactive: isInteractive(),
    }
  );
  const result = await create(choices);
  log.success(`Created ${result.name} with ${result.items.join(', ')}`);
  for (const note of result.notes) log.warn(note);

  const pm = result.packageManager;
  const steps = [`cd ${shortPath(result.dir)}`];
  if (!choices.install) steps.push(`${pm} install`);
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
