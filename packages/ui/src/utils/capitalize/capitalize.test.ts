import { capitalize } from './capitalize';

describe('capitalize', () => {
  it('uppercases the first character only', () => {
    expect(capitalize('primary')).toBe('Primary');
    expect(capitalize('onPrimary')).toBe('OnPrimary');
  });

  it('leaves empty and already capitalized strings alone', () => {
    expect(capitalize('')).toBe('');
    expect(capitalize('Danger')).toBe('Danger');
  });
});
