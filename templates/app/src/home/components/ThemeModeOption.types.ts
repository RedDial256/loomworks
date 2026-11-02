import type { ThemeMode } from '@/theme';

export interface ThemeModeOptionProps {
  mode: ThemeMode;
  selected: boolean;
  onSelect: (mode: ThemeMode) => void;
}
