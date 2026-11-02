import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

import { useUnistyles } from 'react-native-unistyles';

/** React Navigation theme (headers, tab bar, drawer) from the current Unistyles theme. */
export const useNavigationTheme = (): Theme => {
  const { theme, rt } = useUnistyles();
  const dark = rt.themeName === 'dark';
  const base = dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
};
