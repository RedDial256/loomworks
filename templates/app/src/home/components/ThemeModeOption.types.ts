import type { ThemeMode } from '@/theme';

export type ThemeModeOptionProps = {
  mode: ThemeMode;
  selected: boolean;
  onSelect: (mode: ThemeMode) => void;
};
