import { type FC, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';

import {
  LegendList,
  type LegendListRenderItemProps,
} from '@legendapp/list/react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Box } from '@/components/box/Box';
import { Input } from '@/components/input/Input';
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

/** Sandbox screen: a search field over a grid of demo cards. */
export const SandboxGrid: FC = () => {
  const [query, setQuery] = useState('');

  const search = useDebounce(query, SEARCH_DELAY);
  const { width } = useWindowDimensions();

  const results = useMemo(() => filterDemos(demos, search), [search]);
  const { columns, cardWidth } = useMemo(() => gridLayout(width), [width]);

  const renderDemo = ({ item }: LegendListRenderItemProps<DemoEntry>) => (
    <DemoCard demo={item} width={cardWidth} />
  );

  const empty = <DemoListEmpty query={search} />;
  return (
    <Box surface="background" style={styles.screen}>
      <Box padding="M">
        <Input
          type="search"
          label="Search components"
          value={query}
          onChangeText={setQuery}
        />
      </Box>
      <LegendList
        key={columns}
        data={results}
        numColumns={columns}
        keyExtractor={keyOf}
        renderItem={renderDemo}
        columnWrapperStyle={COLUMN_GAP}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={empty}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1 },
  grid: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
}));
