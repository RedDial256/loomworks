const path = require('node:path');

// In the monorepo the kit is read from packages/ui; Unistyles must process it like app code.
const ui = path.resolve(__dirname, '../../packages/ui/src');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // `root` must contain every file that calls StyleSheet.create.
    plugins: [
      [
        'react-native-unistyles/plugin',
        { root: 'src', autoProcessPaths: [ui] },
      ],
    ],
  };
};
