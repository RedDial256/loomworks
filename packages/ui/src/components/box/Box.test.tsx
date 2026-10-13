import { render, screen } from '@testing-library/react-native';

import { light } from '@/theme';

import { Box } from './Box';

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
});
