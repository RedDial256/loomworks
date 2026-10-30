import type { FC } from 'react';

import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Text } from '@/components/text/Text';
import { ThemeModePicker } from '@/home/ThemeModePicker';

const HomeScreen: FC = () => {
  return (
    <Box padding="L" surface="background" style={styles.screen}>
      <Text variant="h2">Home</Text>
      <Text tone="muted">
        Browse the installed components in the sandbox tab.
      </Text>
      <ThemeModePicker />
    </Box>
  );
};

export default HomeScreen;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, gap: theme.spacing.md },
}));
