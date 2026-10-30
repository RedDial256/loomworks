import type { FC } from 'react';

import { StyleSheet } from 'react-native-unistyles';

import { Text } from '../../text/Text';
import type { FieldLabelProps } from '../Field.types';

export const FieldLabel: FC<FieldLabelProps> = ({ label, required }) => {
  if (!label) return null;
  return (
    <Text variant="label" a11y={{ hidden: true }}>
      {label}
      {required && (
        <Text variant="label" a11y={{ hidden: true }} style={styles.asterisk}>
          {' *'}
        </Text>
      )}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  asterisk: { color: theme.colors.danger },
}));
