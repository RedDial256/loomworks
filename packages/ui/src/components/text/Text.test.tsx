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

  describe('a11y', () => {
    it('is accessible by default', async () => {
      await render(<Text>Hello</Text>);
      expect(screen.getByText('Hello')).toHaveProp('accessible', true);
    });

    it('lets a11y override the heading role', async () => {
      await render(
        <Text variant="h1" a11y={{ role: 'text', label: 'Greeting' }}>
          Hello
        </Text>
      );
      expect(screen.queryByRole('header')).toBeNull();
      expect(screen.getByRole('text', { name: 'Greeting' })).toBeOnTheScreen();
    });

    it('keeps the heading role when a11y has no role', async () => {
      await render(
        <Text variant="h2" a11y={{ busy: true }}>
          Title
        </Text>
      );
      expect(screen.getByRole('header', { name: 'Title' })).toBeBusy();
    });

    it('lets native props override a11y', async () => {
      await render(
        <Text a11y={{ role: 'button', label: 'A11y' }} accessibilityRole="link">
          Hello
        </Text>
      );
      expect(screen.getByRole('link')).toHaveProp('accessibilityLabel', 'A11y');
    });

    it('lets aria-* passed by the user win', async () => {
      await render(
        <Text
          a11y={{ label: 'A11y', selected: false }}
          aria-label="Aria"
          aria-selected>
          Hello
        </Text>
      );
      const text = screen.getByText('Hello');
      expect(text).toHaveAccessibleName('Aria');
      expect(text).toBeSelected();
    });
  });
});
