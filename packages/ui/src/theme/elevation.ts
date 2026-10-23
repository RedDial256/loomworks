export type ElevationLevel = 'none' | 'sm' | 'md' | 'lg';

/** Spreadable shadow style: iOS `shadow*` paired with Android `elevation`. */
export interface ShadowStyle {
  elevation: number;
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowRadius: number;
  shadowOpacity: number;
}

const levels = {
  none: { elevation: 0, height: 0, shadowRadius: 0, shadowOpacity: 0 },
  sm: { elevation: 3, height: 2, shadowRadius: 2.5, shadowOpacity: 0.2 },
  md: { elevation: 6, height: 3, shadowRadius: 5, shadowOpacity: 0.2 },
  lg: { elevation: 12, height: 7, shadowRadius: 10, shadowOpacity: 0.22 },
} as const;

/** Builds the shadow per level; dark themes pass `opacityScale` 0.5. */
export const createElevation = (
  shadowColor: string,
  opacityScale = 1
): Record<ElevationLevel, ShadowStyle> => {
  const style = (level: ElevationLevel): ShadowStyle => {
    const { elevation, height, shadowRadius, shadowOpacity } = levels[level];
    return {
      elevation,
      shadowColor,
      shadowOffset: { width: 0, height },
      shadowRadius,
      shadowOpacity: shadowOpacity * opacityScale,
    };
  };
  return {
    none: style('none'),
    sm: style('sm'),
    md: style('md'),
    lg: style('lg'),
  };
};
