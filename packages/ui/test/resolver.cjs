// Worklets' JS implementation instead of the native module, so Reanimated 4 runs in Jest.
// Same rules as `react-native-reanimated/jest/resolver` (which wraps the Worklets one),
// but the Worklets rule there also matches pnpm folders that merely mention worklets
// in their name (such as expo's) and breaks them.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest loads resolvers as CommonJS
const presetResolver = require('@react-native/jest-preset/jest/resolver.js');

const WORKLETS_DIR = /[\\/]node_modules[\\/]react-native-worklets[\\/]/;
const REANIMATED_DIR = /[\\/]node_modules[\\/]react-native-reanimated[\\/]/;
// Reanimated modules whose native variant needs the UI runtime (copied from Reanimated 4.7's resolver).
const REANIMATED_WEB_ONLY = [
  'initializers',
  'mutables',
  'mappers',
  'ConfigHelper',
  'UpdateLayoutAnimations',
  'useAnimatedRef',
  'useAnimatedStyle',
  'WorkletEventHandler',
  'JSPropsUpdater',
  'updateProps',
  'util',
  'css/component/AnimatedComponent',
];

const isReanimatedWebOnly = (request, basedir) => {
  const basename = request.split('/').pop();
  return (
    request.startsWith('.') &&
    REANIMATED_DIR.test(basedir) &&
    REANIMATED_WEB_ONLY.some((entry) =>
      entry.includes('/') ? request.endsWith(entry) : basename === entry
    )
  );
};

module.exports = (request, options) => {
  if (
    request.startsWith('react-native-worklets') ||
    WORKLETS_DIR.test(options.basedir) ||
    isReanimatedWebOnly(request, options.basedir)
  ) {
    options = {
      ...options,
      extensions: options.extensions?.filter((ext) => !ext.includes('native')),
    };
  }
  return presetResolver(request, options);
};
