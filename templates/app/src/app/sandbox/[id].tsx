import type { FC } from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Drawer } from 'expo-router/drawer';

import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Text } from '@/components/text/Text';
import { DemoSectionView } from '@/sandbox/components/DemoSectionView';
import { demos } from '@/sandbox/demos';
import { findDemo } from '@/sandbox/sandbox.utils';

const DemoScreen: FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const demo = findDemo(demos, id);

  if (!demo) {
    return (
      <Box padding="L" surface="background" style={styles.screen}>
        <Text tone="muted">{`No demo named "${id}".`}</Text>
      </Box>
    );
  }
  const options = { title: demo.title };
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Drawer.Screen options={options} />
      {demo.sections.map((section) => (
        <DemoSectionView key={section.title} section={section} />
      ))}
    </ScrollView>
  );
};

export default DemoScreen;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl, gap: theme.spacing['3xl'] },
}));
