import { type FC, useCallback } from 'react';
import { router } from 'expo-router';

import { StyleSheet } from 'react-native-unistyles';

import { Pressable } from '@/components/pressable/Pressable';
import { Text } from '@/components/text/Text';

import type { DemoItemProps } from './DemoItem.types';

export const DemoItem: FC<DemoItemProps> = ({ demo }) => {
  // Navigating inside the drawer navigator also closes the drawer.
  const open = useCallback(
    () =>
      router.navigate({ pathname: '/sandbox/[id]', params: { id: demo.id } }),
    [demo.id]
  );
  return (
    <Pressable a11y={{ role: 'link' }} onPress={open} style={styles.item}>
      <Text>{demo.title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  item: {
    minHeight: theme.touchTarget.min,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
}));
