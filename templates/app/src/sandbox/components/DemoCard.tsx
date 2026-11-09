import type { FC } from 'react';
import { Link } from 'expo-router';

import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Pressable } from '@/components/pressable/Pressable';
import { Text } from '@/components/text/Text';

import { CARD_TRANSITION } from '../sandbox.transition';

import type { DemoCardProps } from './DemoCard.types';
import { DemoThumbnail } from './DemoThumbnail';

const LINK_A11Y = { role: 'link' } as const;

const pressedStyle = ({ pressed }: { pressed: boolean }) => [
  styles.card,
  pressed && styles.pressed,
];

/**
 * Grid card: a live thumbnail and the title, linking to the demo screen. It
 * uses the screen background, so the thumbnail looks as it does in the demo.
 */
export const DemoCard: FC<DemoCardProps> = ({ demo, width }) => {
  const href = { pathname: '/sandbox/[id]', params: { id: demo.id } } as const;
  const thumbnail = <DemoThumbnail demo={demo} width={width} />;
  // Outside iOS 18+ `Link.AppleZoom` renders its child as is.
  const source =
    CARD_TRANSITION === 'zoom' ? (
      <Link.AppleZoom>{thumbnail}</Link.AppleZoom>
    ) : (
      thumbnail
    );
  const size = { width };
  return (
    <Link asChild href={href}>
      <Pressable a11y={LINK_A11Y} style={pressedStyle}>
        <Box style={size}>
          {source}
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
