import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  ReduceMotion,
  useReducedMotion as useReducedMotionAtLaunch,
} from 'react-native-reanimated';

import { motion, type ReducedMotionBehavior } from '@/theme';

import type { ResolvedMotion } from './useReducedMotion.types';

// One app-wide listener; `undefined` until the system answers.
let current: boolean | undefined;
let started = false;
const listeners = new Set<() => void>();

function update(enabled: boolean) {
  if (enabled === current) return;
  current = enabled;
  listeners.forEach((listener) => listener());
}

function start() {
  if (started) return;
  started = true;
  let changed = false;
  AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
    changed = true;
    update(enabled);
  });
  // An event that arrives first is newer than this answer.
  void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
    if (!changed) update(enabled);
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;

/** Whether the system asks for reduced motion; rerenders when the setting changes. */
export function useReducedMotion(): boolean {
  // Reanimated reads the setting synchronously at launch, so the first render is right.
  const atLaunch = useReducedMotionAtLaunch();
  return useSyncExternalStore(subscribe, getSnapshot) ?? atLaunch;
}

/** Resolves an animation's reduced-motion behavior (ADR 0002) into what to run. */
export function resolveMotion(
  behavior: ReducedMotionBehavior,
  reduced: boolean,
  duration: number
): ResolvedMotion {
  const reduceMotion = ReduceMotion.Never;
  if (!reduced || behavior === 'keep') {
    return { mode: 'full', duration, reduceMotion };
  }
  if (behavior === 'fade') {
    return { mode: 'fade', duration: motion.reducedMotionFade, reduceMotion };
  }
  return { mode: 'static', duration: 0, reduceMotion };
}
