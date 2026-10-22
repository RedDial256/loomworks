import { act, renderHook } from '@testing-library/react-native';

import { useTimeout } from './useTimeout';
import type { Timer } from './useTimeout.types';

describe('useTimeout', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('does not start until `set` is called', async () => {
    const { result } = await renderHook(() => useTimeout());
    await act(async () => jest.advanceTimersByTime(500));
    expect(result.current[2].current).toBeNull();
  });

  it('calls the callback once after the delay', async () => {
    const callback = jest.fn();
    const { result } = await renderHook(() => useTimeout());
    await act(async () => result.current[0](callback, 100));
    expect(result.current[2].current).not.toBeNull();
    await act(async () => jest.advanceTimersByTime(99));
    expect(callback).not.toHaveBeenCalled();
    await act(async () => jest.advanceTimersByTime(1));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current[2].current).toBeNull();
    await act(async () => jest.advanceTimersByTime(500));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('runs on the next tick when the delay is 0 or omitted', async () => {
    const callback = jest.fn();
    const { result } = await renderHook(() => useTimeout());
    await act(async () => result.current[0](callback, 0));
    await act(async () => jest.advanceTimersByTime(0));
    expect(callback).toHaveBeenCalledTimes(1);
    await act(async () => result.current[0](callback));
    await act(async () => jest.advanceTimersByTime(0));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('restarts the timer when `set` is called again', async () => {
    const first = jest.fn();
    const second = jest.fn();
    const { result } = await renderHook(() => useTimeout());
    await act(async () => result.current[0](first, 100));
    await act(async () => jest.advanceTimersByTime(80));
    await act(async () => result.current[0](second, 100));
    await act(async () => jest.advanceTimersByTime(99));
    expect(second).not.toHaveBeenCalled();
    await act(async () => jest.advanceTimersByTime(1));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('cancels with `clear`', async () => {
    const callback = jest.fn();
    const { result } = await renderHook(() => useTimeout());
    await act(async () => result.current[0](callback, 100));
    await act(async () => result.current[1]());
    expect(result.current[2].current).toBeNull();
    await act(async () => jest.advanceTimersByTime(500));
    expect(callback).not.toHaveBeenCalled();
  });

  it('clears on unmount', async () => {
    const callback = jest.fn();
    const { result, unmount } = await renderHook(() => useTimeout());
    await act(async () => result.current[0](callback, 100));
    expect(result.current[2].current).not.toBeNull();
    await unmount();
    await act(async () => jest.advanceTimersByTime(500));
    expect(callback).not.toHaveBeenCalled();
  });

  it('adopts an initial timer and clears it', async () => {
    const adopted = jest.fn();
    const timer = setTimeout(adopted, 100);
    const { result } = await renderHook(() => useTimeout(timer));
    expect(result.current[2].current).toBe(timer);
    await act(async () => result.current[1]());
    await act(async () => jest.advanceTimersByTime(500));
    expect(adopted).not.toHaveBeenCalled();
  });

  it('clears an adopted initial timer on unmount', async () => {
    const adopted = jest.fn();
    const { unmount } = await renderHook(() =>
      useTimeout(setTimeout(adopted, 100))
    );
    await unmount();
    await act(async () => jest.advanceTimersByTime(500));
    expect(adopted).not.toHaveBeenCalled();
  });

  it('adopts a timer passed to `set`, replacing the pending one', async () => {
    const pending = jest.fn();
    const adopted = jest.fn();
    const { result, unmount } = await renderHook(() => useTimeout());
    await act(async () => result.current[0](pending, 100));
    const timer: Timer = setTimeout(adopted, 100);
    await act(async () => result.current[0](timer));
    expect(result.current[2].current).toBe(timer);
    await act(async () => jest.advanceTimersByTime(100));
    expect(pending).not.toHaveBeenCalled();
    expect(adopted).toHaveBeenCalledTimes(1);

    const later = jest.fn();
    await act(async () => result.current[0](setTimeout(later, 100)));
    await unmount();
    await act(async () => jest.advanceTimersByTime(500));
    expect(later).not.toHaveBeenCalled();
  });

  it('`set(null)` clears the pending timer', async () => {
    const callback = jest.fn();
    const { result } = await renderHook(() => useTimeout());
    await act(async () => result.current[0](callback, 100));
    await act(async () => result.current[0](null));
    expect(result.current[2].current).toBeNull();
    await act(async () => jest.advanceTimersByTime(500));
    expect(callback).not.toHaveBeenCalled();
  });

  it('keeps `set`, `clear` and `ref` across renders', async () => {
    const { result, rerender } = await renderHook(() => useTimeout());
    const [set, clear, ref] = result.current;
    await rerender({});
    expect(result.current[0]).toBe(set);
    expect(result.current[1]).toBe(clear);
    expect(result.current[2]).toBe(ref);
  });
});
