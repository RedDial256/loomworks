import type { FC } from 'react';
import { Link } from 'expo-router';

import { StyleSheet } from 'react-native-unistyles';

import { Card } from '@/components/card/Card';
import { Pressable } from '@/components/pressable/Pressable';
import { Text } from '@/components/text/Text';

import { CARD_TRANSITION } from '../sandbox.transition';

import type { DemoCardProps } from './DemoCard.types';
import { DemoThumbnail } from './DemoThumbnail';

const LINK_A11Y = { role: 'link' } as const;

/** Grid card: a live thumbnail and the title, linking to the demo screen. */
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
      <Pressable a11y={LINK_A11Y}>
        <Card style={[styles.card, size]}>
          {source}
          <Text variant="label" style={styles.title}>
            {demo.title}
          </Text>
        </Card>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: { minHeight: theme.touchTarget.min },
  title: { padding: theme.spacing.sm },
}));
