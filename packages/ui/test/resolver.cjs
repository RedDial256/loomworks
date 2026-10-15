// Worklets' JS implementation instead of the native module, so Reanimated 4 runs in Jest.
// Same rule as `react-native-worklets/jest/resolver`, which also matches pnpm folders
// that merely mention worklets in their name (such as expo's) and breaks them.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest loads resolvers as CommonJS
const presetResolver = require('@react-native/jest-preset/jest/resolver.js');

const WORKLETS_DIR = /[\\/]node_modules[\\/]react-native-worklets[\\/]/;

module.exports = (request, options) => {
  if (
    request.startsWith('react-native-worklets') ||
    WORKLETS_DIR.test(options.basedir)
  ) {
    options = {
      ...options,
      extensions: options.extensions?.filter((ext) => !ext.includes('native')),
    };
  }
  return presetResolver(request, options);
};
