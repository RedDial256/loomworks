import { act, renderHook } from '@testing-library/react-native';

import { useDebounce } from './useDebounce';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const renderDebounce = (value: string, delay?: number) =>
  renderHook(
    (props: { value: string; delay?: number }) =>
      useDebounce(props.value, props.delay),
    { initialProps: { value, delay } }
  );

describe('useDebounce', () => {
  it('starts with the initial value', async () => {
    const { result } = await renderDebounce('a');
    expect(result.current).toBe('a');
  });

  it('follows the value after the delay', async () => {
    const { result, rerender } = await renderDebounce('a', 500);
    await rerender({ value: 'b', delay: 500 });
    await act(async () => jest.advanceTimersByTime(499));
    expect(result.current).toBe('a');
    await act(async () => jest.advanceTimersByTime(1));
    expect(result.current).toBe('b');
  });

  it('waits 300 ms by default', async () => {
    const { result, rerender } = await renderDebounce('a');
    await rerender({ value: 'b' });
    await act(async () => jest.advanceTimersByTime(299));
    expect(result.current).toBe('a');
    await act(async () => jest.advanceTimersByTime(1));
    expect(result.current).toBe('b');
  });

  it('restarts the delay on every change and keeps only the last value', async () => {
    const { result, rerender } = await renderDebounce('a', 300);
    await rerender({ value: 'b', delay: 300 });
    await act(async () => jest.advanceTimersByTime(200));
    await rerender({ value: 'c', delay: 300 });
    await act(async () => jest.advanceTimersByTime(200));
    expect(result.current).toBe('a');
    await act(async () => jest.advanceTimersByTime(100));
    expect(result.current).toBe('c');
  });

  it('cancels the pending update on unmount', async () => {
    const { rerender, unmount } = await renderDebounce('a', 300);
    const set = jest.spyOn(globalThis, 'setTimeout');
    const clear = jest.spyOn(globalThis, 'clearTimeout');
    await rerender({ value: 'b', delay: 300 });
    // React schedules timers of its own: pick the debounce one by its delay.
    const call = set.mock.calls.findIndex(([, delay]) => delay === 300);
    expect(call).toBeGreaterThanOrEqual(0);
    const timer = set.mock.results[call]?.value;
    await unmount();
    expect(clear).toHaveBeenCalledWith(timer);
  });
});
