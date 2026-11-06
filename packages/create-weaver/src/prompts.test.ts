import { confirm, isCancel, multiselect, text } from '@clack/prompts';
import { parseManifest } from '@red_dial/loom';
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type Flags, offeredItems, resolveChoices } from './prompts';

vi.mock('@clack/prompts', () => ({
  confirm: vi.fn(),
  isCancel: vi.fn((value: unknown) => typeof value === 'symbol'),
  multiselect: vi.fn(),
  text: vi.fn(),
}));

const manifest = parseManifest(
  JSON.parse(
    readFileSync(new URL('../../ui/manifest.json', import.meta.url), 'utf8')
  )
);
const components = offeredItems(manifest, 'component').map((i) => i.name);
const hooks = offeredItems(manifest, 'hook').map((i) => i.name);

const full: Flags = {
  dir: 'my-app',
  components: 'card',
  hooks: 'boolean',
  install: false,
  git: true,
  tooling: false,
};

/** Queues the user's answers, in prompt order. */
const answer = ({
  name,
  items = [],
  confirms = [],
}: {
  name?: string;
  items?: string[][];
  confirms?: boolean[];
}) => {
  if (name !== undefined) vi.mocked(text).mockResolvedValueOnce(name);
  for (const value of items) {
    vi.mocked(multiselect).mockResolvedValueOnce(value);
  }
  for (const value of confirms) {
    vi.mocked(confirm).mockResolvedValueOnce(value);
  }
};

const resolve = (flags: Flags, interactive = true) =>
  resolveChoices(flags, { manifest, interactive });

beforeEach(() => {
  vi.mocked(text).mockReset();
  vi.mocked(multiselect).mockReset();
  vi.mocked(confirm).mockReset();
});

describe('offeredItems', () => {
  it('offers only what the template does not bring', () => {
    expect(components).toEqual(['card', 'divider', 'switch']);
    expect(hooks).toEqual(['boolean', 'timeout']);
  });

  it('labels hooks by their function name', () => {
    expect(offeredItems(manifest, 'hook')[0]).toEqual({
      name: 'boolean',
      label: 'useBoolean',
      hint: 'boolean state with stable set',
    });
  });
});

describe('resolveChoices', () => {
  it('asks for everything without flags', async () => {
    answer({
      name: 'my-app',
      items: [['switch'], []],
      confirms: [true, false, true],
    });

    await expect(resolve({})).resolves.toEqual({
      dir: 'my-app',
      items: ['switch'],
      install: true,
      git: false,
      tooling: true,
    });
    const offered = vi.mocked(multiselect).mock.calls[0]?.[0];
    expect(offered?.initialValues).toEqual(components);
    expect(offered?.required).toBe(false);
  });

  it('validates the name prompt', async () => {
    answer({ name: 'my-app', items: [[], []], confirms: [true, true, true] });
    await resolve({});
    const validate = vi.mocked(text).mock.calls[0]?.[0].validate as
      ((value: string) => string | undefined) | undefined;
    expect(validate?.('My App')).toContain('Invalid project name');
    expect(validate?.('my-app')).toBeUndefined();
  });

  it('asks nothing when every flag is passed', async () => {
    await expect(resolve(full, false)).resolves.toEqual({
      dir: 'my-app',
      items: ['card', 'boolean'],
      install: false,
      git: true,
      tooling: false,
    });
    expect(text).not.toHaveBeenCalled();
    expect(multiselect).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  it('asks only what the flags leave out', async () => {
    answer({ items: [['divider']], confirms: [false] });
    const { components: _, tooling: __, ...partial } = full;

    await expect(resolve(partial)).resolves.toMatchObject({
      items: ['divider', 'boolean'],
      tooling: false,
    });
    expect(multiselect).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('uses the whole kit with --yes', async () => {
    await expect(resolve({ dir: 'my-app', yes: true }, false)).resolves.toEqual(
      {
        dir: 'my-app',
        items: [...components, ...hooks],
        install: true,
        git: true,
        tooling: true,
      }
    );
  });

  it('lets flags override the --yes defaults', async () => {
    await expect(
      resolve(
        { dir: 'my-app', yes: true, components: '', hooks: 'none', git: false },
        false
      )
    ).resolves.toEqual({
      dir: 'my-app',
      items: [],
      install: true,
      git: false,
      tooling: true,
    });
  });

  it('asks only the name with --yes and no folder', async () => {
    answer({ name: 'my-app' });
    await expect(resolve({ yes: true })).resolves.toMatchObject({
      dir: 'my-app',
    });
    expect(multiselect).not.toHaveBeenCalled();
  });

  it('accepts template items and repeats in the lists', async () => {
    await expect(
      resolve({ ...full, components: ' button, card,card ', hooks: '' }, false)
    ).resolves.toMatchObject({ items: ['button', 'card'] });
  });

  it('lists the missing flags without a terminal', async () => {
    await expect(resolve({ components: 'card' }, false)).rejects.toThrow(
      'Pass a project folder, --hooks, --install or --no-install, --git or --no-git, --tooling or --no-tooling, or --yes'
    );
  });

  it('needs a folder without a terminal, even with --yes', async () => {
    await expect(resolve({ yes: true }, false)).rejects.toThrow(
      'Pass a project folder'
    );
  });

  it('rejects unknown items and the wrong kind', async () => {
    await expect(
      resolve({ ...full, components: 'card,nope,boolean' }, false)
    ).rejects.toThrow('Unknown component(s): nope, boolean.');
    await expect(resolve({ ...full, hooks: 'card' }, false)).rejects.toThrow(
      'Unknown hook(s): card.'
    );
  });

  it('rejects an invalid folder name from the flags', async () => {
    await expect(
      resolve({ ...full, dir: 'apps/My App/' }, false)
    ).rejects.toThrow('Invalid project name "My App"');
  });

  it('stops when the user cancels', async () => {
    vi.mocked(text).mockResolvedValueOnce(Symbol('cancel') as never);
    await expect(resolve({})).rejects.toThrow('Cancelled.');
    expect(isCancel).toHaveBeenCalled();
  });
});
