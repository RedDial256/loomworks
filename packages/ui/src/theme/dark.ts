import type { Theme } from './contract';
import { createElevation } from './elevation';
import { motion } from './motion';
import { palette } from './palette';
import { radii, spacing, touchTarget } from './spacing';
import { typography } from './typography';

const { slate, indigo, green, amber, red, sky, white, black } = palette;

export const dark: Theme = {
  colors: {
    background: slate[950],
    surface: slate[900],
    surfaceRaised: slate[800],
    surfaceSunken: black,
    text: slate[50],
    textMuted: slate[400],
    textDisabled: slate[600],
    border: slate[800],
    borderStrong: slate[500],
    focusRing: indigo[400],
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: black,

    primary: indigo[600],
    onPrimary: white,
    primarySubtle: indigo[950],
    onPrimarySubtle: indigo[200],
    primaryBorder: indigo[800],

    success: green[700],
    onSuccess: white,
    successSubtle: green[950],
    onSuccessSubtle: green[200],
    successBorder: green[800],

    warning: amber[400],
    onWarning: amber[950],
    warningSubtle: amber[950],
    onWarningSubtle: amber[200],
    warningBorder: amber[800],

    danger: red[600],
    onDanger: white,
    dangerSubtle: red[950],
    onDangerSubtle: red[200],
    dangerBorder: red[800],

    info: sky[400],
    onInfo: sky[950],
    infoSubtle: sky[950],
    onInfoSubtle: sky[200],
    infoBorder: sky[800],
  },
  spacing,
  radii,
  typography,
  motion,
  elevation: {
    shadow: createElevation(black, 0.5),
    tint: {
      none: 'transparent',
      sm: 'rgba(255, 255, 255, 0.08)',
      md: 'rgba(255, 255, 255, 0.11)',
      lg: 'rgba(255, 255, 255, 0.135)',
    },
    hairline: 'rgba(255, 255, 255, 0.1)',
  },
  touchTarget,
};
