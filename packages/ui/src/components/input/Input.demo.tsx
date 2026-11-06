import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { Input } from './Input';

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  stack: { gap: theme.spacing.lg },
}));

const MIN_PASSWORD = 8;

const validatePassword = (value: string) =>
  value.length < MIN_PASSWORD
    ? `At least ${MIN_PASSWORD} characters`
    : undefined;

const today = new Date();
const inAMonth = new Date(
  today.getFullYear(),
  today.getMonth() + 1,
  today.getDate()
);
const nineAm = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
  9
);

export const demo = {
  title: 'Input',
  keywords: [
    'text field',
    'textinput',
    'form',
    'email',
    'password',
    'date',
    'time',
    'picker',
    'validation',
  ],
  sections: [
    {
      title: 'Text types',
      description:
        'Each type sets the keyboard, autocomplete, content type, secure entry and capitalization.',
      content: (
        <View style={styles.stack}>
          <Input label="Name" placeholder="Ada Lovelace" />
          <Input type="email" label="Email" placeholder="ada@example.com" />
          <Input type="password" label="Password" />
          <Input type="number" label="Quantity" placeholder="0" />
          <Input type="phone" label="Phone" />
          <Input type="search" placeholder="Search" />
        </View>
      ),
    },
    {
      title: 'Hint and validation',
      description:
        'Validation runs on blur, then while typing. The error replaces the hint and is announced.',
      content: (
        <View style={styles.stack}>
          <Input
            type="email"
            label="Email"
            hint="We never share it."
            required
          />
          <Input
            type="password"
            label="New password"
            hint={`At least ${MIN_PASSWORD} characters.`}
            validate={validatePassword}
          />
          <Input
            label="Username"
            defaultValue="ada"
            error="This username is taken"
          />
        </View>
      ),
    },
    {
      title: 'Disabled and loading',
      description:
        'Loading renders a skeleton at the field height, announced as busy. Under reduced motion it stops pulsing.',
      content: (
        <View style={styles.stack}>
          <Input
            label="Account"
            defaultValue="ada@example.com"
            editable={false}
          />
          <Input label="Address" loading />
        </View>
      ),
    },
    {
      title: 'Date and time',
      description:
        'The native picker: inline below the field on iOS, the system dialogs on Android.',
      content: (
        <View style={styles.stack}>
          <Input
            type="date"
            label="Start date"
            placeholder="Pick a day"
            minimum={today}
            maximum={inAMonth}
            hint="Within the next month."
          />
          <Input
            type="time"
            label="Reminder"
            defaultValue={nineAm}
            minuteInterval={15}
          />
          <Input type="datetime" label="Meeting" required />
          <Input type="date" label="Birthday" disabled />
        </View>
      ),
    },
    {
      title: 'Reduced motion',
      description:
        'On iOS the inline picker opens with a height animation; with Reduce Motion on in the system settings it fades in at full height.',
      content: <Input type="date" label="Day" placeholder="Pick a day" />,
    },
  ],
};
