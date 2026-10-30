import type { FC } from 'react';
import { Modal, Pressable, View } from 'react-native';

import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { easyA11y } from '../../../utils/a11y/easyA11y';
import { Text } from '../../text/Text';
import type { DateTimeSheetProps } from '../DateTimeInput.types';
import { iosDisplay } from '../DateTimeInput.utils';

/** iOS: the picker in a bottom sheet. The backdrop cancels, the button confirms. */
export const DateTimeSheet: FC<DateTimeSheetProps> = ({
  open,
  value,
  mode,
  minimum,
  maximum,
  locale,
  doneLabel,
  onChange,
  onDone,
  onCancel,
}) => {
  const { theme } = useUnistyles();

  const handleChange = (_event: DateTimePickerChangeEvent, next: Date) =>
    onChange(next);

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onCancel}>
      <Pressable
        {...easyA11y({ hidden: true })}
        onPress={onCancel}
        style={styles.backdrop}
      />
      <View
        {...easyA11y({ modal: true, accessible: false })}
        style={styles.sheet}>
        <DateTimePicker
          value={value}
          mode={mode}
          display={iosDisplay(mode)}
          minimumDate={minimum}
          maximumDate={maximum}
          locale={locale}
          accentColor={theme.colors.primary}
          textColor={theme.colors.text}
          onValueChange={handleChange}
        />
        <Pressable
          {...easyA11y({ role: 'button', label: doneLabel })}
          onPress={onDone}
          style={styles.done}>
          <Text variant="label" style={styles.doneText}>
            {doneLabel}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create((theme, rt) => ({
  backdrop: { flex: 1, backgroundColor: theme.colors.overlay },
  sheet: {
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.md + rt.insets.bottom,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceRaised,
  },
  done: {
    minHeight: theme.touchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primary,
  },
  doneText: { color: theme.colors.onPrimary },
}));
