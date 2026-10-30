import type { FC } from 'react';

import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/text/Text';

import type { DemoListEmptyProps } from './DemoListEmpty.types';

export const DemoListEmpty: FC<DemoListEmptyProps> = ({ query }) => {
  const message = query.trim()
    ? `No component matches "${query.trim()}".`
    : 'No components installed yet.';
  return (
    <Text tone="muted" a11y={{ live: 'polite' }} style={styles.message}>
      {message}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  message: { paddingHorizontal: theme.spacing.md },
}));
