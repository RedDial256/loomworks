/** One variant option per key of a theme record, styled from its value. */
export const variantsOf = <K extends string, S>(
  record: Record<K, string>,
  style: (value: string) => S
): Record<K, S> =>
  Object.fromEntries(
    Object.entries<string>(record).map(([key, value]) => [key, style(value)])
  ) as Record<K, S>;
