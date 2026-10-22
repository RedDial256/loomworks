import { act, renderHook } from '@testing-library/react-native';

import { useBoolean } from './useBoolean';

describe('useBoolean', () => {
  it.each([true, false])('starts at the initial value %s', async (initial) => {
    const { result } = await renderHook(() => useBoolean(initial));
    expect(result.current.value).toBe(initial);
  });

  it('sets the value', async () => {
    const { result } = await renderHook(() => useBoolean(false));
    await act(async () => result.current.set(true));
    expect(result.current.value).toBe(true);
    await act(async () => result.current.set(false));
    expect(result.current.value).toBe(false);
  });

  it('toggles', async () => {
    const { result } = await renderHook(() => useBoolean(false));
    await act(async () => result.current.toggle());
    expect(result.current.value).toBe(true);
    await act(async () => result.current.toggle());
    expect(result.current.value).toBe(false);
  });

  it('setter returns a handler that sets the value', async () => {
    const { result } = await renderHook(() => useBoolean(false));
    await act(async () => result.current.setter(true)());
    expect(result.current.value).toBe(true);
    await act(async () => result.current.setter(false)());
    expect(result.current.value).toBe(false);
  });

  it('caches the setter handler per value', async () => {
    const { result } = await renderHook(() => useBoolean(false));
    expect(result.current.setter(true)).toBe(result.current.setter(true));
    expect(result.current.setter(false)).toBe(result.current.setter(false));
    expect(result.current.setter(true)).not.toBe(result.current.setter(false));
  });

  it('resets to the initial value', async () => {
    const { result } = await renderHook(() => useBoolean(true));
    await act(async () => result.current.set(false));
    await act(async () => result.current.reset());
    expect(result.current.value).toBe(true);
  });

  it('resets to the first initial after initial changes', async () => {
    const { result, rerender } = await renderHook(
      (initial: boolean) => useBoolean(initial),
      { initialProps: false }
    );
    await rerender(true);
    expect(result.current.value).toBe(false);
    await act(async () => result.current.set(true));
    await act(async () => result.current.reset());
    expect(result.current.value).toBe(false);
  });

  it('keeps every function across renders', async () => {
    const { result } = await renderHook(() => useBoolean(false));
    const { set, toggle, reset } = result.current;
    const setTrue = result.current.setter(true);
    const setFalse = result.current.setter(false);
    await act(async () => result.current.toggle());
    expect(result.current.value).toBe(true);
    expect(result.current.set).toBe(set);
    expect(result.current.toggle).toBe(toggle);
    expect(result.current.reset).toBe(reset);
    expect(result.current.setter(true)).toBe(setTrue);
    expect(result.current.setter(false)).toBe(setFalse);
  });
});
