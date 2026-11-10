import type { FC } from 'react';
import { Link } from 'expo-router';

import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Pressable } from '@/components/pressable/Pressable';
import { Text } from '@/components/text/Text';

import type { DemoCardProps } from './DemoCard.types';
import { DemoThumbnail } from './DemoThumbnail';

// Only the pressed feedback goes through the Pressable: on web Unistyles does
// not map a style function on it (ADR 0005), so the card look stays on the Box.
const pressedStyle = ({ pressed }: { pressed: boolean }) =>
  pressed && styles.pressed;

/**
 * Grid card: a live thumbnail and the title, linking to the demo screen. It
 * uses the screen background, so the thumbnail looks as it does in the demo.
 */
export const DemoCard: FC<DemoCardProps> = ({ demo, width }) => {
  const href = { pathname: '/sandbox/[id]', params: { id: demo.id } } as const;
  const size = { width };
  // VoiceOver otherwise reads the text inside the hidden thumbnail too.
  const a11y = { role: 'link', label: demo.title } as const;
  return (
    <Link asChild href={href}>
      <Pressable a11y={a11y} style={pressedStyle}>
        <Box style={[styles.card, size]}>
          {/* Outside iOS 18+ it renders its child as is (ADR 0006). */}
          <Link.AppleZoom>
            <DemoThumbnail demo={demo} width={width} />
          </Link.AppleZoom>
          <Text variant="label" style={styles.title}>
            {demo.title}
          </Text>
        </Box>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    overflow: 'hidden',
    borderRadius: theme.radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  pressed: { opacity: 0.7 },
  title: {
    padding: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
}));
