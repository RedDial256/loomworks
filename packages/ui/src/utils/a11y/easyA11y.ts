import type { AccessibilityState } from 'react-native';

import type { A11y, A11yProps } from './easyA11y.types';

const DEFAULTS: A11y = { accessible: true };

const STATE_KEYS = [
  'disabled',
  'selected',
  'checked',
  'busy',
  'expanded',
] as const satisfies readonly (keyof AccessibilityState)[];

/** Maps the simplified `a11y` object to legacy native props. */
export const easyA11y = (a11y?: A11y): A11yProps => {
  const { id, hidden, actions, ...rest } = { ...DEFAULTS, ...a11y };
  // A hidden element must not stay focusable through the `accessible` default.
  const accessible = hidden === true ? false : rest.accessible;
  const state: AccessibilityState = {};
  for (const key of STATE_KEYS) {
    if (rest[key] !== undefined) Object.assign(state, { [key]: rest[key] });
  }

  // React Native's strict types make these props read-only, so the object is built in one go.
  const props: A11yProps = {
    nativeID: id,
    testID: id,
    accessible,
    importantForAccessibility: importance(hidden, accessible),
    accessibilityElementsHidden: hidden,
    accessibilityLabel: rest.label,
    accessibilityHint: rest.hint,
    accessibilityRole: rest.role,
    accessibilityValue: rest.value,
    accessibilityLiveRegion: rest.live,
    accessibilityViewIsModal: rest.modal,
    accessibilityState: Object.keys(state).length > 0 ? state : undefined,
    accessibilityActions: actions?.length
      ? actions.map(({ name, label }) => ({ name, label }))
      : undefined,
    onAccessibilityAction: actions?.length
      ? (event) =>
          actions.find((a) => a.name === event.nativeEvent.actionName)?.action()
      : undefined,
  };

  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined)
  );
};

const importance = (
  hidden: boolean | undefined,
  accessible: boolean | undefined
): A11yProps['importantForAccessibility'] => {
  if (hidden) return 'no-hide-descendants';
  if (accessible !== undefined) return accessible ? 'yes' : 'no';
  return hidden === false ? 'auto' : undefined;
};
