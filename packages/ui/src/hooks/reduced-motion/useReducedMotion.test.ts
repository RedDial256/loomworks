import { ReduceMotion } from 'react-native-reanimated';

import { motion } from '@/theme';

import { easings, resolveMotion } from './useReducedMotion';

let mockAtLaunch = false;
jest.mock('react-native-reanimated', () => ({
  // Returns its control points, so tests can see which curve was built.
  Easing: { bezier: (...points: number[]) => points },
  ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
  useReducedMotion: () => mockAtLaunch,
}));

let rntl: typeof import('@testing-library/react-native/pure') | undefined;

/* eslint-disable @typescript-eslint/no-require-imports -- re-required after jest.resetModules */
/** Fresh module state per test, with the system query and change event under control. */
function setup(atLaunch = false) {
  jest.resetModules();
  mockAtLaunch = atLaunch;
  const { AccessibilityInfo } =
    require('react-native') as typeof import('react-native');
  let answer: (enabled: boolean) => void = () => {};
  let emit: (enabled: boolean) => void = () => {};
  const query = jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockImplementation(() => new Promise((resolve) => (answer = resolve)));
  const listen = jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation((_event, handler) => {
      emit = handler as unknown as typeof emit;
      return { remove: jest.fn() } as unknown as ReturnType<
        typeof AccessibilityInfo.addEventListener
      >;
    });
  rntl =
    require('@testing-library/react-native/pure') as typeof import('@testing-library/react-native/pure');
  const { act: rntlAct, renderHook } = rntl;
  const { useMotion, useReducedMotion } =
    require('./useReducedMotion') as typeof import('./useReducedMotion');
  const act = (fn: () => void) => rntlAct(async () => fn());
  return {
    query,
    listen,
    answer: (enabled: boolean) => act(() => answer(enabled)),
    emit: (enabled: boolean) => act(() => emit(enabled)),
    render: () => renderHook(() => useReducedMotion()),
    renderMotion: () => renderHook(() => useMotion('fade', 200)),
  };
}
/* eslint-enable @typescript-eslint/no-require-imports */

afterEach(() => rntl?.cleanup());

describe('useReducedMotion', () => {
  it('starts from the value Reanimated read at launch', async () => {
    const { render } = setup(true);
    const { result } = await render();
    expect(result.current).toBe(true);
  });

  it('follows the system query', async () => {
    const { render, answer } = setup(false);
    const { result } = await render();
    await answer(true);
    expect(result.current).toBe(true);
  });

  it('rerenders on the change event', async () => {
    const { render, answer, emit } = setup(false);
    const { result } = await render();
    await answer(false);
    await emit(true);
    expect(result.current).toBe(true);
    await emit(false);
    expect(result.current).toBe(false);
  });

  it('keeps an event that arrives before the query answers', async () => {
    const { render, answer, emit } = setup(false);
    const { result } = await render();
    await emit(true);
    await answer(false);
    expect(result.current).toBe(true);
  });

  it('shares one listener and one query across components', async () => {
    const { render, query, listen, emit } = setup(false);
    const first = await render();
    const second = await render();
    await emit(true);
    expect(first.result.current).toBe(true);
    expect(second.result.current).toBe(true);
    expect(query).toHaveBeenCalledTimes(1);
    expect(listen).toHaveBeenCalledTimes(1);
  });
});

describe('useMotion', () => {
  it('resolves with the live setting', async () => {
    const { renderMotion, answer, emit } = setup(false);
    const { result } = await renderMotion();
    await answer(false);
    expect(result.current).toMatchObject({ mode: 'full', duration: 200 });
    await emit(true);
    expect(result.current).toMatchObject({ mode: 'fade', duration: 150 });
  });
});

describe('easings', () => {
  it('are built from the theme control points', () => {
    expect(easings).toEqual({
      standard: motion.easing.standard.bezier,
      gentle: motion.easing.gentle.bezier,
    });
  });
});

describe('resolveMotion', () => {
  it.each([
    ['none', false, { mode: 'full', duration: 200 }],
    ['fade', false, { mode: 'full', duration: 200 }],
    ['keep', false, { mode: 'full', duration: 200 }],
    ['none', true, { mode: 'static', duration: 0 }],
    ['fade', true, { mode: 'fade', duration: 150 }],
    ['keep', true, { mode: 'full', duration: 200 }],
  ] as const)('resolves %s with reduced %s', (behavior, reduced, expected) => {
    expect(resolveMotion(behavior, 200, reduced)).toEqual({
      ...expected,
      reduceMotion: ReduceMotion.Never,
    });
  });
});
