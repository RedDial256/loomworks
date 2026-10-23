# Code style

Enforced by `pnpm lint` (ESLint, `tooling/eslint/style.js`) and `tsconfig.base.json`. The ESLint part is meant to move to `@red_dial/rn-tooling-config/eslint/style`; once that is published, delete `tooling/` and import the package subpath in `eslint.config.js`.

## Components

- `export const Name: FC<NameProps> = () => {}`. Every function is an arrow function; no `function` declarations.
- Props types live in `Name.types.ts`. No types made up in the signature (`FC<Pick<InputProps, 'label'>>`, `FC<A & B>`): name them there.
- One component per file (`react/no-multi-comp`). Put extra components in `components/`, one file each, and share constants, functions and hooks through `Name.utils.ts`. A tiny, simple accessory may stay in the file with an `eslint-disable-next-line react/no-multi-comp` and a reason.
- No inline functions, `bind`, ternaries or `??` in JSX props. Extract to a const or a function above the `return`.
- No `??` chains, no `??` mixed with a ternary, no nested ternaries. Use `if`/`else` or a small function (`buttonHitSlop(bare, size)` returns `undefined` when no slop is needed).

## Order inside a component

1. `useState` / `useReducer`
2. `useRef`
3. custom hooks (own hooks: relative or `@/` import, or declared in the file)
4. library hooks (any other `use*`, including `styles.useVariants`)
5. `useCallback`
6. `useMemo`
7. functions
8. effects: `useEffect`, `useLayoutEffect`, `useImperativeHandle`
9. loose values (what only the JSX uses)

Exceptions the rule already allows:

- An early return (`if (loading) return ...`) is not ordered. Put it right after the last hook; hooks cannot follow it (`rules-of-hooks`).
- A statement may stay below something it reads (`const x = useFoo(); useState(x)`), and a value that a hook or function reads is not "loose": `const bare = ...; styles.useVariants({ bare })` is fine.

### Tensions

- `no-use-before-define` vs the order above: callbacks and effects sit before or after functions that they call from inside a closure, so the rule runs with `variables: false` (closures may reference later declarations; same-scope use before definition still errors). A callback that runs during render, such as a `useMemo` factory, must not call a function declared below it (it would hit the temporal dead zone); the order keeps functions after memos for this reason, so compute from values or move the function into `Name.utils.ts`.
- `react-hooks/immutability` (React Compiler lint) rejects reading a function before it is declared inside a hook callback. That is why `useImperativeHandle` counts as an effect and goes after the functions it exposes.

## Imports

`perfectionist/sort-imports` (react, react-native, expo; libraries; `@/`; parents; siblings, alphabetical) and `@typescript-eslint/consistent-type-imports` with inline type specifiers (`import { type FC, useState }`; `import type { X }` when only types, so `verbatimModuleSyntax` keeps no empty import).

## TypeScript

`tsconfig.base.json` adds `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noImplicitReturns`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters` and `allowUnreachableCode: false` on top of `strict` and `noUncheckedIndexedAccess`. TypeScript cannot express the component and JSX rules; those are ESLint only.
