import type { FC } from 'react';

import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/text/Text';

import type { GridHeaderProps } from './GridHeader.types';

/** Section title above a group of cards, spanning the whole grid. */
export const GridHeader: FC<GridHeaderProps> = ({ title }) => {
  return (
    <Text variant="title" style={styles.title}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  title: { paddingTop: theme.spacing.md },
}));
