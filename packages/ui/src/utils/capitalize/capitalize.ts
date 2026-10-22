/** Uppercases the first character; the type keeps literal strings precise (`'primary'` → `'Primary'`). */
export function capitalize<S extends string>(value: S): Capitalize<S> {
  return (value.charAt(0).toUpperCase() + value.slice(1)) as Capitalize<S>;
}
