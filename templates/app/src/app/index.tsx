import type { FC } from 'react';
import { Image } from 'expo-image';

import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Text } from '@/components/text/Text';
import { ThemeModePicker } from '@/home/ThemeModePicker';

// Metro resolves the require to an asset id; an `import` would need a `*.png` declaration the project does not ship.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const loomMark = require('../../assets/loom-mark.png') as number;

const HomeScreen: FC = () => {
  return (
    <Box padding="L" surface="background" style={styles.screen}>
      <Image
        accessibilityIgnoresInvertColors
        alt="Loom"
        contentFit="contain"
        source={loomMark}
        style={styles.mark}
        transition={200}
      />
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
  mark: { width: 64, height: 64 },
  screen: { flex: 1, gap: theme.spacing.md },
}));
