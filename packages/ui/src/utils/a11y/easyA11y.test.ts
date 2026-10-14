import type { AccessibilityActionEvent } from 'react-native';

import { easyA11y } from './easyA11y';

const actionEvent = (actionName: string) =>
  ({ nativeEvent: { actionName } }) as AccessibilityActionEvent;

describe('easyA11y', () => {
  it('defaults to an accessible element', () => {
    expect(easyA11y()).toEqual({
      accessible: true,
      importantForAccessibility: 'yes',
    });
  });

  it.each([
    ['label', 'accessibilityLabel', 'Save'],
    ['hint', 'accessibilityHint', 'Saves the draft'],
    ['role', 'accessibilityRole', 'button'],
    ['value', 'accessibilityValue', { min: 0, max: 10, now: 4 }],
    ['live', 'accessibilityLiveRegion', 'polite'],
    ['modal', 'accessibilityViewIsModal', true],
  ] as const)('maps %s to %s', (key, prop, value) => {
    expect(easyA11y({ [key]: value })).toMatchObject({ [prop]: value });
  });

  it('maps id to nativeID and testID', () => {
    expect(easyA11y({ id: 'email-label' })).toMatchObject({
      nativeID: 'email-label',
      testID: 'email-label',
    });
  });

  it.each([
    ['disabled', true],
    ['selected', false],
    ['checked', 'mixed'],
    ['busy', true],
    ['expanded', false],
  ] as const)('maps %s into accessibilityState', (key, value) => {
    expect(easyA11y({ [key]: value }).accessibilityState).toEqual({
      [key]: value,
    });
  });

  it('omits accessibilityState when no state key is set', () => {
    expect(easyA11y({ label: 'Save' })).not.toHaveProperty(
      'accessibilityState'
    );
  });

  it.each([
    [true, 'yes'],
    [false, 'no'],
  ] as const)(
    'maps accessible %s to importantForAccessibility %s',
    (accessible, importance) => {
      expect(easyA11y({ accessible })).toEqual({
        accessible,
        importantForAccessibility: importance,
      });
    }
  );

  it('lets hidden win over accessible', () => {
    expect(easyA11y({ hidden: true, accessible: true })).toEqual({
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    });
  });

  it('emits explicit values for hidden false', () => {
    expect(easyA11y({ hidden: false })).toEqual({
      accessible: true,
      accessibilityElementsHidden: false,
      importantForAccessibility: 'yes',
    });
    expect(easyA11y({ hidden: false, accessible: undefined })).toMatchObject({
      importantForAccessibility: 'auto',
    });
  });

  it('maps actions to the action list and one handler', () => {
    const activate = jest.fn();
    const reset = jest.fn();
    const props = easyA11y({
      actions: [
        { name: 'activate', action: activate },
        { name: 'reset', label: 'Reset', action: reset },
      ],
    });

    expect(props.accessibilityActions).toEqual([
      { name: 'activate', label: undefined },
      { name: 'reset', label: 'Reset' },
    ]);
    props.onAccessibilityAction?.(actionEvent('reset'));
    props.onAccessibilityAction?.(actionEvent('unknown'));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(activate).not.toHaveBeenCalled();
  });

  it('omits action props for an empty list', () => {
    const props = easyA11y({ actions: [] });
    expect(props).not.toHaveProperty('accessibilityActions');
    expect(props).not.toHaveProperty('onAccessibilityAction');
  });

  it('lets the merged a11y object override the function defaults', () => {
    const component = { accessible: false, role: 'header' } as const;
    expect(easyA11y({ ...component })).toMatchObject({
      accessible: false,
      accessibilityRole: 'header',
    });
    expect(easyA11y({ ...component, accessible: true })).toMatchObject({
      accessible: true,
      accessibilityRole: 'header',
    });
  });
});
