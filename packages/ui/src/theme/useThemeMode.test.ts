import * as React from 'react';

import type * as AsyncStorageModule from '@react-native-async-storage/async-storage';
import * as rtl from '@testing-library/react-native';
import type * as Unistyles from 'react-native-unistyles';

import type * as ThemeMode from './useThemeMode';
import type { ThemeMode as Mode } from './useThemeMode.types';

// The hook keeps module state: load fresh copies for every test, sharing the
// testing library's React.
let hook: typeof ThemeMode;
let storage: typeof AsyncStorageModule.default;
let runtime: typeof Unistyles.UnistylesRuntime;
let setAdaptiveThemes: jest.SpyInstance;
let setTheme: jest.SpyInstance;

/* eslint-disable @typescript-eslint/no-require-imports -- re-required after jest.resetModules */
beforeEach(() => {
  jest.resetModules();
  jest.doMock('react', () => React);
  hook = require('./useThemeMode');
  storage = require('@react-native-async-storage/async-storage').default;
  runtime = require('react-native-unistyles').UnistylesRuntime;
  setAdaptiveThemes = jest.spyOn(runtime, 'setAdaptiveThemes');
  setTheme = jest.spyOn(runtime, 'setTheme');
});
/* eslint-enable @typescript-eslint/no-require-imports */

const renderMode = () => rtl.renderHook(() => hook.useThemeMode());

describe('useThemeMode', () => {
  it('follows the system until a mode is chosen', async () => {
    const { result } = await renderMode();
    expect(result.current.mode).toBe('system');
    await expect(hook.restoreThemeMode()).resolves.toBe('system');
    expect(setAdaptiveThemes).not.toHaveBeenCalled();
    expect(setTheme).not.toHaveBeenCalled();
  });

  it.each<[Mode, Mode]>([
    ['system', 'light'],
    ['system', 'dark'],
    ['light', 'dark'],
    ['dark', 'light'],
    ['light', 'system'],
    ['dark', 'system'],
  ])('goes from %s to %s', async (from, to) => {
    const { result } = await renderMode();
    await rtl.act(async () => result.current.setMode(from));
    setAdaptiveThemes.mockClear();
    setTheme.mockClear();

    await rtl.act(async () => result.current.setMode(to));

    expect(result.current.mode).toBe(to);
    if (to === 'system') {
      expect(setAdaptiveThemes).toHaveBeenCalledWith(true);
      expect(setTheme).not.toHaveBeenCalled();
    } else {
      expect(setAdaptiveThemes).toHaveBeenCalledWith(false);
      expect(setTheme).toHaveBeenCalledWith(to);
      // Adaptive themes go off before `setTheme`, which Unistyles rejects otherwise.
      const [adaptiveOff] = setAdaptiveThemes.mock.invocationCallOrder;
      const [themeSet] = setTheme.mock.invocationCallOrder;
      expect(adaptiveOff).toBeLessThan(themeSet!);
    }
    await expect(storage.getItem(hook.THEME_MODE_KEY)).resolves.toBe(to);
  });

  it('shares the mode between hook instances', async () => {
    const first = await renderMode();
    const second = await renderMode();
    await rtl.act(async () => first.result.current.setMode('dark'));
    expect(second.result.current.mode).toBe('dark');
  });
});

describe('restoreThemeMode', () => {
  it('applies the stored mode and updates the hook', async () => {
    await storage.setItem(hook.THEME_MODE_KEY, 'dark');
    const { result } = await renderMode();

    await rtl.act(async () => {
      await expect(hook.restoreThemeMode()).resolves.toBe('dark');
    });

    expect(result.current.mode).toBe('dark');
    expect(setAdaptiveThemes).toHaveBeenCalledWith(false);
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('reads the storage once', async () => {
    const getItem = jest.spyOn(storage, 'getItem');
    const first = hook.restoreThemeMode();
    expect(hook.restoreThemeMode()).toBe(first);
    await first;
    expect(getItem).toHaveBeenCalledTimes(1);
  });

  it('ignores an unknown stored value', async () => {
    await storage.setItem(hook.THEME_MODE_KEY, 'sepia');
    await expect(hook.restoreThemeMode()).resolves.toBe('system');
    expect(setTheme).not.toHaveBeenCalled();
  });

  it('keeps a mode chosen before the read resolves', async () => {
    await storage.setItem(hook.THEME_MODE_KEY, 'dark');
    const restoring = hook.restoreThemeMode();
    hook.setThemeMode('light');
    await expect(restoring).resolves.toBe('light');
    expect(setTheme).not.toHaveBeenCalledWith('dark');
  });

  it('falls back to the system when the storage fails', async () => {
    jest.spyOn(storage, 'getItem').mockRejectedValue(new Error('io'));
    jest.spyOn(storage, 'setItem').mockRejectedValue(new Error('io'));
    await expect(hook.restoreThemeMode()).resolves.toBe('system');
    expect(() => hook.setThemeMode('dark')).not.toThrow();
  });
});
