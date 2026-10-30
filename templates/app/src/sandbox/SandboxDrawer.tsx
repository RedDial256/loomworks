import { type FC, useMemo, useState } from 'react';
import { FlatList, type ListRenderItem } from 'react-native';
import type { DrawerContentComponentProps } from 'expo-router/drawer';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Input } from '@/components/input/Input';
import { useDebounce } from '@/hooks/debounce/useDebounce';

import { DemoItem } from './components/DemoItem';
import { DemoListEmpty } from './components/DemoListEmpty';
import { demos } from './demos';
import type { DemoEntry } from './demos.types';
import { filterDemos, SEARCH_DELAY } from './sandbox.utils';

const keyOf = (demo: DemoEntry) => demo.id;

const renderDemo: ListRenderItem<DemoEntry> = ({ item }) => (
  <DemoItem demo={item} />
);

/** Drawer content: a search field over the sandbox index. */
export const SandboxDrawer: FC<DrawerContentComponentProps> = () => {
  const [query, setQuery] = useState('');

  const search = useDebounce(query, SEARCH_DELAY);
  const insets = useSafeAreaInsets();

  const results = useMemo(() => filterDemos(demos, search), [search]);

  const empty = <DemoListEmpty query={search} />;
  const padding = { paddingTop: insets.top, paddingBottom: insets.bottom };
  return (
    <Box surface="surface" style={[styles.drawer, padding]}>
      <Box padding="M">
        <Input
          type="search"
          label="Search components"
          value={query}
          onChangeText={setQuery}
        />
      </Box>
      <FlatList
        data={results}
        keyExtractor={keyOf}
        renderItem={renderDemo}
        ListEmptyComponent={empty}
        keyboardShouldPersistTaps="handled"
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  drawer: { flex: 1 },
});
