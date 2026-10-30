import type { FC } from 'react';

import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Text } from '@/components/text/Text';

import type { DemoSectionViewProps } from './DemoSectionView.types';

export const DemoSectionView: FC<DemoSectionViewProps> = ({ section }) => {
  return (
    <Box style={styles.section}>
      <Text variant="title">{section.title}</Text>
      {section.description ? (
        <Text tone="muted">{section.description}</Text>
      ) : null}
      <Box style={styles.content}>{section.content}</Box>
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  section: { gap: theme.spacing.xs },
  content: { paddingTop: theme.spacing.xs },
}));
