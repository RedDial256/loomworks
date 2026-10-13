import type { Theme } from './contract';
import { createElevation } from './elevation';
import { motion } from './motion';
import { palette } from './palette';
import { radii, spacing, touchTarget } from './spacing';
import { typography } from './typography';

const { slate, indigo, green, amber, red, sky, white } = palette;

export const light: Theme = {
  colors: {
    background: slate[50],
    surface: white,
    surfaceRaised: white,
    surfaceSunken: slate[100],
    text: slate[900],
    textMuted: slate[600],
    textDisabled: slate[400],
    border: slate[200],
    borderStrong: slate[500],
    focusRing: indigo[500],
    overlay: 'rgba(2, 6, 23, 0.5)',
    shadow: slate[950],

    primary: indigo[600],
    onPrimary: white,
    primarySubtle: indigo[50],
    onPrimarySubtle: indigo[800],
    primaryBorder: indigo[300],

    success: green[700],
    onSuccess: white,
    successSubtle: green[50],
    onSuccessSubtle: green[800],
    successBorder: green[300],

    warning: amber[500],
    onWarning: amber[950],
    warningSubtle: amber[50],
    onWarningSubtle: amber[800],
    warningBorder: amber[300],

    danger: red[600],
    onDanger: white,
    dangerSubtle: red[50],
    onDangerSubtle: red[800],
    dangerBorder: red[300],

    info: sky[500],
    onInfo: sky[950],
    infoSubtle: sky[50],
    onInfoSubtle: sky[800],
    infoBorder: sky[300],
  },
  spacing,
  radii,
  typography,
  motion,
  elevation: {
    shadow: createElevation(slate[950]),
    tint: {
      none: 'transparent',
      sm: 'transparent',
      md: 'transparent',
      lg: 'transparent',
    },
    hairline: 'transparent',
  },
  touchTarget,
};
