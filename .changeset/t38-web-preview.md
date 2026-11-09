---
'@red_dial/create-weaver': minor
---

The template app runs on web: it adds `react-dom`, `react-native-web` and `@expo/metro-runtime` (SDK 58 pins), and styles `GestureHandlerRootView` and the home screen image through `withUnistyles`, without which Unistyles styles do not reach them on web.
