/** Uppercases the first character; the type keeps literal strings precise (`'primary'` → `'Primary'`). */
export const capitalize = <S extends string>(value: S): Capitalize<S> =>
  (value.charAt(0).toUpperCase() + value.slice(1)) as Capitalize<S>;
