import type {
  AccessibilityRole,
  AccessibilityValue,
  ViewProps,
} from 'react-native';

/** Standard actions; React Native's strict types do not export this union. */
export type AccessibilityActionName =
  'activate' | 'increment' | 'decrement' | 'longpress' | 'magicTap' | 'escape';

export interface A11yAction {
  /** Standard action (`activate`, `increment`, …) or a custom name. */
  name: AccessibilityActionName | (string & {});
  /** Announced by the screen reader; needed for custom actions. */
  label?: string;
  action: () => void;
}

/** Simplified accessibility props (ADR 0003). */
export interface A11y {
  /** Sets `nativeID` and `testID`. */
  id?: string;
  label?: string;
  hint?: string;
  role?: AccessibilityRole;
  value?: AccessibilityValue;
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
  /** Groups the element and its children into one focus stop; `true` unless a component says otherwise. */
  accessible?: boolean;
  /** Hides the element and its children; wins over `accessible`. */
  hidden?: boolean;
  /** iOS only: screen readers ignore the element's siblings. */
  modal?: boolean;
  /** Android only. */
  live?: NonNullable<ViewProps['accessibilityLiveRegion']>;
  /** Replaces the component's actions; spread its exported defaults to extend them. */
  actions?: readonly A11yAction[];
}

/** Legacy native props produced by `easyA11y`. */
export type A11yProps = Pick<
  ViewProps,
  | 'nativeID'
  | 'testID'
  | 'accessible'
  | 'importantForAccessibility'
  | 'accessibilityElementsHidden'
  | 'accessibilityLabel'
  | 'accessibilityHint'
  | 'accessibilityRole'
  | 'accessibilityState'
  | 'accessibilityValue'
  | 'accessibilityLiveRegion'
  | 'accessibilityViewIsModal'
  | 'accessibilityActions'
  | 'onAccessibilityAction'
>;
