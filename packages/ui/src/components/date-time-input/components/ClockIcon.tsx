// Clock from Lucide (https://lucide.dev), MIT License, Copyright (c) Lucide Contributors.
import type { FC } from 'react';

import Svg, { Circle, Polyline } from 'react-native-svg';

import type { IconProps } from '../DateTimeInput.types';

export const ClockIcon: FC<IconProps> = ({ color, size = 20 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Circle cx={12} cy={12} r={10} />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);
