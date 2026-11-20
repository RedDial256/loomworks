import { type FC, useEffect } from 'react';
import { Tabs, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';

import { useNavigationTheme } from '@/navigation/useNavigationTheme';
import { restoreThemeMode } from '@/theme';

// Kept up until the stored theme mode is applied, so the app does not flash the system theme.
void SplashScreen.preventAutoHideAsync();

// Third-party view: on web, Unistyles styles reach it only through `withUnistyles`.
const Root = withUnistyles(GestureHandlerRootView);

const SANDBOX_OPTIONS = { title: 'Sandbox', headerShown: false };
const HOME_OPTIONS = { title: 'Home' };
// No icon set is installed; labels only.
const TABS_OPTIONS = { tabBarIconStyle: { display: 'none' as const } };

const RootLayout: FC = () => {
  const navigationTheme = useNavigationTheme();

  useEffect(() => {
    void restoreThemeMode().finally(() => SplashScreen.hideAsync());
  }, []);

  const statusBarStyle = navigationTheme.dark ? 'light' : 'dark';
  return (
    <Root style={styles.root}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={statusBarStyle} />
        <Tabs screenOptions={TABS_OPTIONS}>
          <Tabs.Screen name="index" options={HOME_OPTIONS} />
          <Tabs.Screen name="sandbox" options={SANDBOX_OPTIONS} />
        </Tabs>
      </ThemeProvider>
    </Root>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  root: { flex: 1 },
});
