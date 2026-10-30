// Calendar from Lucide (https://lucide.dev), MIT License, Copyright (c) Lucide Contributors.
import type { FC } from 'react';

import Svg, { Line, Rect } from 'react-native-svg';

import type { IconProps } from '../DateTimeInput.types';

export const CalendarIcon: FC<IconProps> = ({ color, size = 20 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round">
    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <Line x1={16} y1={2} x2={16} y2={6} />
    <Line x1={8} y1={2} x2={8} y2={6} />
    <Line x1={3} y1={10} x2={21} y2={10} />
  </Svg>
);
