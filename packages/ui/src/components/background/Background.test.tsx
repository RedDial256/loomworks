import { View } from 'react-native';

import { render, screen } from '@testing-library/react-native';

import { light } from '@/theme';

import { Background } from './Background';
import { demo } from './Background.demo';
import type { BackgroundProps } from './Background.types';

const custom = '#ff0000';
const other = '#00ff00';

// Fill is hidden from screen readers, so queries must include hidden elements.
const getBackground = () =>
  screen.getByTestId('bg', { includeHiddenElements: true });

describe('Background', () => {
  it.each([
    ['primary', light.colors.primary],
    ['surfaceSunken', light.colors.surfaceSunken],
    ['onDangerSubtle', light.colors.onDangerSubtle],
  ] as const)('paints color %s', async (color, backgroundColor) => {
    await render(<Background testID="bg" color={color} />);
    expect(getBackground()).toHaveStyle({ backgroundColor });
  });

  it.each(Object.entries(light.gradients))(
    'paints gradient %s',
    async (gradient, backgroundImage) => {
      await render(
        <Background
          testID="bg"
          gradient={gradient as keyof typeof light.gradients}
        />
      );
      expect(getBackground()).toHaveStyle({ backgroundImage });
      expect(getBackground()).not.toHaveStyle({ position: 'absolute' });
    }
  );

  it('paints a custom color inline', async () => {
    await render(<Background testID="bg" color={custom} />);
    expect(getBackground()).toHaveStyle({ backgroundColor: custom });
  });

  it.each([
    ['a CSS string', `linear-gradient(to right, ${custom}, #0000ff)`],
    [
      'gradient objects',
      [
        {
          type: 'linear-gradient' as const,
          colorStops: [{ color: custom }, { color: '#0000ff' }],
        },
      ],
    ],
  ])('paints a custom gradient from %s inline', async (_, backgroundImage) => {
    await render(<Background testID="bg" gradient={backgroundImage} />);
    expect(getBackground()).toHaveStyle({ backgroundImage });
  });

  it('puts the user style after a custom value', async () => {
    await render(
      <Background
        testID="bg"
        color={custom}
        style={{ backgroundColor: other }}
      />
    );
    expect(getBackground()).toHaveStyle({ backgroundColor: other });
  });

  it('wraps its children', async () => {
    await render(
      <Background testID="bg" color="primary">
        <View testID="child" />
      </Background>
    );
    expect(screen.getByTestId('child')).toBeOnTheScreen();
  });

  it('fills its parent as a layer without touches', async () => {
    await render(<Background testID="bg" fill gradient="primary" />);
    expect(getBackground()).toHaveStyle({
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundImage: light.gradients.primary,
    });
    expect(getBackground()).toHaveProp('pointerEvents', 'none');
  });

  it('puts the user style last', async () => {
    await render(
      <Background
        testID="bg"
        fill
        color="primary"
        style={{ backgroundColor: custom, top: 4 }}
      />
    );
    expect(getBackground()).toHaveStyle({
      backgroundColor: custom,
      top: 4,
      position: 'absolute',
    });
  });

  describe('a11y', () => {
    it('is not accessible as a wrapper by default', async () => {
      await render(<Background testID="bg" color="primary" />);
      expect(screen.getByTestId('bg')).toHaveProp('accessible', false);
      expect(screen.getByTestId('bg')).toHaveProp(
        'importantForAccessibility',
        'no'
      );
    });

    it('lets a wrapper opt in with a11y', async () => {
      await render(
        <Background
          gradient="primary"
          a11y={{ label: 'Plan', role: 'summary', accessible: true }}
        />
      );
      expect(screen.getByRole('summary', { name: 'Plan' })).toHaveProp(
        'accessible',
        true
      );
    });

    it('hides a fill from screen readers, whatever the native props', async () => {
      await render(
        <Background
          testID="bg"
          fill
          color="primary"
          accessible
          importantForAccessibility="yes"
          pointerEvents="auto"
        />
      );
      expect(screen.queryByTestId('bg')).toBeNull();
      expect(getBackground()).toHaveProp('accessible', false);
      expect(getBackground()).toHaveProp('accessibilityElementsHidden', true);
      expect(getBackground()).toHaveProp(
        'importantForAccessibility',
        'no-hide-descendants'
      );
      expect(getBackground()).toHaveProp('pointerEvents', 'none');
    });
  });

  it('types color and gradient as exclusive, and fill without children', () => {
    // @ts-expect-error color and gradient are exclusive
    const both: BackgroundProps = { color: 'primary', gradient: 'primary' };
    // @ts-expect-error one of them is required
    const none: BackgroundProps = {};
    const children = <View />;
    // @ts-expect-error a fill has no children
    const fill: BackgroundProps = { fill: true, gradient: 'scrim', children };
    // @ts-expect-error a fill is always hidden
    const hidden: BackgroundProps = { fill: true, color: 'primary', a11y: {} };
    expect([both, none, fill, hidden]).toHaveLength(4);
  });

  it.each(demo.sections.map((section) => [section.title, section]))(
    'renders the %s demo section',
    async (_, section) => {
      await render(<>{section.content}</>);
      expect(screen.toJSON()).toBeTruthy();
    }
  );
});
