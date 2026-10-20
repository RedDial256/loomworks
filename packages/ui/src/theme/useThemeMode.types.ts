/** `system` follows the device color scheme (Unistyles adaptive themes). */
export type ThemeMode = 'system' | 'light' | 'dark';

export interface UseThemeModeResult {
  mode: ThemeMode;
  /** Applies the mode at once and persists it in AsyncStorage. */
  setMode: (mode: ThemeMode) => void;
}
