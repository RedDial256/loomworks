import type { FC } from 'react';
import { Stack } from 'expo-router';

const INDEX_OPTIONS = { title: 'Sandbox' };

/** Native stack: shared element and zoom transitions only run on it. */
const SandboxLayout: FC = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={INDEX_OPTIONS} />
      <Stack.Screen name="[id]" />
    </Stack>
  );
};

export default SandboxLayout;
