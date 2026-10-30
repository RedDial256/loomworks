import type { FC } from 'react';

import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Text } from '@/components/text/Text';
import { type ThemeMode, useThemeMode } from '@/theme';

import { ThemeModeOption } from './components/ThemeModeOption';

const MODES: readonly ThemeMode[] = ['system', 'light', 'dark'];

/** Switches between the system, light and dark themes (`useThemeMode`). */
export const ThemeModePicker: FC = () => {
  const { mode, setMode } = useThemeMode();
  return (
    <Box a11y={{ role: 'radiogroup', label: 'Theme' }} style={styles.group}>
      <Text variant="label">Theme</Text>
      <Box style={styles.options}>
        {MODES.map((option) => (
          <ThemeModeOption
            key={option}
            mode={option}
            selected={option === mode}
            onSelect={setMode}
          />
        ))}
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  group: { gap: theme.spacing.xs },
  options: { flexDirection: 'row', gap: theme.spacing.xs },
}));
