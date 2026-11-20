import { describeDemos, manifestItems } from '../test/demos';

/** Components shown through another item's demo, or with nothing to show alone. */
const WITHOUT_DEMO = ['field', 'text-field', 'date-time-input'];

describe('demos', () => {
  it('exist for every component', () => {
    const missing = Object.entries(manifestItems())
      .filter(([, item]) => item.kind === 'component' && !item.demos?.length)
      .map(([id]) => id);
    expect(missing).toEqual(WITHOUT_DEMO);
  });

  describeDemos();
});
