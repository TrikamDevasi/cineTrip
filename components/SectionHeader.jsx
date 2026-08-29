import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Icon from './ui/Icon';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function SectionHeader({ title, subtitle, actionText, onAction, icon }) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.titleRow}>
          {icon && (
            <View style={styles.iconWrapper}>
              <Icon name={icon} size={18} color={COLORS.primary} strokeWidth={2.2} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {actionText && onAction && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onAction}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${actionText} ${title}`}
        >
          <Text style={styles.actionText}>{actionText}</Text>
          <ChevronRight size={14} color={COLORS.primary} strokeWidth={2.2} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  left: {
    flex: 1,
    marginRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 6,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  actionText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
});
