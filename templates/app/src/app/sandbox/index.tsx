import type { FC } from 'react';

import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Text } from '@/components/text/Text';

const SandboxScreen: FC = () => {
  return (
    <Box padding="L" surface="background" style={styles.screen}>
      <Text tone="muted">Open the menu to search the components.</Text>
    </Box>
  );
};

export default SandboxScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
