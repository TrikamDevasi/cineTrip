import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

/**
 * Sync / Network State Indicator Banner
 * Explicitly communicates when the app is in offline cache mode vs live synced.
 */
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
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  syncingBanner: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  icon: {
    marginRight: 6,
  },
  bannerText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.warning,
  },
});
