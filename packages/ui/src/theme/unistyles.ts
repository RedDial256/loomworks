// Import once from the app entry, after `expo-router/entry`, before any component.
import { StyleSheet } from 'react-native-unistyles';

import { dark } from './dark';
import { light } from './light';
import { restoreThemeMode } from './useThemeMode';

const themes = { light, dark };

const breakpoints = { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200 };

type AppThemes = typeof themes;
type AppBreakpoints = typeof breakpoints;

// Module augmentation needs interfaces, even empty ones.
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

StyleSheet.configure({
  themes,
  breakpoints,
  // Follows the system color scheme until `useThemeMode` applies a stored or chosen mode.
  settings: { adaptiveThemes: true },
});

// AsyncStorage has no synchronous read, so `initialTheme` cannot apply the stored
// mode: start the read here, as early as possible, and await
// `restoreThemeMode()` before hiding the splash screen.
void restoreThemeMode();
