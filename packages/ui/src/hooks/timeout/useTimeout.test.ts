import { act, renderHook } from '@testing-library/react-native';

import { useTimeout } from './useTimeout';
import type { UseTimeoutResult } from './useTimeout.types';

describe('useTimeout', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does not start until `set` is called', async () => {
    const callback = jest.fn();
    const { result } = await renderHook(() => useTimeout(callback, 100));
    await act(async () => jest.advanceTimersByTime(500));
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.ref.current).toBeUndefined();
  });

  it('calls the callback once after the delay', async () => {
    const callback = jest.fn();
    const { result } = await renderHook(() => useTimeout(callback, 100));
    await act(async () => result.current.set());
    expect(result.current.ref.current).toBeDefined();
    await act(async () => jest.advanceTimersByTime(99));
    expect(callback).not.toHaveBeenCalled();
    await act(async () => jest.advanceTimersByTime(1));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.ref.current).toBeUndefined();
    await act(async () => jest.advanceTimersByTime(500));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('restarts the timer when `set` is called again', async () => {
    const callback = jest.fn();
    const { result } = await renderHook(() => useTimeout(callback, 100));
    await act(async () => result.current.set());
    await act(async () => jest.advanceTimersByTime(60));
    await act(async () => result.current.set());
    await act(async () => jest.advanceTimersByTime(60));
    expect(callback).not.toHaveBeenCalled();
    await act(async () => jest.advanceTimersByTime(40));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels with `clear`', async () => {
    const callback = jest.fn();
    const { result } = await renderHook(() => useTimeout(callback, 100));
    await act(async () => result.current.set());
    await act(async () => result.current.clear());
    expect(result.current.ref.current).toBeUndefined();
    await act(async () => jest.advanceTimersByTime(500));
    expect(callback).not.toHaveBeenCalled();
  });

  it('clears on unmount', async () => {
    const callback = jest.fn();
    const { result, unmount } = await renderHook(() =>
      useTimeout(callback, 100)
    );
    await act(async () => result.current.set());
    expect(result.current.ref.current).toBeDefined();
    await unmount();
    await act(async () => jest.advanceTimersByTime(500));
    expect(callback).not.toHaveBeenCalled();
  });

  it('adopts an initial timer and clears it', async () => {
    const adopted = jest.fn();
    const callback = jest.fn();
    const initial = setTimeout(adopted, 100);
    const { result } = await renderHook(() =>
      useTimeout(callback, 100, initial)
    );
    expect(result.current.ref.current).toBe(initial);
    await act(async () => result.current.clear());
    await act(async () => jest.advanceTimersByTime(500));
    expect(adopted).not.toHaveBeenCalled();
  });

  it('clears an adopted timer on unmount', async () => {
    const adopted = jest.fn();
    const initial = setTimeout(adopted, 100);
    const { unmount } = await renderHook(() =>
      useTimeout(jest.fn(), 100, initial)
    );
    await unmount();
    await act(async () => jest.advanceTimersByTime(500));
    expect(adopted).not.toHaveBeenCalled();
  });

  it('replaces an adopted timer on `set`', async () => {
    const adopted = jest.fn();
    const callback = jest.fn();
    const initial = setTimeout(adopted, 50);
    const { result } = await renderHook(() =>
      useTimeout(callback, 100, initial)
    );
    await act(async () => result.current.set());
    await act(async () => jest.advanceTimersByTime(100));
    expect(adopted).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls the latest callback without restarting the timer', async () => {
    const first = jest.fn();
    const second = jest.fn();
    const { result, rerender } = await renderHook<
      UseTimeoutResult,
      { callback: () => void }
    >(({ callback }) => useTimeout(callback, 100), {
      initialProps: { callback: first },
    });
    await act(async () => result.current.set());
    await act(async () => jest.advanceTimersByTime(50));
    await rerender({ callback: second });
    await act(async () => jest.advanceTimersByTime(50));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('uses the latest delay on the next `set`', async () => {
    const callback = jest.fn();
    const { result, rerender } = await renderHook<
      UseTimeoutResult,
      { delay: number }
    >(({ delay }) => useTimeout(callback, delay), {
      initialProps: { delay: 100 },
    });
    await rerender({ delay: 10 });
    await act(async () => result.current.set());
    await act(async () => jest.advanceTimersByTime(10));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('keeps `set`, `clear` and `ref` across renders', async () => {
    const { result, rerender } = await renderHook<
      UseTimeoutResult,
      { delay: number }
    >(({ delay }) => useTimeout(jest.fn(), delay), {
      initialProps: { delay: 100 },
    });
    const { set, clear, ref } = result.current;
    await rerender({ delay: 200 });
    expect(result.current.set).toBe(set);
    expect(result.current.clear).toBe(clear);
    expect(result.current.ref).toBe(ref);
  });
});
