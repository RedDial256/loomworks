import { render, screen } from '@testing-library/react-native';

import { light } from '@/theme';

import { Box } from './Box';
import { demo } from './Box.demo';

const custom = '#ff0000';

describe('Box', () => {
  it('has no padding or background by default', async () => {
    await render(<Box testID="box" />);
    expect(screen.getByTestId('box')).not.toHaveStyle({ padding: 16 });
    expect(screen.getByTestId('box')).not.toHaveStyle({
      backgroundColor: light.colors.surface,
    });
  });

  it.each([
    ['none', 0],
    ['S', 8],
    ['M', 16],
    ['L', 24],
  ] as const)('applies padding %s', async (padding, value) => {
    await render(<Box testID="box" padding={padding} />);
    expect(screen.getByTestId('box')).toHaveStyle({ padding: value });
  });

  it.each([
    ['background', light.colors.background],
    ['surface', light.colors.surface],
    ['raised', light.colors.surfaceRaised],
    ['sunken', light.colors.surfaceSunken],
  ] as const)('applies surface %s', async (surface, backgroundColor) => {
    await render(<Box testID="box" surface={surface} />);
    expect(screen.getByTestId('box')).toHaveStyle({ backgroundColor });
  });

  it('puts the user style last', async () => {
    await render(
      <Box
        testID="box"
        padding="M"
        surface="surface"
        style={{ padding: 3, backgroundColor: custom }}
      />
    );
    expect(screen.getByTestId('box')).toHaveStyle({
      padding: 3,
      backgroundColor: custom,
    });
  });

  it('forwards native View props', async () => {
    await render(
      <Box testID="box" accessibilityLabel="Card" pointerEvents="none" />
    );
    expect(screen.getByLabelText('Card')).toHaveProp('pointerEvents', 'none');
  });

  describe('a11y', () => {
    it('is not accessible by default', async () => {
      await render(<Box testID="box" />);
      expect(screen.getByTestId('box')).toHaveProp('accessible', false);
      expect(screen.getByTestId('box')).toHaveProp(
        'importantForAccessibility',
        'no'
      );
    });

    it('lets a11y override the component defaults', async () => {
      await render(
        <Box
          a11y={{
            id: 'card',
            label: 'Card',
            role: 'summary',
            accessible: true,
          }}
        />
      );
      const box = screen.getByRole('summary', { name: 'Card' });
      expect(box).toHaveProp('accessible', true);
      expect(box).toHaveProp('nativeID', 'card');
      expect(screen.getByTestId('card')).toBe(box);
    });

    it('lets native props override a11y', async () => {
      await render(
        <Box
          testID="box"
          a11y={{ label: 'Card', accessible: true, selected: true }}
          accessible={false}
          accessibilityLabel="Native"
          accessibilityState={{ busy: true }}
        />
      );
      const box = screen.getByTestId('box');
      expect(box).toHaveProp('accessible', false);
      expect(box).toHaveProp('accessibilityLabel', 'Native');
      expect(box).toHaveProp('accessibilityState', { busy: true });
    });

    // jest mocks the host View, so this checks RNTL's `aria ?? legacy`
    // reading, which mirrors React Native's View.js.
    it('lets aria-* passed by the user win', async () => {
      await render(
        <Box
          testID="box"
          a11y={{ label: 'Card', accessible: true, disabled: false }}
          aria-label="Aria card"
          aria-disabled
        />
      );
      const box = screen.getByTestId('box');
      expect(box).toHaveAccessibleName('Aria card');
      expect(box).toBeDisabled();
    });

    it('hides the element and its children', async () => {
      await render(
        <Box testID="box" a11y={{ hidden: true }}>
          <Box testID="child" />
        </Box>
      );
      expect(screen.queryByTestId('box')).toBeNull();
      expect(screen.queryByTestId('child')).toBeNull();
    });
  });

  it.each(demo.sections.map((section) => [section.title, section]))(
    'renders the %s demo section',
    async (_, section) => {
      await render(<>{section.content}</>);
      expect(screen.toJSON()).toBeTruthy();
    }
  );
});
