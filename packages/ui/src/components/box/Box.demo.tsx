import { StyleSheet } from 'react-native-unistyles';

import { Box } from './Box';

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  swatch: { width: 32, height: 32 },
}));

export const demo = {
  title: 'Box',
  keywords: ['layout', 'container', 'view', 'surface', 'background', 'padding'],
  sections: [
    {
      title: 'Surfaces',
      description: 'From the outside in: background, surface, raised, sunken.',
      content: (
        <Box surface="background" padding="M">
          <Box surface="surface" padding="M">
            <Box surface="raised" padding="M">
              <Box surface="sunken" style={styles.swatch} />
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      title: 'Padding',
      description: 'S, M and L around a sunken box.',
      content: (
        <Box style={styles.row}>
          <Box surface="raised" padding="S">
            <Box surface="sunken" style={styles.swatch} />
          </Box>
          <Box surface="raised" padding="M">
            <Box surface="sunken" style={styles.swatch} />
          </Box>
          <Box surface="raised" padding="L">
            <Box surface="sunken" style={styles.swatch} />
          </Box>
        </Box>
      ),
    },
  ],
};
