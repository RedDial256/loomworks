import base from '@red_dial/rn-tooling-config/eslint';
import typescript from '@red_dial/rn-tooling-config/eslint/typescript';

export default [
  { ignores: ['**/dist/**', '**/node_modules/**', '.changeset/**'] },
  ...base,
  ...typescript,
  // No react dependency in the root; pin the version to silence "detect".
  { settings: { react: { version: '19' } } },
];
