import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

export default function NetworkStatusBanner({ isOffline = false, isSyncing = false, style }) {
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
          <WifiOff size={14} color={COLORS.warning} strokeWidth={2} style={styles.icon} />
          <Text style={styles.bannerText}>
            Offline Mode — Using local cache & saved passes.
          </Text>
        </>
      ) : (
        <>
          <RefreshCw size={14} color={COLORS.primary} strokeWidth={2} style={styles.icon} />
          <Text style={[styles.bannerText, { color: COLORS.primary }]}>
            Syncing changes with cloud database...
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.warningSubtle,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  syncingBanner: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  icon: {
    marginRight: 6,
  },
  bannerText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '600',
  },
});
