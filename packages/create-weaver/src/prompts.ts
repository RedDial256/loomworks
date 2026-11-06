import { confirm, isCancel, multiselect, text } from '@clack/prompts';
import { type Manifest, resolveItems } from '@red_dial/loom';

import { invalidName, TEMPLATE_ITEMS } from './create';

/** Command-line values; `undefined` means the flag was not passed. */
export type Flags = {
  dir?: string;
  yes?: boolean;
  /** Comma-separated item names; `''` or `none` for none. */
  components?: string;
  hooks?: string;
  install?: boolean;
  git?: boolean;
  tooling?: boolean;
};

export type Choices = {
  dir: string;
  /** Components and hooks to add on top of the template's. */
  items: string[];
  install: boolean;
  git: boolean;
  tooling: boolean;
};

type Kind = 'component' | 'hook';
type Offer = { name: string; label: string; hint?: string };

/** Components and hooks the user can pick: the ones the template does not already bring. */
export const offeredItems = (manifest: Manifest, kind: Kind): Offer[] => {
  const included = new Set(resolveItems(manifest, TEMPLATE_ITEMS));
  return Object.entries(manifest.items)
    .filter(([name, item]) => item.kind === kind && !included.has(name))
    .map(([name, { description }]) => {
      // Hook descriptions start with the hook name: "useBoolean: boolean state …".
      const [head, rest] = description?.split(/:\s+/, 2) ?? [];
      return kind === 'hook' && rest
        ? { name, label: head ?? name, hint: firstClause(rest) }
        : { name, label: name, hint: description && firstClause(description) };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

const firstClause = (description: string) =>
  description.split(/[:.,;](\s|$)/, 1)[0];

/** Fills the choices from the flags, then `--yes` defaults, then prompts. Without a terminal, missing flags are an error. */
export const resolveChoices = async (
  flags: Flags,
  { manifest, interactive }: { manifest: Manifest; interactive: boolean }
): Promise<Choices> => {
  const components = offeredItems(manifest, 'component');
  const hooks = offeredItems(manifest, 'hook');
  const picked = {
    components: parseList(flags.components, manifest, 'component'),
    hooks: parseList(flags.hooks, manifest, 'hook'),
  };

  // --yes: the whole kit, with install, git and tooling.
  const defaults = flags.yes
    ? {
        components: components.map((item) => item.name),
        hooks: hooks.map((item) => item.name),
        install: true,
        git: true,
        tooling: true,
      }
    : {};
  const filled = {
    dir: flags.dir,
    components: picked.components ?? defaults.components,
    hooks: picked.hooks ?? defaults.hooks,
    install: flags.install ?? defaults.install,
    git: flags.git ?? defaults.git,
    tooling: flags.tooling ?? defaults.tooling,
  };

  if (!interactive) {
    const missing = Object.entries(filled)
      .filter(([, value]) => value === undefined)
      .map(([key]) => FLAG_NAMES[key as keyof typeof FLAG_NAMES]);
    if (missing.length) {
      throw new Error(
        `No terminal to ask in. Pass ${missing.join(', ')}, or --yes for the defaults.`
      );
    }
  }

  const dir = filled.dir ?? (await askName());
  const nameError = invalidName(baseName(dir));
  if (nameError) throw new Error(nameError);

  return {
    dir,
    items: [
      ...(filled.components ??
        (await askItems('Components to add', components))),
      ...(filled.hooks ?? (await askItems('Hooks to add', hooks))),
    ],
    install:
      filled.install ??
      (await ask(confirm({ message: 'Install dependencies now?' }))),
    git:
      filled.git ??
      (await ask(confirm({ message: 'Initialize a git repository?' }))),
    tooling:
      filled.tooling ??
      (await ask(
        confirm({
          message:
            'Set up ESLint and Prettier with @red_dial/rn-tooling-config?',
        })
      )),
  };
};

const FLAG_NAMES = {
  dir: 'a project folder',
  components: '--components',
  hooks: '--hooks',
  install: '--install or --no-install',
  git: '--git or --no-git',
  tooling: '--tooling or --no-tooling',
};

/** Item names from a flag, checked against the manifest. */
const parseList = (
  value: string | undefined,
  manifest: Manifest,
  kind: Kind
): string[] | undefined => {
  if (value === undefined) return undefined;
  const names = value
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name && name !== 'none');
  const wrong = names.filter((name) => manifest.items[name]?.kind !== kind);
  if (wrong.length) {
    const available = Object.keys(manifest.items)
      .filter((name) => manifest.items[name]?.kind === kind)
      .sort()
      .join(', ');
    throw new Error(
      `Unknown ${kind}(s): ${wrong.join(', ')}. Available: ${available}.`
    );
  }
  return [...new Set(names)];
};

const baseName = (dir: string) =>
  dir
    .replace(/[/\\]+$/, '')
    .split(/[/\\]/)
    .pop() ?? dir;

const ask = async <T>(answer: Promise<T>): Promise<Exclude<T, symbol>> => {
  const value = await answer;
  if (isCancel(value)) throw new Error('Cancelled.');
  return value as Exclude<T, symbol>;
};

const askName = () =>
  ask(
    text({
      message: 'Project name',
      placeholder: 'my-app',
      validate: (value) => invalidName(value ?? ''),
    })
  );

const askItems = async (message: string, offers: Offer[]) => {
  if (!offers.length) return [];
  return ask(
    multiselect({
      message: `${message} (the template already has its own)`,
      options: offers.map(({ name, label, hint }) => ({
        value: name,
        label,
        hint,
      })),
      initialValues: offers.map((offer) => offer.name),
      required: false,
    })
  );
};
