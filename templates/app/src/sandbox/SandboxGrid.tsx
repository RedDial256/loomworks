import { type FC, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';

import {
  LegendList,
  type LegendListRenderItemProps,
} from '@legendapp/list/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { useDebounce } from '@/hooks/debounce/useDebounce';

import { DemoCard } from './components/DemoCard';
import { DemoListEmpty } from './components/DemoListEmpty';
import { GridHeader } from './components/GridHeader';
import { demos } from './demos';
import {
  filterDemos,
  GRID_GAP,
  gridLayout,
  type GridRow,
  gridRows,
  SEARCH_DELAY,
} from './sandbox.utils';

const keyOf = (row: GridRow) => row.key;
const typeOf = (row: GridRow) => row.kind;

// Headers take the whole row.
const spanHeaders = (
  layout: { span?: number },
  row: GridRow,
  _index: number,
  columns: number
) => {
  if (row.kind === 'header') layout.span = columns;
};

const COLUMN_GAP = { gap: GRID_GAP };

/** Sandbox screen: theme and component demo cards in a grid, searched from the native header. */
export const SandboxGrid: FC = () => {
  const [query, setQuery] = useState('');

  const search = useDebounce(query, SEARCH_DELAY);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // LegendList is a third-party view: a `StyleSheet` style keeps its first
  // theme, so the background comes from the theme on each render.
  const { theme } = useUnistyles();

  const rows = useMemo(() => gridRows(filterDemos(demos, search)), [search]);
  // In landscape the scroll view insets its content by the side safe areas.
  const visible = width - insets.left - insets.right;
  const { columns, cardWidth } = useMemo(() => gridLayout(visible), [visible]);

  const renderRow = ({ item }: LegendListRenderItemProps<GridRow>) => {
    if (item.kind === 'header') return <GridHeader title={item.title} />;
    return <DemoCard demo={item.demo} width={cardWidth} />;
  };
  const changeQuery = (event: { nativeEvent: { text: string } }) =>
    setQuery(event.nativeEvent.text);

  const options = {
    headerSearchBarOptions: {
      placeholder: 'Search',
      onChangeText: changeQuery,
    },
  };
  const empty = <DemoListEmpty query={search} />;
  const background = { backgroundColor: theme.colors.background };
  return (
    <>
      <Stack.Screen options={options} />
      <LegendList
        key={columns}
        data={rows}
        numColumns={columns}
        keyExtractor={keyOf}
        getItemType={typeOf}
        overrideItemLayout={spanHeaders}
        renderItem={renderRow}
        columnWrapperStyle={COLUMN_GAP}
        style={[styles.screen, background]}
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
  screen: { flex: 1 },
  grid: { padding: theme.spacing.md },
}));
