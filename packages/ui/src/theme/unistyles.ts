// Import once from the app entry, after `expo-router/entry`, before any component.
import { StyleSheet } from 'react-native-unistyles';

import { dark } from './dark';
import { light } from './light';

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
  // Follows the system color scheme; `useThemeMode` adds a manual override later.
  settings: { adaptiveThemes: true },
});
