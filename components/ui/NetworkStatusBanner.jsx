import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

export default function NetworkStatusBanner({ isOffline = false, isSyncing = false, style }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (!isOffline && !isSyncing) return null;

  return (
    <View
      style={[
        styles.banner,
        isOffline ? styles.offlineBanner : styles.syncingBanner,
        style,
      ]}
    >
      {isOffline ? (
        <>
          <WifiOff size={14} color={colors.warning} strokeWidth={2} style={styles.icon} />
          <Text style={styles.bannerText}>
            Offline Mode — Using local cache & saved passes.
          </Text>
        </>
      ) : (
        <>
          <RefreshCw size={14} color={colors.primary} strokeWidth={2} style={styles.icon} />
          <Text style={[styles.bannerText, { color: colors.primary }]}>
            Syncing changes with cloud database...
          </Text>
        </>
      )}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
  },
  offlineBanner: {
    backgroundColor: colors.warningSubtle,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  syncingBanner: {
    backgroundColor: colors.primarySubtle,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  icon: {
    marginRight: 6,
  },
  bannerText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: colors.warning,
    fontWeight: '600',
  },
});
