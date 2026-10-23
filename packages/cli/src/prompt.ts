import { isCancel, log, select } from '@clack/prompts';
import { createTwoFilesPatch } from 'diff';

import type { Conflict, ConflictChoice } from './project/files';

/** Interactive per-file conflict prompt: overwrite, skip, or show the diff and ask again. */
export const promptConflict = async (
  conflict: Conflict
): Promise<ConflictChoice> => {
  for (;;) {
    const choice = await select({
      message: `${conflict.target} already exists and differs.`,
      options: [
        { value: 'overwrite', label: 'Overwrite' },
        { value: 'skip', label: 'Skip (keep mine)' },
        { value: 'diff', label: 'Show diff' },
      ],
    });
    if (isCancel(choice)) throw new Error('Cancelled.');
    if (choice !== 'diff') return choice;
    log.message(
      createTwoFilesPatch(
        `${conflict.target} (yours)`,
        `${conflict.target} (loom)`,
        conflict.current,
        conflict.incoming
      )
    );
  }
};

export const isInteractive = () =>
  !!process.stdin.isTTY && !!process.stdout.isTTY && !process.env.CI;
