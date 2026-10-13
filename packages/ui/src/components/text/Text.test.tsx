import { render, screen } from '@testing-library/react-native';

import { light, typography } from '@/theme';

import { Text } from './Text';

const custom = '#ff0000';

describe('Text', () => {
  it('defaults to the body preset and the text color', async () => {
    await render(<Text>Hello</Text>);
    expect(screen.getByText('Hello')).toHaveStyle({
      ...typography.body,
      color: light.colors.text,
    });
    expect(screen.queryByRole('header')).toBeNull();
  });

  it.each(Object.keys(typography) as (keyof typeof typography)[])(
    'applies the %s preset',
    async (variant) => {
      await render(<Text variant={variant}>Hello</Text>);
      expect(screen.getByText('Hello')).toHaveStyle(typography[variant]);
    }
  );

  it.each([
    ['muted', light.colors.textMuted],
    ['disabled', light.colors.textDisabled],
  ] as const)('applies the %s tone', async (tone, color) => {
    await render(<Text tone={tone}>Hello</Text>);
    expect(screen.getByText('Hello')).toHaveStyle({ color });
  });

  it('marks headings and caps their font scaling', async () => {
    await render(<Text variant="h2">Title</Text>);
    const heading = screen.getByRole('header', { name: 'Title' });
    expect(heading).toHaveProp('maxFontSizeMultiplier', 1.5);
  });

  it('lets native props override the defaults', async () => {
    await render(
      <Text variant="h1" accessibilityRole="text" maxFontSizeMultiplier={2}>
        Title
      </Text>
    );
    expect(screen.queryByRole('header')).toBeNull();
    expect(screen.getByText('Title')).toHaveProp('maxFontSizeMultiplier', 2);
  });

  it('puts the user style last', async () => {
    await render(
      <Text variant="h1" tone="muted" style={{ fontSize: 10, color: custom }}>
        Hello
      </Text>
    );
    expect(screen.getByText('Hello')).toHaveStyle({
      fontSize: 10,
      color: custom,
      lineHeight: 40,
    });
  });
});
