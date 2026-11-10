/** Width the demo is laid out at before scaling: a small phone. */
export const THUMBNAIL_LAYOUT_WIDTH = 360;

/** Visible thumbnail height, in pt. */
export const THUMBNAIL_HEIGHT = 112;

/**
 * Transform that scales content `THUMBNAIL_LAYOUT_WIDTH` by `contentHeight`
 * until it fits a `width` by `THUMBNAIL_HEIGHT` frame, centered. React Native
 * scales around the view's center, so the translation moves it back; this
 * avoids `transformOrigin`.
 */
export const fitThumbnail = (width: number, contentHeight: number) => {
  const height = Math.max(contentHeight, 1);
  const scale = Math.min(
    width / THUMBNAIL_LAYOUT_WIDTH,
    THUMBNAIL_HEIGHT / height,
    1
  );
  // Where the scaled content's top left corner should land.
  const left = (width - THUMBNAIL_LAYOUT_WIDTH * scale) / 2;
  const top = (THUMBNAIL_HEIGHT - height * scale) / 2;
  return [
    { translateX: left - ((1 - scale) * THUMBNAIL_LAYOUT_WIDTH) / 2 },
    { translateY: top - ((1 - scale) * height) / 2 },
    { scale },
  ];
};
