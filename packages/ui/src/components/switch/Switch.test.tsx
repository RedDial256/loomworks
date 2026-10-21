import { fireEvent, render, screen } from '@testing-library/react-native';

import { light } from '@/theme';

import { Switch } from './Switch';

const getNative = () =>
  screen.getByTestId('sw-native', { includeHiddenElements: true });

describe('Switch', () => {
  it.each([true, false])('reflects value %s', async (value) => {
    await render(
      <Switch testID="sw" value={value} onValueChange={jest.fn()} />
    );
    expect(getNative()).toHaveProp('value', value);
    expect(getNative()).toHaveProp('accessibilityRole', 'switch');
    expect(getNative()).toHaveProp('accessibilityState', {
      checked: value,
      disabled: false,
    });
  });

  it('themes the track and thumb', async () => {
    await render(<Switch testID="sw" value onValueChange={jest.fn()} />);
    expect(getNative()).toHaveProp('onTintColor', light.colors.primary);
    expect(getNative()).toHaveProp('tintColor', light.colors.borderStrong);
    expect(getNative()).toHaveProp('thumbTintColor', light.colors.onPrimary);
    expect(getNative()).toHaveStyle({
      backgroundColor: light.colors.borderStrong,
    });
  });

  it('calls onValueChange from the switch', async () => {
    const onValueChange = jest.fn();
    await render(
      <Switch testID="sw" value={false} onValueChange={onValueChange} />
    );
    fireEvent(getNative(), 'valueChange', true);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  describe('with a label', () => {
    it('is a switch named by the label', async () => {
      await render(
        <Switch
          testID="sw"
          value
          label="Notifications"
          onValueChange={jest.fn()}
        />
      );
      expect(
        screen.getByRole('switch', { name: 'Notifications', checked: true })
      ).toBeOnTheScreen();
    });

    it('toggles from the row', async () => {
      const onValueChange = jest.fn();
      await render(
        <Switch
          testID="sw"
          value
          label="Notifications"
          onValueChange={onValueChange}
        />
      );
      fireEvent.press(screen.getByText('Notifications'));
      expect(onValueChange).toHaveBeenCalledWith(false);
    });
  });

  describe('disabled', () => {
    it('blocks the row and uses the disabled colors', async () => {
      const onValueChange = jest.fn();
      await render(
        <Switch
          testID="sw"
          value={false}
          disabled
          label="Notifications"
          onValueChange={onValueChange}
        />
      );
      fireEvent.press(screen.getByText('Notifications'));
      expect(onValueChange).not.toHaveBeenCalled();
      expect(getNative()).toHaveProp('disabled', true);
      expect(getNative()).toHaveProp(
        'thumbTintColor',
        light.colors.textDisabled
      );
      expect(
        screen.getByRole('switch', { name: 'Notifications', disabled: true })
      ).toBeOnTheScreen();
    });
  });

  describe('loading', () => {
    it('shows a busy skeleton instead of the switch', async () => {
      await render(
        <Switch testID="sw" loading value={false} onValueChange={jest.fn()} />
      );
      expect(
        screen.queryByTestId('sw-native', { includeHiddenElements: true })
      ).toBeNull();
      expect(screen.getByRole('switch', { busy: true })).toBeOnTheScreen();
    });
  });

  it('lets a11y and style override the defaults', async () => {
    await render(
      <Switch
        testID="sw"
        value
        onValueChange={jest.fn()}
        a11y={{ label: 'Dark mode', hint: 'Toggles the theme' }}
        style={{ marginTop: 3 }}
      />
    );
    expect(getNative()).toHaveProp('accessibilityLabel', 'Dark mode');
    expect(getNative()).toHaveProp('accessibilityHint', 'Toggles the theme');
  });

  it('keeps a touch target of at least the minimum', async () => {
    await render(
      <Switch testID="sw" value onValueChange={jest.fn()} label="A" />
    );
    expect(screen.getByTestId('sw')).toHaveStyle({ minHeight: 48 });
  });
});
