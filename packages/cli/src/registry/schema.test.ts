import { describe, expect, it } from 'vitest';

import { manifestFiles, parseManifest } from './schema';

const minimums = { expo: '>=56.0.23 <58' };
const box = { kind: 'component', files: ['components/box/Box.tsx'] };

const manifest = (items: Record<string, unknown>) => ({
  version: 1,
  minimums,
  items,
});

describe('parseManifest', () => {
  it('accepts a valid manifest and applies defaults', () => {
    const parsed = parseManifest(
      manifest({
        box,
        text: {
          kind: 'component',
          files: ['components/text/Text.tsx'],
          demo: 'components/text/Text.demo.tsx',
          dependencies: ['box'],
          packages: { 'react-native-unistyles': '^3.5.2' },
        },
      })
    );

    expect(parsed.items.box?.dependencies).toEqual([]);
    expect(parsed.items.box?.packages).toEqual({});
    expect(parsed.items.box?.sdkPackages).toEqual([]);
    expect(manifestFiles(parsed)).toEqual([
      'components/box/Box.tsx',
      'components/text/Text.tsx',
      'components/text/Text.demo.tsx',
    ]);
  });

  it('accepts an empty registry', () => {
    expect(parseManifest(manifest({})).items).toEqual({});
  });

  it.each([
    ['unknown version', { version: 2, minimums, items: {} }],
    ['unknown top-level key', { version: 1, minimums, items: {}, extra: true }],
    ['missing minimums', { version: 1, items: {} }],
    ['invalid item name', manifest({ Box: box })],
    ['unknown item key', manifest({ box: { ...box, extra: 1 } })],
    ['no files', manifest({ box: { kind: 'component', files: [] } })],
    ['absolute path', manifest({ box: { ...box, files: ['/etc/passwd'] } })],
    ['parent segment', manifest({ box: { ...box, files: ['../ui/Box.tsx'] } })],
    [
      'backslash path',
      manifest({ box: { ...box, files: ['components\\Box.tsx'] } }),
    ],
    [
      'test file',
      manifest({ box: { ...box, files: ['components/box/Box.test.tsx'] } }),
    ],
    [
      'demo not named *.demo.*',
      manifest({ box: { ...box, demo: 'components/box/BoxExample.tsx' } }),
    ],
    [
      'demo also in files',
      manifest({
        box: {
          ...box,
          files: ['components/box/Box.demo.tsx'],
          demo: 'components/box/Box.demo.tsx',
        },
      }),
    ],
    [
      'package in packages and sdkPackages',
      manifest({
        box: {
          ...box,
          packages: { 'react-native-reanimated': '^4.3.1' },
          sdkPackages: ['react-native-reanimated'],
        },
      }),
    ],
    [
      'unknown dependency',
      manifest({ box: { ...box, dependencies: ['ghost'] } }),
    ],
    [
      'dependency cycle',
      manifest({
        a: { kind: 'util', files: ['a.ts'], dependencies: ['b'] },
        b: { kind: 'util', files: ['b.ts'], dependencies: ['a'] },
      }),
    ],
    [
      'theme item outside theme/',
      manifest({ theme: { kind: 'theme', files: ['palette.ts'] } }),
    ],
    [
      'component under theme/',
      manifest({ box: { ...box, files: ['theme/Box.tsx'] } }),
    ],
    [
      'file owned by two items',
      manifest({
        box,
        other: { kind: 'component', files: ['components/box/Box.tsx'] },
      }),
    ],
  ])('rejects %s', (_label, input) => {
    expect(() => parseManifest(input)).toThrow(/Invalid manifest/);
  });
});
