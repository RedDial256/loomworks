import { type FC, useCallback, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import type { DemoThumbnailProps } from './DemoThumbnail.types';
import {
  fitThumbnail,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_LAYOUT_WIDTH,
} from './DemoThumbnail.utils';

/**
 * Live render of the demo's first section, laid out at a phone width and
 * scaled down until it fits the frame, centered. It is decoration: no touches
 * and hidden from screen readers (the card is the link).
 */
export const DemoThumbnail: FC<DemoThumbnailProps> = ({ demo, width }) => {
  const [contentHeight, setContentHeight] = useState(0);

  const measure = useCallback(
    (event: LayoutChangeEvent) =>
      setContentHeight(event.nativeEvent.layout.height),
    []
  );

  const frame = { width, height: THUMBNAIL_HEIGHT };
  // Hidden until measured, so the first frame does not flash unscaled.
  const canvas = {
    opacity: contentHeight > 0 ? 1 : 0,
    transform: fitThumbnail(width, contentHeight),
  };
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, frame]}>
      <View onLayout={measure} style={[styles.canvas, canvas]}>
        {demo.sections[0]?.content}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  frame: { overflow: 'hidden', pointerEvents: 'none' },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: THUMBNAIL_LAYOUT_WIDTH,
    padding: theme.spacing.md,
  },
}));
