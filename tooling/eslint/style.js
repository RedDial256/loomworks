// TEMPORARY copy of @red_dial/rn-tooling-config/eslint/style (rn-tooling PR). Delete this folder and import the package subpath once it is published.
// OPT-IN — layer after ./react (or the default entry) and, for the type
// rules, after ./typescript or ./typescript-strict. Not part of the default
// export: it is an opinionated code style, not hygiene.
//
// The style: components are `const Name: FC<NameProps> = () => {}`, every
// function is an arrow function, JSX holds no logic (no inline functions, no
// ternaries or `??` in props), no chains of `??` / ternaries, no types made up
// inside the component signature, one component per file, and a fixed order
// inside the component body (see ./plugin/component-order.js).
//
// Type-only rules need nothing but the fast TypeScript tier. Import order and
// type-import *sorting* live in ./imports.
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

import plugin from './plugin/index.js';

const syntax = (selector, message) => ({ selector, message });

const FC_NAMES = '/^(FC|FunctionComponent|VFC)$/';

const restrictedSyntax = [
  syntax(
    'FunctionDeclaration',
    'Use an arrow function: const name = () => {}.'
  ),
  syntax(
    'JSXAttribute > JSXExpressionContainer > :matches(ArrowFunctionExpression, FunctionExpression)',
    'No inline function in JSX: declare it as a const above the return.'
  ),
  syntax(
    'JSXAttribute > JSXExpressionContainer > CallExpression[callee.property.name="bind"]',
    'No bind in JSX: declare the handler as an arrow function above the return.'
  ),
  syntax(
    'JSXAttribute > JSXExpressionContainer > :matches(ConditionalExpression, LogicalExpression[operator="??"])',
    'No ternary or ?? in a JSX prop: extract it to a const or a function above the return.'
  ),
  syntax(
    'LogicalExpression[operator="??"] > LogicalExpression[operator="??"]',
    'No chain of ??: use if/else or a function.'
  ),
  syntax(
    'ConditionalExpression > LogicalExpression[operator="??"], LogicalExpression[operator="??"] > ConditionalExpression',
    'Do not mix ?? and a ternary in one expression: use if/else or a function.'
  ),
  syntax(
    `TSTypeReference[typeName.name=${FC_NAMES}] > TSTypeParameterInstantiation > :matches(TSTypeLiteral, TSIntersectionType, TSUnionType, TSTypeReference[typeArguments])`,
    'Do not create a type in the component signature: declare a named Props type in the .types.ts file.'
  ),
];

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    plugins: {
      '@red_dial': plugin,
      react,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Arrow function components: `const Name: FC<NameProps> = () => {}`.
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      // One component per file; extra components go in `components/`.
      'react/no-multi-comp': ['error', { ignoreStateless: false }],
      'react/no-unstable-nested-components': 'error',
      // Every function is an arrow function.
      'prefer-arrow-callback': 'error',
      'no-nested-ternary': 'error',
      // Only where precedence is easy to misread; arithmetic is left to Prettier.
      'no-mixed-operators': [
        'error',
        {
          groups: [
            ['&&', '||', '??'],
            ['in', 'instanceof'],
          ],
        },
      ],
      // Same-scope TDZ stays an error; references from inside a closure are
      // allowed, otherwise the body order (callbacks before functions) cannot
      // hold. A callback that runs during render (`useMemo`) must still not
      // call a function declared below it.
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false, classes: false, variables: false, typedefs: false },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@red_dial/component-order': 'error',
      'no-restricted-syntax': ['error', ...restrictedSyntax],
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...restrictedSyntax,
        syntax(
          'VariableDeclarator[id.name=/^[A-Z][A-Za-z0-9]*[a-z]/][init.type="ArrowFunctionExpression"]:not([id.typeAnnotation])',
          'Type the component in its declaration: const Name: FC<NameProps> = () => {}.'
        ),
      ],
    },
  },
  {
    // Tests build fixtures with components of their own.
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**'],
    rules: {
      'react/no-multi-comp': 'off',
      'react/function-component-definition': 'off',
      'react/no-unstable-nested-components': 'off',
      'no-restricted-syntax': 'off',
    },
  },
];
