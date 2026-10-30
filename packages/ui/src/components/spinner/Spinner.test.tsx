import { AccessibilityInfo } from 'react-native';

import { render, screen } from '@testing-library/react-native';

import { light } from '@/theme';

import { Spinner, SPINNER_SIZES } from './Spinner';

const custom = '#ff0000';

const getSpinner = () => screen.getByTestId('spinner');

describe('Spinner', () => {
  it('is a medium primary spinner by default', async () => {
    await render(<Spinner testID="spinner" />);
    expect(getSpinner()).toHaveProp('size', 'large');
    expect(getSpinner()).toHaveProp('color', light.colors.primary);
    expect(getSpinner()).toHaveProp('animating', true);
    expect(getSpinner()).not.toHaveStyle({ transform: expect.anything() });
  });

  it.each(['S', 'M'] as const)(
    'maps %s to a native size without scaling',
    async (size) => {
      await render(<Spinner testID="spinner" size={size} />);
      expect(getSpinner()).toHaveProp('size', SPINNER_SIZES[size].native);
      expect(getSpinner()).not.toHaveStyle({ transform: expect.anything() });
    }
  );

  it('scales the large indicator up for L and reserves its diameter', async () => {
    await render(<Spinner testID="spinner" size="L" />);
    const { diameter, scale } = SPINNER_SIZES.L;
    expect(getSpinner()).toHaveProp('size', 'large');
    expect(getSpinner()).toHaveStyle({
      width: diameter,
      height: diameter,
      transform: [{ scale }],
    });
  });

  it('takes another color role', async () => {
    await render(<Spinner testID="spinner" color="danger" />);
    expect(getSpinner()).toHaveProp('color', light.colors.danger);
  });

  it('passes a raw color through', async () => {
    await render(<Spinner testID="spinner" color={custom} />);
    expect(getSpinner()).toHaveProp('color', custom);
  });

  it('applies the user style last', async () => {
    await render(
      <Spinner testID="spinner" size="L" style={{ width: 60, margin: 4 }} />
    );
    expect(getSpinner()).toHaveStyle({ width: 60, height: 48, margin: 4 });
  });

  it('keeps spinning under reduced motion', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);
    await render(<Spinner testID="spinner" />);
    expect(getSpinner()).toHaveProp('animating', true);
  });

  describe('a11y', () => {
    it('is a busy progressbar labelled "Loading" by default', async () => {
      await render(<Spinner />);
      const spinner = screen.getByRole('progressbar', { name: 'Loading' });
      expect(spinner).toBeBusy();
      expect(spinner).toHaveProp('accessible', true);
    });

    it('is not busy when stopped', async () => {
      await render(<Spinner animating={false} />);
      expect(screen.getByRole('progressbar')).not.toBeBusy();
      expect(screen.getByRole('progressbar')).toHaveProp('animating', false);
    });

    it('merges the user a11y over the defaults', async () => {
      await render(<Spinner a11y={{ label: 'Saving', hint: 'Please wait' }} />);
      const spinner = screen.getByRole('progressbar', { name: 'Saving' });
      expect(spinner).toBeBusy();
      expect(spinner).toHaveProp('accessibilityHint', 'Please wait');
    });

    it('lets a11y override the role and busy state', async () => {
      await render(<Spinner a11y={{ role: 'image', busy: false }} />);
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(screen.getByRole('image', { name: 'Loading' })).not.toBeBusy();
    });

    it('lets native props override a11y', async () => {
      await render(
        <Spinner a11y={{ label: 'A11y' }} accessibilityLabel="Native" />
      );
      expect(
        screen.getByRole('progressbar', { name: 'Native' })
      ).toBeOnTheScreen();
    });
  });
});
