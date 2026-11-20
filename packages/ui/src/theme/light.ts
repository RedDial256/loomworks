import type { Theme, ThemeColors } from './contract';
import { createElevation } from './elevation';
import { linearGradient } from './gradients';
import { motion } from './motion';
import { palette } from './palette';
import { radii, spacing, touchTarget } from './spacing';
import { typography } from './typography';

const { zinc, indigo, green, amber, red, sky, white } = palette;

const colors: ThemeColors = {
  background: zinc[50],
  surface: white,
  surfaceRaised: white,
  surfaceSunken: zinc[100],
  text: zinc[900],
  textMuted: zinc[600],
  textDisabled: zinc[400],
  border: zinc[200],
  borderStrong: zinc[500],
  focusRing: indigo[500],
  overlay: 'rgba(9, 9, 11, 0.5)',
  shadow: zinc[950],

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
};

export const light: Theme = {
  colors,
  gradients: {
    primary: linearGradient('to bottom right', indigo[600], indigo[800]),
    success: linearGradient('to bottom right', green[700], green[900]),
    warning: linearGradient('to bottom right', amber[300], amber[500]),
    danger: linearGradient('to bottom right', red[600], red[800]),
    info: linearGradient('to bottom right', sky[300], sky[500]),
    surface: linearGradient('to bottom', colors.surface, colors.surfaceSunken),
    scrim: linearGradient('to bottom', 'transparent', colors.overlay),
  },
  spacing,
  radii,
  typography,
  motion,
  elevation: {
    shadow: createElevation(zinc[950]),
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
