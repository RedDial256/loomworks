import type { FC } from 'react';

import { StyleSheet } from 'react-native-unistyles';

import { Text } from '../../text/Text';
import type { FieldMessageProps } from '../Field.types';

/** The error replaces the hint; the hint is read through the field's accessibility hint. */
export const FieldMessage: FC<FieldMessageProps> = ({ error, hint }) => {
  if (error !== undefined) {
    return (
      <Text
        variant="caption"
        style={styles.error}
        a11y={{ role: 'alert', live: 'assertive' }}>
        {error}
      </Text>
    );
  }
  if (!hint) return null;
  return (
    <Text variant="caption" tone="muted" a11y={{ hidden: true }}>
      {hint}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  error: { color: theme.colors.danger },
}));
