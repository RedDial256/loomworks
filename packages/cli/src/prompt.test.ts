import { isCancel, log, select } from '@clack/prompts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { promptConflict } from './prompt';

vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
  isCancel: vi.fn(() => false),
  log: { message: vi.fn() },
}));

const conflict = {
  target: 'src/components/box/Box.tsx',
  current: 'export const Box = "mine";\n',
  incoming: 'export const Box = 1;\n',
};

beforeEach(() => {
  vi.mocked(select).mockReset();
  vi.mocked(isCancel).mockReturnValue(false);
  vi.mocked(log.message).mockReset();
});

describe('promptConflict', () => {
  it.each(['overwrite', 'skip'] as const)('returns %s', async (choice) => {
    vi.mocked(select).mockResolvedValueOnce(choice);
    await expect(promptConflict(conflict)).resolves.toBe(choice);
  });

  it('shows the diff and asks again', async () => {
    vi.mocked(select)
      .mockResolvedValueOnce('diff')
      .mockResolvedValueOnce('skip');

    await expect(promptConflict(conflict)).resolves.toBe('skip');
    expect(select).toHaveBeenCalledTimes(2);
    const patch = vi.mocked(log.message).mock.calls[0]?.[0];
    expect(patch).toContain('-export const Box = "mine";');
    expect(patch).toContain('+export const Box = 1;');
  });

  it('throws when cancelled', async () => {
    vi.mocked(select).mockResolvedValueOnce(Symbol('cancel'));
    vi.mocked(isCancel).mockReturnValueOnce(true);
    await expect(promptConflict(conflict)).rejects.toThrow('Cancelled.');
  });
});
