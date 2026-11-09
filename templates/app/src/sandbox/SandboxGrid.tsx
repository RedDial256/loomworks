import { type FC, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';

import {
  LegendList,
  type LegendListRenderItemProps,
} from '@legendapp/list/react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useDebounce } from '@/hooks/debounce/useDebounce';

import { DemoCard } from './components/DemoCard';
import { DemoListEmpty } from './components/DemoListEmpty';
import { demos } from './demos';
import type { DemoEntry } from './demos.types';
import {
  filterDemos,
  GRID_GAP,
  gridLayout,
  SEARCH_DELAY,
} from './sandbox.utils';

const keyOf = (demo: DemoEntry) => demo.id;

const COLUMN_GAP = { gap: GRID_GAP };

/** Sandbox screen: a grid of demo cards, searched from the native header. */
export const SandboxGrid: FC = () => {
  const [query, setQuery] = useState('');

  const search = useDebounce(query, SEARCH_DELAY);
  const { width } = useWindowDimensions();

  const results = useMemo(() => filterDemos(demos, search), [search]);
  const { columns, cardWidth } = useMemo(() => gridLayout(width), [width]);

  const renderDemo = ({ item }: LegendListRenderItemProps<DemoEntry>) => (
    <DemoCard demo={item} width={cardWidth} />
  );
  const changeQuery = (event: { nativeEvent: { text: string } }) =>
    setQuery(event.nativeEvent.text);

  const options = {
    headerSearchBarOptions: {
      placeholder: 'Search components',
      onChangeText: changeQuery,
    },
  };
  const empty = <DemoListEmpty query={search} />;
  return (
    <>
      <Stack.Screen options={options} />
      <LegendList
        key={columns}
        data={results}
        numColumns={columns}
        keyExtractor={keyOf}
        renderItem={renderDemo}
        columnWrapperStyle={COLUMN_GAP}
        style={styles.screen}
        contentContainerStyle={styles.grid}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={empty}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  grid: { padding: theme.spacing.md },
}));
