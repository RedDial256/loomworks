import type { FC } from 'react';
import { View } from 'react-native';

import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { sharedTagFor } from '../sandbox.transition';

import type { DemoThumbnailProps } from './DemoThumbnail.types';

/** Width the demo is laid out at before scaling: a small phone. */
export const THUMBNAIL_LAYOUT_WIDTH = 360;

/** Visible thumbnail height, in pt. */
export const THUMBNAIL_HEIGHT = 112;

/**
 * Live render of the demo's first section, scaled down to `width`. It is
 * decoration: no touches and hidden from screen readers (the card is the link).
 */
export const DemoThumbnail: FC<DemoThumbnailProps> = ({ demo, width }) => {
  const scale = width / THUMBNAIL_LAYOUT_WIDTH;
  const frame = { width, height: THUMBNAIL_HEIGHT };
  const canvas = {
    width: THUMBNAIL_LAYOUT_WIDTH,
    height: THUMBNAIL_HEIGHT / scale,
    transform: [{ scale }],
  };
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      sharedTransitionTag={sharedTagFor(demo.id)}
      style={[styles.frame, frame]}>
      <View style={[styles.canvas, canvas]}>{demo.sections[0]?.content}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  frame: {
    overflow: 'hidden',
    pointerEvents: 'none',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
  },
  canvas: {
    justifyContent: 'center',
    padding: theme.spacing.xl,
    transformOrigin: 'left top',
  },
}));
