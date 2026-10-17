import { render, screen } from '@testing-library/react-native';

import { light } from '@/theme';

import { Divider } from './Divider';

const custom = '#ff0000';

// Hidden from screen readers by default, so queries must include hidden elements.
const getDivider = () =>
  screen.getByTestId('divider', { includeHiddenElements: true });

describe('Divider', () => {
  it('is a horizontal hairline in the border role by default', async () => {
    await render(<Divider testID="divider" />);
    expect(getDivider()).toHaveStyle({
      height: 1,
      alignSelf: 'stretch',
      backgroundColor: light.colors.border,
    });
    expect(getDivider()).not.toHaveStyle({ width: 1 });
  });

  it('stretches vertically in a row', async () => {
    await render(<Divider testID="divider" orientation="vertical" />);
    expect(getDivider()).toHaveStyle({ width: 1, alignSelf: 'stretch' });
    expect(getDivider()).not.toHaveStyle({ height: 1 });
  });

  it.each([
    ['border', light.colors.border],
    ['borderStrong', light.colors.borderStrong],
  ] as const)('applies tone %s', async (tone, backgroundColor) => {
    await render(<Divider testID="divider" tone={tone} />);
    expect(getDivider()).toHaveStyle({ backgroundColor });
  });

  it('puts the user style last', async () => {
    await render(
      <Divider
        testID="divider"
        tone="borderStrong"
        style={{ height: 2, backgroundColor: custom, marginVertical: 8 }}
      />
    );
    expect(getDivider()).toHaveStyle({
      height: 2,
      backgroundColor: custom,
      marginVertical: 8,
    });
  });

  it('is hidden from screen readers unless told otherwise', async () => {
    await render(<Divider testID="divider" />);
    expect(screen.queryByTestId('divider')).toBeNull();
    expect(getDivider()).toHaveProp('accessible', false);
    expect(getDivider()).toHaveProp('accessibilityElementsHidden', true);
    expect(getDivider()).toHaveProp(
      'importantForAccessibility',
      'no-hide-descendants'
    );

    await render(
      <Divider a11y={{ hidden: false, label: 'Section end', role: 'none' }} />
    );
    expect(screen.getByLabelText('Section end')).toHaveProp(
      'importantForAccessibility',
      'yes'
    );
  });
});
