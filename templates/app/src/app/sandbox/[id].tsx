import type { FC } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Text } from '@/components/text/Text';
import { findDemo } from '@/sandbox/demos';

const DemoScreen: FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const demo = findDemo(id);

  if (!demo) {
    return (
      <Box padding="L" surface="background" style={styles.screen}>
        <Text tone="muted">{`No demo named "${id}".`}</Text>
      </Box>
    );
  }
  const options = { title: demo.title };
  return (
    <Box padding="L" surface="background" style={styles.screen}>
      <Drawer.Screen options={options} />
      <Text variant="h3">{demo.title}</Text>
    </Box>
  );
};

export default DemoScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
