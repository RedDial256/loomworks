import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export interface PlannedFile {
  /** Project-relative POSIX path. */
  target: string;
  content: string;
}

export interface Conflict {
  target: string;
  current: string;
  incoming: string;
}

export type ConflictChoice = 'overwrite' | 'skip';

export interface ConflictOptions {
  overwrite?: boolean;
  skipExisting?: boolean;
  /** Asks the user per file; omit in non-interactive mode, where an unresolved conflict fails. */
  resolveConflict?: (conflict: Conflict) => Promise<ConflictChoice>;
}

export interface WriteReport {
  written: string[];
  unchanged: string[];
  skipped: string[];
}

export class ConflictError extends Error {
  constructor(readonly files: string[]) {
    super(
      `These files already exist with different content:\n${files.map((f) => `  ${f}`).join('\n')}\n` +
        'Re-run with --overwrite to replace them or --skip-existing to keep them.'
    );
    this.name = 'ConflictError';
  }
}

/**
 * Writes files, resolving conflicts (existing file, different content) by flag or prompt.
 * Every conflict is decided before anything is written; identical files are left alone.
 */
export async function writeFiles(
  cwd: string,
  files: PlannedFile[],
  { overwrite, skipExisting, resolveConflict }: ConflictOptions = {}
): Promise<WriteReport> {
  if (overwrite && skipExisting) {
    throw new Error('Use either --overwrite or --skip-existing, not both.');
  }

  const report: WriteReport = { written: [], unchanged: [], skipped: [] };
  const toWrite: PlannedFile[] = [];
  const conflicts: Conflict[] = [];

  for (const file of files) {
    const current = await readFile(join(cwd, file.target), 'utf8').catch(
      () => undefined
    );
    if (current === undefined) toWrite.push(file);
    else if (current === file.content) report.unchanged.push(file.target);
    else {
      conflicts.push({ target: file.target, current, incoming: file.content });
    }
  }

  if (conflicts.length && !overwrite && !skipExisting && !resolveConflict) {
    throw new ConflictError(conflicts.map((c) => c.target));
  }

  for (const conflict of conflicts) {
    const choice: ConflictChoice = overwrite
      ? 'overwrite'
      : skipExisting
        ? 'skip'
        : await resolveConflict!(conflict);
    if (choice === 'overwrite') {
      toWrite.push({ target: conflict.target, content: conflict.incoming });
    } else report.skipped.push(conflict.target);
  }

  for (const file of toWrite) {
    const path = join(cwd, file.target);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, file.content);
    report.written.push(file.target);
  }
  return report;
}
