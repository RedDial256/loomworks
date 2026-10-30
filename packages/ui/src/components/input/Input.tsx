import type { FC } from 'react';

import { TextField } from '../text-field/TextField';

import type { InputProps } from './Input.types';

/** Field routed by `type`; every type is a `TextField` for now. */
export const Input: FC<InputProps> = (props) => <TextField {...props} />;
