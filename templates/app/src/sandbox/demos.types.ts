import type { ReactNode } from 'react';

/** One titled example of a demo. */
export interface DemoSection {
  title: string;
  description?: string;
  content: ReactNode;
}

/** What a `*.demo.tsx` exports as `demo`. */
export interface Demo {
  title: string;
  /** Extra search terms besides the title. */
  keywords: readonly string[];
  sections: readonly DemoSection[];
}

/** One entry of the sandbox index (`demos.ts`, written by `loom add`). */
export interface DemoEntry extends Demo {
  /** Item name and route segment: `/sandbox/<id>`. */
  id: string;
}
