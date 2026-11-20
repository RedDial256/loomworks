#!/usr/bin/env node
// Security audit (T16): runs rnsec on packages/ and on an Expo app built by scripts/integration.sh,
// plus `npm audit` on the app, then compares the findings with security/rnsec-baseline.json.
// Fails on HIGH findings missing from the baseline; other new or resolved findings are warnings.
// Usage: node scripts/security.mjs [--app <dir>] [--reports <dir>] [--update]
//   --app      app to scan; without it, one is built with scripts/integration.sh (slow)
//   --reports  folder for the rnsec JSON and Markdown reports (default: rnsec-reports)
//   --update   write the current findings as the new baseline instead of comparing
import { spawnSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const ROOT = resolve(import.meta.dirname, '..');
const BASELINE = join(ROOT, 'security/rnsec-baseline.json');
const NPM_RULE = 'NPM_VULNERABLE_DEPENDENCY';
const NPM_AUDIT_TIMEOUT = 120_000;
const NPM_SEVERITY = { critical: 'HIGH', high: 'HIGH', moderate: 'MEDIUM' };

const buildApp = () => {
  const workdir = mkdtempSync(join(tmpdir(), 'loom-security-'));
  console.log(`No --app: building one in ${workdir}`);
  run(join(ROOT, 'scripts/integration.sh'), ['58', workdir], {
    stdio: 'inherit',
  });
  return join(workdir, 'app');
};

const scanTarget = ({ name, dir, npmAudit }) => {
  if (!npmAudit) return scan(name, dir);
  skipRnsecNpmAudit(dir);
  return [...scan(name, dir), ...audit(name, dir)];
};

// rnsec runs `npm audit` with a fixed 10 s timeout, which the app exceeds on CI runners,
// so the script runs it instead. `hardcoded` keeps rnsec's offline package checks.
const skipRnsecNpmAudit = (dir) => {
  const path = join(dir, '.rnsec.json');
  const config = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
  config.npmVulnerabilityScanning = {
    ...config.npmVulnerabilityScanning,
    dataSource: 'hardcoded',
  };
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
};

// Same findings as rnsec's npm audit: direct dependencies only, same description and severity.
const audit = (name, dir) => {
  const result = spawnSync('npm', ['audit', '--json'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: NPM_AUDIT_TIMEOUT,
    maxBuffer: 64 * 1024 * 1024,
  });
  writeFileSync(join(reports, `${name}-npm-audit.json`), result.stdout ?? '');
  let output;
  try {
    output = JSON.parse(result.stdout);
  } catch {
    output = undefined;
  }
  if (result.error || !output?.vulnerabilities) {
    warnings.push(
      `${name}: npm audit failed (${auditError(result, output)}); dependency findings were not checked.`
    );
    // Keep the baseline entries so they are not reported as resolved.
    return baseline
      .filter((f) => f.target === name && f.ruleId === NPM_RULE)
      .map((f) => ({ ...f, unchecked: true }));
  }
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  const direct = { ...pkg.dependencies, ...pkg.devDependencies };
  return Object.entries(output.vulnerabilities)
    .filter(([pkgName]) => direct[pkgName])
    .map(([pkgName, vuln]) => {
      const via = vuln.via?.[0];
      const description = `${via?.title ?? `Vulnerability in ${pkgName}`} (${vuln.severity})`;
      return {
        key: [name, NPM_RULE, 'package.json', description].join(' | '),
        target: name,
        ruleId: NPM_RULE,
        severity: NPM_SEVERITY[vuln.severity] ?? 'LOW',
        file: 'package.json',
        description,
      };
    });
};

const auditError = (result, output) => {
  if (result.error?.code === 'ETIMEDOUT') {
    return `timed out after ${NPM_AUDIT_TIMEOUT / 1000} s`;
  }
  if (result.error) return result.error.message;
  if (output?.error?.summary) return output.error.summary;
  return `exited with ${result.status}`;
};

const scan = (name, dir) => {
  const json = join(reports, `${name}.json`);
  const md = join(reports, `${name}.md`);
  const html = join(reports, `${name}.html`);
  // A stale report would hide a failed scan.
  rmSync(json, { force: true });
  // Exit code 1 means HIGH findings or an error: rely on the JSON report instead.
  run(
    'pnpm',
    [
      'exec',
      'rnsec',
      'scan',
      '--path',
      dir,
      '--output',
      json,
      '--md',
      md,
      '--html',
      html,
      '--silent',
    ],
    {
      cwd: ROOT,
      allowFailure: true,
    }
  );
  if (!existsSync(json)) {
    throw new Error(`rnsec wrote no report for ${name} (${dir}).`);
  }
  const { findings } = JSON.parse(readFileSync(json, 'utf8'));
  return findings.map((f) => {
    const file = relative(dir, f.filePath);
    // The line is left out of the key: it moves with unrelated edits.
    return {
      key: [name, f.ruleId, file, f.description].join(' | '),
      target: name,
      ruleId: f.ruleId,
      severity: f.severity,
      file,
      description: f.description,
    };
  });
};

const run = (cmd, args, { allowFailure = false, ...options } = {}) => {
  const result = spawnSync(cmd, args, { stdio: 'ignore', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`${cmd} ${args.join(' ')} exited with ${result.status}`);
  }
};

const rnsecVersion = () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  return pkg.devDependencies.rnsec;
};

const report = () => {
  const ci = !!process.env.GITHUB_ACTIONS;
  const line = (f) =>
    `${f.severity} ${f.ruleId} in ${f.target}/${f.file}: ${f.description}`;
  const annotate = (level, text) =>
    console.log(ci ? `::${level} title=rnsec::${text}` : `${level}: ${text}`);

  newHigh.forEach((f) => annotate('error', `New: ${line(f)}`));
  added
    .filter((f) => f.severity !== 'HIGH')
    .forEach((f) => annotate('warning', `New: ${line(f)}`));
  resolved.forEach((f) =>
    annotate('warning', `Resolved, remove from the baseline: ${line(f)}`)
  );
  warnings.forEach((w) => annotate('warning', w));

  const summary = [
    '## Security audit (rnsec)',
    '',
    `${current.length} finding(s), ${added.length} new (${newHigh.length} HIGH), ${resolved.length} resolved against the baseline.`,
    ...(newHigh.length
      ? [
          '',
          'New HIGH findings fail this job. Fix them, or accept them with `pnpm security:baseline` in this PR.',
        ]
      : []),
    ...section('New', added),
    ...section('Resolved (run `pnpm security:baseline`)', resolved),
    ...(warnings.length
      ? ['', '### Warnings', '', ...warnings.map((w) => `- ${w}`)]
      : []),
    '',
  ].join('\n');
  console.log(`\n${summary}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
};

const section = (title, findings) => {
  if (!findings.length) return [];
  return [
    '',
    `### ${title}`,
    '',
    '| Severity | Rule | File | Description |',
    '| --- | --- | --- | --- |',
    ...findings.map(
      (f) =>
        `| ${f.severity} | ${f.ruleId} | ${f.target}/${f.file} | ${f.description} |`
    ),
  ];
};

const { values } = parseArgs({
  options: {
    app: { type: 'string' },
    reports: { type: 'string', default: 'rnsec-reports' },
    update: { type: 'boolean', default: false },
  },
});
const reports = resolve(values.reports);
mkdirSync(reports, { recursive: true });

const app = values.app ? resolve(values.app) : buildApp();
const targets = [
  { name: 'packages', dir: join(ROOT, 'packages') },
  { name: 'app', dir: app, npmAudit: true },
];

const baseline = existsSync(BASELINE)
  ? JSON.parse(readFileSync(BASELINE, 'utf8')).findings
  : [];
const warnings = [];
const current = targets.flatMap(scanTarget);

if (values.update) {
  const findings = current
    .map(({ unchecked: _, ...f }) => f)
    .sort((a, b) => a.key.localeCompare(b.key));
  mkdirSync(dirname(BASELINE), { recursive: true });
  writeFileSync(
    BASELINE,
    `${JSON.stringify({ rnsec: rnsecVersion(), findings }, null, 2)}\n`
  );
  console.log(
    `Baseline updated: ${findings.length} finding(s) in ${relative(ROOT, BASELINE)}`
  );
  process.exit(0);
}

const known = new Set(baseline.map((f) => f.key));
const found = new Set(current.map((f) => f.key));
const added = current.filter((f) => !known.has(f.key));
const resolved = baseline.filter((f) => !found.has(f.key));
const newHigh = added.filter((f) => f.severity === 'HIGH');

report();
process.exit(newHigh.length ? 1 : 0);
