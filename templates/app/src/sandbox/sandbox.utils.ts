import type { DemoEntry } from './demos.types';

/** Wait before filtering, so the list does not rebuild on every keystroke. */
export const SEARCH_DELAY = 200;

/** Grid padding and gap, in pt (`theme.spacing.md`). */
export const GRID_GAP = 16;

/** Narrowest card before the grid drops a column. */
const MIN_CARD_WIDTH = 150;

// Case- and accent-insensitive: "botao" finds "Botão".
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** Entries whose title contains `query`; all of them for an empty query. */
export const filterDemos = (
  entries: readonly DemoEntry[],
  query: string
): readonly DemoEntry[] => {
  const needle = normalize(query);
  if (!needle) return entries;
  return entries.filter((entry) => normalize(entry.title).includes(needle));
};

export const findDemo = (
  entries: readonly DemoEntry[],
  id: string | undefined
) => entries.find((entry) => entry.id === id);

/** Columns and card width for a grid `width` wide, padded and spaced by `GRID_GAP`. */
export const gridLayout = (width: number) => {
  const inner = width - GRID_GAP * 2;
  const columns = Math.max(
    1,
    Math.floor((inner + GRID_GAP) / (MIN_CARD_WIDTH + GRID_GAP))
  );
  const cardWidth = (inner - GRID_GAP * (columns - 1)) / columns;
  return { columns, cardWidth };
};
