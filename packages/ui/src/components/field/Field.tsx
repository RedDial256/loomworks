import type { FC } from 'react';
import { View } from 'react-native';

import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Skeleton } from '../skeleton/Skeleton';

import { FieldLabel } from './components/FieldLabel';
import { FieldMessage } from './components/FieldMessage';
import type { FieldProps } from './Field.types';
import { fieldName } from './Field.utils';

/**
 * Frame shared by the fields: the label above, the control (or a busy
 * skeleton at the field height while `loading`) and the hint or error below.
 */
export const Field: FC<FieldProps> = ({
  label,
  required,
  hint,
  error,
  loading,
  children,
}) => {
  const { theme } = useUnistyles();

  if (loading) {
    const name = fieldName(label, required);
    const loadingLabel = name ? `Loading ${name}` : 'Loading';
    return (
      <View style={styles.container}>
        <FieldLabel label={label} required={required} />
        <Skeleton
          height={theme.touchTarget.min}
          radius="md"
          a11y={{ label: loadingLabel, hidden: false, busy: true }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FieldLabel label={label} required={required} />
      {children}
      <FieldMessage error={error} hint={hint} />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.spacing['2xs'] },
}));
