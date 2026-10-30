import { useSyncExternalStore } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UnistylesRuntime } from 'react-native-unistyles';

import type { ThemeMode, UseThemeModeResult } from './useThemeMode.types';

export const THEME_MODE_KEY = 'loom.themeMode';

const MODES: readonly string[] = ['system', 'light', 'dark'];

// Module state: one mode per app, shared by every hook instance.
let current: ThemeMode = 'system';
let chosen = false;
let restoring: Promise<ThemeMode> | undefined;
const listeners = new Set<() => void>();

const apply = (mode: ThemeMode) => {
  if (mode === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    // Unistyles rejects `setTheme` while adaptive themes are on.
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(mode);
  }
  current = mode;
  listeners.forEach((listener) => listener());
};

const isThemeMode = (value: string | null): value is ThemeMode =>
  value !== null && MODES.includes(value);

/** Applies a mode outside React; same as `setMode` from the hook. */
export const setThemeMode = (mode: ThemeMode): void => {
  chosen = true;
  apply(mode);
  // Best effort: a failed write only loses the choice on the next launch.
  AsyncStorage.setItem(THEME_MODE_KEY, mode).catch(() => {});
};

/**
 * Reads the stored mode once and applies it; later calls return the same promise.
 * Started by `theme/unistyles.ts`. Until it resolves the app follows the system,
 * so keep the splash screen up until it settles to avoid a flash.
 * A mode set before it resolves wins over the stored one.
 */
export const restoreThemeMode = (): Promise<ThemeMode> => {
  restoring ??= AsyncStorage.getItem(THEME_MODE_KEY).then(
    (stored) => {
      if (!chosen && isThemeMode(stored) && stored !== current) apply(stored);
      return current;
    },
    () => current
  );
  return restoring;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getMode = () => current;

/** `system | light | dark` theme mode, persisted in AsyncStorage. */
export const useThemeMode = (): UseThemeModeResult => {
  const mode = useSyncExternalStore(subscribe, getMode, getMode);
  return { mode, setMode: setThemeMode };
};
