import { act, renderHook } from '@testing-library/react-native';

import { useDisclosure } from './useDisclosure';

describe('useDisclosure', () => {
  it('is closed by default', async () => {
    const { result } = await renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it('takes an initial state', async () => {
    const { result } = await renderHook(() => useDisclosure(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('opens, closes and toggles', async () => {
    const { result } = await renderHook(() => useDisclosure());
    await act(async () => result.current.open());
    expect(result.current.isOpen).toBe(true);
    await act(async () => result.current.open());
    expect(result.current.isOpen).toBe(true);
    await act(async () => result.current.close());
    expect(result.current.isOpen).toBe(false);
    await act(async () => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    await act(async () => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('keeps the same callbacks across renders', async () => {
    const { result } = await renderHook(() => useDisclosure());
    const { open, close, toggle } = result.current;
    await act(async () => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.open).toBe(open);
    expect(result.current.close).toBe(close);
    expect(result.current.toggle).toBe(toggle);
  });
});
