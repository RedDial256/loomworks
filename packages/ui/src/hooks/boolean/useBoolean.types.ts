export interface UseBooleanResult {
  value: boolean;
  /** Every function below keeps its identity across renders. */
  set: (value: boolean) => void;
  toggle: () => void;
  /** `setter(v)` is `() => set(v)`, for props like `onPress`; the same function for each `v`. */
  setter: (value: boolean) => () => void;
  /** Back to the `initial` of the first render. */
  reset: () => void;
}
