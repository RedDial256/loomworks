import type { DemoEntry } from './demos.types';

/** Wait before filtering, so the list does not rebuild on every keystroke. */
export const SEARCH_DELAY = 200;

// Case- and accent-insensitive: "botao" finds "Botão".
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** Entries whose title or a keyword contains `query`; all of them for an empty query. */
export const filterDemos = (
  entries: readonly DemoEntry[],
  query: string
): readonly DemoEntry[] => {
  const needle = normalize(query);
  if (!needle) return entries;
  return entries.filter((entry) =>
    [entry.title, ...entry.keywords].some((term) =>
      normalize(term).includes(needle)
    )
  );
};

export const findDemo = (
  entries: readonly DemoEntry[],
  id: string | undefined
) => entries.find((entry) => entry.id === id);
