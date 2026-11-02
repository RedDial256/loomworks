import type { FC } from 'react';
import { Drawer, type DrawerContentComponentProps } from 'expo-router/drawer';

import { SandboxDrawer } from '@/sandbox/SandboxDrawer';

const SCREEN_OPTIONS = { title: 'Sandbox' };

const renderDrawer = (props: DrawerContentComponentProps) => (
  <SandboxDrawer {...props} />
);

const SandboxLayout: FC = () => {
  return (
    <Drawer drawerContent={renderDrawer} screenOptions={SCREEN_OPTIONS}>
      <Drawer.Screen name="index" />
      <Drawer.Screen name="[id]" />
    </Drawer>
  );
};

export default SandboxLayout;
