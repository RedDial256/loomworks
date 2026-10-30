import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import type { RunCommand } from '../project/packages';

export const tempDir = (prefix: string) => mkdtemp(join(tmpdir(), prefix));

export const writeTree = async (
  base: string,
  files: Record<string, string>
) => {
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(base, path)), { recursive: true });
    await writeFile(join(base, path), content);
  }
};

export const read = (base: string, path: string) =>
  readFile(join(base, path), 'utf8');

// Loose typing keeps assertions on nested JSON short.
export const readJsonFile = async (base: string, path: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  JSON.parse(await read(base, path)) as Record<string, any>;

/** A RunCommand that records calls instead of installing. */
export const fakeRun = () => {
  const calls: string[] = [];
  const run: RunCommand = async (command, args) => {
    calls.push([command, ...args].join(' '));
  };
  return { run, calls };
};

/** A fresh Expo Router project, as created by create-expo-app (SDK 58). */
export const expoProject = (deps: Record<string, string> = {}) => ({
  'package.json': `${JSON.stringify(
    {
      name: 'app',
      main: 'expo-router/entry',
      dependencies: {
        expo: '~58.0.21',
        'expo-router': '~58.0.28',
        'react-native-gesture-handler': '~3.3.0',
        ...deps,
      },
    },
    null,
    2
  )}\n`,
  'package-lock.json': '{}',
  'tsconfig.json': `{
  // Expo base config
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
`,
  'app.json': `${JSON.stringify(
    { expo: { name: 'app', plugins: ['expo-router'] } },
    null,
    2
  )}\n`,
});
