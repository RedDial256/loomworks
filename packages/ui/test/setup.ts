jest.mock('react-native-unistyles', () =>
  jest.requireActual('./unistyles-mock')
);
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest')
);
