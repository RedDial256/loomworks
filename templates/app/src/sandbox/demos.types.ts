import type { ReactNode } from 'react';

/** One titled example of a demo. */
export type DemoSection = {
  title: string;
  description?: string;
  content: ReactNode;
};

/** What a `*.demo.tsx` exports as `demo`. */
export type Demo = {
  title: string;
  sections: readonly DemoSection[];
};

/** Sandbox section: theme tokens, then components. */
export type DemoGroup = 'theme' | 'components';

/** One entry of the sandbox index (`demos.ts`, written by `loom add`). */
export type DemoEntry = {
  /** Route segment `/sandbox/<id>`: the item name, plus the file name for an item with several demos. */
  id: string;
  group: DemoGroup;
} & Demo;
