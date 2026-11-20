import { describeDemos } from '../test/demos';

// The Unistyles mock resolves styles against `light`; swap it for `dark` here.
jest.mock('./theme/light', () => ({
  light: jest.requireActual('./theme/dark').dark,
}));

describe('demos in dark mode', () => {
  describeDemos();
});
