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

/** One entry of the sandbox index (`demos.ts`, written by `loom add`). */
export type DemoEntry = {
  /** Item name and route segment: `/sandbox/<id>`. */
  id: string;
} & Demo;
