import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { light, radii } from '@/theme';

import { Card } from './Card';

const custom = '#ff0000';

const getCard = () => screen.getByTestId('card');
// The tint overlay is the card's first child when the elevation is not `none`.
const getTint = () => getCard().children[0];

describe('Card', () => {
  it('is a raised surface with the lg radius and sm elevation by default', async () => {
    await render(<Card testID="card" />);
    expect(getCard()).toHaveStyle({
      backgroundColor: light.colors.surfaceRaised,
      borderRadius: radii.lg,
      ...light.elevation.shadow.sm,
      borderWidth: 1,
      borderColor: light.elevation.hairline,
    });
  });

  it.each(['sm', 'md', 'lg'] as const)(
    'applies elevation %s with its tint overlay',
    async (elevation) => {
      await render(<Card testID="card" elevation={elevation} />);
      expect(getCard()).toHaveStyle({
        ...light.elevation.shadow[elevation],
        borderWidth: 1,
      });
      expect(getTint()).toHaveStyle({
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderRadius: radii.lg - 1,
        backgroundColor: light.elevation.tint[elevation],
      });
      expect(getTint()).toHaveProp('pointerEvents', 'none');
    }
  );

  it('has no shadow, hairline or overlay at elevation none', async () => {
    await render(
      <Card testID="card" elevation="none">
        <Text>Content</Text>
      </Card>
    );
    expect(getCard()).toHaveStyle({
      ...light.elevation.shadow.none,
      borderWidth: 0,
    });
    expect(getCard().children).toHaveLength(1);
    expect(getCard()).toContainElement(screen.getByText('Content'));
  });

  it('renders children above the overlay', async () => {
    await render(
      <Card testID="card">
        <Text>Content</Text>
      </Card>
    );
    expect(getCard().children).toHaveLength(2);
    expect(getCard().children[1]).toBe(screen.getByText('Content'));
  });

  it('passes Box props through', async () => {
    await render(
      <Card
        testID="card"
        padding="M"
        a11y={{ label: 'Order', accessible: true }}
      />
    );
    expect(getCard()).toHaveStyle({ padding: 16 });
    expect(getCard()).toHaveProp('accessible', true);
    expect(screen.getByLabelText('Order')).toBe(getCard());
  });

  it('puts the user style last', async () => {
    await render(
      <Card
        testID="card"
        padding="M"
        elevation="lg"
        style={{
          padding: 3,
          borderRadius: 4,
          backgroundColor: custom,
          shadowOpacity: 0.5,
          borderWidth: 0,
        }}
      />
    );
    expect(getCard()).toHaveStyle({
      padding: 3,
      borderRadius: 4,
      backgroundColor: custom,
      shadowOpacity: 0.5,
      borderWidth: 0,
    });
  });
});
