#!/usr/bin/env node
// Pack check (T39): packs loom and weaver as `pnpm publish` would, checks what each tarball holds,
// installs both tarballs in an empty folder and runs the packed bins with --help.
// Usage: node scripts/pack-check.mjs   (build first: pnpm --filter @red_dial/loom --filter @red_dial/create-weaver build)
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ROOT_ENGINES = JSON.parse(
  readFileSync(join(ROOT, 'package.json'), 'utf8')
).engines.node;
const REPOSITORY_URL = 'git+https://github.com/RedDial256/loomworks.git';

// npm always adds package.json, README and LICENSE; everything else must come from `dist`.
const ALWAYS = new Set(['package.json', 'README.md', 'LICENSE']);

const PACKAGES = [
  {
    name: '@red_dial/loom',
    dir: 'packages/cli',
    bin: 'loom',
    required: (files) => {
      const manifest = JSON.parse(read(files, 'dist/registry/manifest.json'));
      const referenced = new Set(
        Object.values(manifest.items).flatMap((item) =>
          item.demo ? [...item.files, item.demo] : item.files
        )
      );
      const embedded = [...files.keys()]
        .filter((f) => f.startsWith('dist/registry/files/'))
        .map((f) => f.slice('dist/registry/files/'.length));
      return [
        'dist/bin.mjs',
        'dist/index.mjs',
        'dist/index.d.mts',
        ...[...referenced].map((f) => `dist/registry/files/${f}`),
        ...embedded
          .filter((f) => !referenced.has(f))
          .map((f) => `!dist/registry/files/${f} (not in the manifest)`),
      ];
    },
  },
  {
    name: '@red_dial/create-weaver',
    dir: 'packages/create-weaver',
    bin: 'create-weaver',
    required: (files) => [
      'dist/bin.mjs',
      'dist/tooling.json',
      'dist/template/package.json',
      'dist/template/app.json',
      'dist/template/gitignore',
      // Monorepo-only files must not reach the standalone template.
      ...['babel.config.js', 'metro.config.js', 'node_modules/']
        .filter((f) =>
          [...files.keys()].some((p) => p.startsWith(`dist/template/${f}`))
        )
        .map((f) => `!dist/template/${f} (monorepo-only)`),
    ],
  },
];

const run = (cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, { encoding: 'utf8', ...options });
  if (result.status !== 0) {
    throw new Error(
      `${cmd} ${args.join(' ')} failed (${result.status}):\n${result.stdout ?? ''}${result.stderr ?? ''}`
    );
  }
  return result.stdout;
};

/** Reads a file out of the tarball listing built by `listTarball`. */
const read = (files, path) => {
  if (!files.has(path)) throw new Error(`Missing ${path}`);
  return files.get(path)();
};

const listTarball = (tarball) => {
  const files = new Map();
  for (const line of run('tar', ['-tzf', tarball])
    .split('\n')
    .filter(Boolean)) {
    const path = line.replace(/^package\//, '');
    files.set(path, () => run('tar', ['-xzOf', tarball, line]));
  }
  return files;
};

const checkContents = (pkg, tarball) => {
  const files = listTarball(tarball);
  const errors = [];
  for (const path of files.keys()) {
    if (!ALWAYS.has(path) && !path.startsWith('dist/')) {
      errors.push(`unexpected file ${path}`);
    }
    if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(path)) {
      errors.push(`test file ${path}`);
    }
  }
  for (const entry of pkg.required(files)) {
    if (entry.startsWith('!')) errors.push(`unexpected file ${entry.slice(1)}`);
    else if (!files.has(entry)) errors.push(`missing ${entry}`);
  }
  const manifest = JSON.parse(read(files, 'package.json'));
  const workspaceDeps = Object.entries(manifest.dependencies ?? {}).filter(
    ([, v]) => v.startsWith('workspace:')
  );
  if (workspaceDeps.length > 0) {
    errors.push(`unresolved workspace deps: ${workspaceDeps}`);
  }
  // npm provenance checks `repository` against the repo that ran the publish.
  if (
    manifest.repository?.url !== REPOSITORY_URL ||
    manifest.repository?.directory !== pkg.dir
  ) {
    errors.push(
      `repository must be ${REPOSITORY_URL} with directory ${pkg.dir}`
    );
  }
  if (manifest.engines?.node !== ROOT_ENGINES) {
    errors.push(`engines.node must match the root (${ROOT_ENGINES})`);
  }
  for (const field of ['license', 'homepage', 'keywords']) {
    if (!manifest[field]) errors.push(`missing ${field} in package.json`);
  }
  console.log(`${pkg.name}: ${files.size} file(s)`);
  return errors;
};

const work = mkdtempSync(join(tmpdir(), 'loom-pack-'));
const errors = [];
const tarballs = [];

for (const pkg of PACKAGES) {
  const before = new Set(readdirSync(work));
  run('pnpm', ['pack', '--pack-destination', work], {
    cwd: join(ROOT, pkg.dir),
  });
  const tarball = readdirSync(work).find(
    (f) => f.endsWith('.tgz') && !before.has(f)
  );
  if (!tarball) throw new Error(`pnpm pack wrote no tarball for ${pkg.name}`);
  tarballs.push(join(work, tarball));
  errors.push(
    ...checkContents(pkg, join(work, tarball)).map((e) => `${pkg.name}: ${e}`)
  );
}

// Both tarballs in one install, so weaver's exact `@red_dial/loom` version resolves to the packed one.
const app = join(work, 'app');
run('mkdir', ['-p', app]);
writeFileSync(
  join(app, 'package.json'),
  '{ "name": "pack-check", "private": true }\n'
);
run(
  'npm',
  ['install', '--no-audit', '--no-fund', '--ignore-scripts', ...tarballs],
  {
    cwd: app,
  }
);
for (const pkg of PACKAGES) {
  const version = JSON.parse(
    readFileSync(join(app, 'node_modules', pkg.name, 'package.json'), 'utf8')
  ).version;
  const result = spawnSync(
    join(app, 'node_modules/.bin', pkg.bin),
    ['--help'],
    {
      cwd: app,
      encoding: 'utf8',
    }
  );
  if (result.status !== 0) {
    errors.push(
      `${pkg.name}: ${pkg.bin} --help exited ${result.status}\n${result.stderr}`
    );
  } else if (!result.stdout.includes(version)) {
    errors.push(
      `${pkg.name}: ${pkg.bin} --help does not print version ${version}`
    );
  } else {
    console.log(`${pkg.bin} --help: ok (${version})`);
  }
}

if (errors.length > 0) {
  console.error(`Pack check failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Pack check passed in ${work}`);
