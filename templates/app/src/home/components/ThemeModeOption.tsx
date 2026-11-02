import { type FC, useCallback } from 'react';

import { Button } from '@/components/button/Button';
import { capitalize } from '@/utils/capitalize/capitalize';

import type { ThemeModeOptionProps } from './ThemeModeOption.types';

export const ThemeModeOption: FC<ThemeModeOptionProps> = ({
  mode,
  selected,
  onSelect,
}) => {
  const select = useCallback(() => onSelect(mode), [onSelect, mode]);
  const variant = selected ? 'solid' : 'outline';
  return (
    <Button
      size="S"
      variant={variant}
      a11y={{ role: 'radio', checked: selected }}
      onPress={select}>
      {capitalize(mode)}
    </Button>
  );
};
