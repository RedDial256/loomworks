jest.mock('react-native-unistyles', () =>
  jest.requireActual('./unistyles-mock')
);
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest')
);
import 'react-native-gesture-handler/jestSetup';
// Worklets' JS implementation has no UI runtime for Gesture Handler to bind to.
jest.mock(
  'react-native-gesture-handler/lib/module/handlers/gestures/installUIRuntimeBindings',
  () => ({ installUIRuntimeBindings: () => {} })
);
