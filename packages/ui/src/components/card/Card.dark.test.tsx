import { render, screen } from '@testing-library/react-native';

import { dark, radii } from '@/theme';

import { Card } from './Card';

// The Unistyles mock resolves styles against `light`; swap it for `dark` here.
jest.mock('../../theme/light', () => ({
  light: jest.requireActual('../../theme/dark').dark,
}));

const getCard = () => screen.getByTestId('card');

describe('Card in dark mode', () => {
  it.each(['sm', 'md', 'lg'] as const)(
    'adds the tint and hairline at elevation %s',
    async (elevation) => {
      await render(<Card testID="card" elevation={elevation} />);
      expect(getCard()).toHaveStyle({
        backgroundColor: dark.colors.surfaceRaised,
        borderRadius: radii.lg,
        ...dark.elevation.shadow[elevation],
        borderWidth: 1,
        borderColor: dark.elevation.hairline,
      });
      expect(getCard().children[0]).toHaveStyle({
        backgroundColor: dark.elevation.tint[elevation],
      });
    }
  );

  it('uses the halved shadow and visible tokens', async () => {
    await render(<Card testID="card" />);
    expect(getCard()).toHaveStyle({
      shadowOpacity: 0.1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    });
    expect(getCard().children[0]).toHaveStyle({
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    });
  });
});
