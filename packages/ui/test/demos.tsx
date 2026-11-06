// Renders every demo listed in the manifest; the light and dark suites share it.
import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react-native';

type ManifestItems = Record<string, { kind: string; demo?: string }>;

/** What the sandbox reads from a demo module (`DemoEntry` lives in the template). */
type DemoModule = {
  demo: { title: string; sections: { title: string; content: ReactNode }[] };
};

export const manifestItems = (): ManifestItems =>
  jest.requireActual<{ items: ManifestItems }>('../manifest.json').items;

export const describeDemos = () => {
  const demos = Object.entries(manifestItems()).flatMap(([id, item]) =>
    item.demo ? [[id, item.demo] as const] : []
  );

  describe.each(demos)('the %s demo', (_, path) => {
    const { demo } = jest.requireActual<DemoModule>(`../src/${path}`);

    it.each(demo.sections.map((section) => [section.title, section]))(
      'renders the %s section',
      async (_title, section) => {
        await render(<>{section.content}</>);
        expect(screen.toJSON()).toBeTruthy();
      }
    );
  });
};
