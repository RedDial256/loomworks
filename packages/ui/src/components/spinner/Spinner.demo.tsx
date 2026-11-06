import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { Spinner } from './Spinner';

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
}));

export const demo = {
  title: 'Spinner',
  keywords: ['loading', 'activity', 'progress', 'busy', 'indicator'],
  sections: [
    {
      title: 'Sizes',
      description:
        'S, M and L. It keeps spinning under reduced motion: it is the only sign of progress.',
      content: (
        <View style={styles.row}>
          <Spinner size="S" />
          <Spinner />
          <Spinner size="L" />
        </View>
      ),
    },
    {
      title: 'Colors',
      description: 'Any color role or a raw color.',
      content: (
        <View style={styles.row}>
          <Spinner color="success" />
          <Spinner color="warning" />
          <Spinner color="danger" />
          <Spinner color="textMuted" />
          <Spinner color="#8b5cf6" />
        </View>
      ),
    },
  ],
};
