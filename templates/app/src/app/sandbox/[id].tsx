import type { FC } from 'react';
import { ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Text } from '@/components/text/Text';
import { DemoSectionView } from '@/sandbox/components/DemoSectionView';
import { demos } from '@/sandbox/demos';
import { sharedTagFor } from '@/sandbox/sandbox.transition';
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
  // The first section is what the card thumbnail shows.
  const [first, ...rest] = demo.sections;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={options} />
      {first ? (
        <Animated.View sharedTransitionTag={sharedTagFor(demo.id)}>
          <DemoSectionView section={first} />
        </Animated.View>
      ) : null}
      {rest.map((section) => (
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
