/** `system` follows the device color scheme (Unistyles adaptive themes). */
export type ThemeMode = 'system' | 'light' | 'dark';

export type UseThemeModeResult = {
  /** The stored or chosen mode; `system` when none is set. */
  mode: ThemeMode;
  /** Applies the mode at once and persists it in AsyncStorage. */
  setMode: (mode: ThemeMode) => void;
};
