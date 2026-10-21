export interface UseBooleanResult {
  value: boolean;
  /** Every function below keeps its identity across renders. */
  set: (value: boolean) => void;
  toggle: () => void;
  /** Returns a handler that sets `value`; cached, so `setTo(true)` is always the same function. */
  setTo: (value: boolean) => () => void;
  /** Back to the `initial` of the first render. */
  reset: () => void;
}
