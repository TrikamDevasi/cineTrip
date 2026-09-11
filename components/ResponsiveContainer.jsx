import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

/**
 * ResponsiveContainer
 * Centers content and sets an optimal max-width on tablet and desktop screens
 * while stretching to 100% on mobile screens.
 */
export default function ResponsiveContainer({
  children,
  maxWidth = 1200,
  style,
  contentContainerStyle,
}) {
  return (
    <View style={[styles.outer, style]}>
      <View
        style={[
          styles.inner,
          { maxWidth },
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
  inner: {
    width: '100%',
    flex: 1,
    ...Platform.select({
      web: {
        marginHorizontal: 'auto',
      },
    }),
  },
});
