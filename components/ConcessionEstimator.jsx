import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus, Popcorn, Coffee, UtensilsCrossed, Info } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../constants/theme';

export const CONCESSION_MENU = [
  {
    id: 'popcorn-reg',
    name: 'Butter Popcorn',
    category: 'Popcorn',
    icon: Popcorn,
    sizes: [
      { size: 'Small', price: 6.0 },
      { size: 'Medium', price: 8.0 },
      { size: 'Large', price: 10.0 },
    ],
  },
  {
    id: 'drink-soda',
    name: 'Fountain Soda / ICEE',
    category: 'Drinks',
    icon: Coffee,
    sizes: [
      { size: 'Small', price: 4.5 },
      { size: 'Medium', price: 5.5 },
      { size: 'Large', price: 6.5 },
    ],
  },
  {
    id: 'snack-nachos',
    name: 'Warm Cheese Nachos',
    category: 'Snacks',
    icon: UtensilsCrossed,
    sizes: [
      { size: 'Regular', price: 8.5 },
    ],
  },
  {
    id: 'combo-classic',
    name: 'CineTrip Duo Combo (Lrg Popcorn + 2 Drinks)',
    category: 'Combos',
    icon: Popcorn,
    sizes: [
      { size: 'Combo', price: 19.0 },
    ],
  },
];

export default function ConcessionEstimator({ concessions = [], onUpdateConcessions }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const getItemQuantity = (itemId, size) => {
    const item = concessions.find((c) => c.name === itemId && c.size === size);
    return item ? item.quantity : 0;
  };

  const handleUpdate = (menuItem, sizeOption, delta) => {
    const currentQty = getItemQuantity(menuItem.name, sizeOption.size);
    const newQty = Math.max(0, currentQty + delta);

    let updated = [...concessions];
    const index = updated.findIndex((c) => c.name === menuItem.name && c.size === sizeOption.size);

    if (newQty === 0) {
      if (index !== -1) updated.splice(index, 1);
    } else {
      const itemRecord = {
        name: menuItem.name,
        size: sizeOption.size,
        quantity: newQty,
        unitPrice: sizeOption.price,
        subtotal: Number((newQty * sizeOption.price).toFixed(2)),
      };
      if (index !== -1) {
        updated[index] = itemRecord;
      } else {
        updated.push(itemRecord);
      }
    }

    const total = Number(
      updated.reduce((sum, item) => sum + (item.subtotal || 0), 0).toFixed(2)
    );

    if (onUpdateConcessions) {
      onUpdateConcessions(updated, total);
    }
  };

  const grandTotal = concessions.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  return (
    <View style={styles.container}>
      {/* Notice Banner */}
      <View style={styles.noticeBanner}>
        <Info size={14} color={colors.primary} />
        <Text style={styles.noticeText}>
          Concession Estimator (Prices are theater averages for trip budget planning)
        </Text>
      </View>

      {/* Menu List */}
      {CONCESSION_MENU.map((item) => {
        const IconComponent = item.icon;
        return (
          <View key={item.id} style={styles.menuCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrapper}>
                <IconComponent size={16} color={colors.primary} />
              </View>
              <Text style={styles.itemTitle}>{item.name}</Text>
            </View>

            <View style={styles.sizesRow}>
              {item.sizes.map((s) => {
                const qty = getItemQuantity(item.name, s.size);
                return (
                  <View key={s.size} style={[styles.sizeBox, qty > 0 && styles.sizeBoxActive]}>
                    <View style={styles.sizeInfo}>
                      <Text style={[styles.sizeLabel, qty > 0 && styles.sizeLabelActive]}>
                        {s.size}
                      </Text>
                      <Text style={styles.priceLabel}>${s.price.toFixed(2)}</Text>
                    </View>

                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={[styles.stepBtn, qty === 0 && styles.stepBtnDisabled]}
                        onPress={() => handleUpdate(item, s, -1)}
                        disabled={qty === 0}
                        accessibilityLabel={`Decrease ${item.name} ${s.size}`}
                      >
                        <Minus size={12} color={qty > 0 ? colors.text : colors.textMuted} />
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{qty}</Text>

                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => handleUpdate(item, s, 1)}
                        accessibilityLabel={`Increase ${item.name} ${s.size}`}
                      >
                        <Plus size={12} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      {/* Estimated Total Display */}
      <View style={styles.totalBar}>
        <View>
          <Text style={styles.totalLabel}>ESTIMATED REFRESHMENTS TOTAL</Text>
          <Text style={styles.itemCountText}>
            {concessions.reduce((acc, c) => acc + c.quantity, 0)} items selected
          </Text>
        </View>
        <Text style={styles.totalAmount}>${grandTotal.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      marginTop: SPACING.sm,
    },
    noticeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.2)',
    },
    noticeText: {
      ...TYPOGRAPHY.caption,
      color: colors.primary,
      flex: 1,
      fontSize: 11,
      fontWeight: '600',
    },
    menuCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      ...SHADOWS.card,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    iconWrapper: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemTitle: {
      ...TYPOGRAPHY.bodyBold,
      color: colors.text,
      fontSize: 14,
      flex: 1,
    },
    sizesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    sizeBox: {
      flex: 1,
      minWidth: 130,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#0D121D',
      paddingHorizontal: SPACING.sm,
      paddingVertical: 8,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    sizeBoxActive: {
      borderColor: colors.primary,
      backgroundColor: '#141A26',
    },
    sizeInfo: {
      flex: 1,
    },
    sizeLabel: {
      ...TYPOGRAPHY.captionBold,
      color: colors.textSecondary,
      fontSize: 12,
    },
    sizeLabelActive: {
      color: colors.primary,
    },
    priceLabel: {
      ...TYPOGRAPHY.caption,
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#07090E',
      borderRadius: RADIUS.full,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    stepBtn: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },
    stepBtnDisabled: {
      opacity: 0.3,
    },
    qtyText: {
      ...TYPOGRAPHY.captionBold,
      color: colors.text,
      fontSize: 12,
      minWidth: 16,
      textAlign: 'center',
    },
    totalBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      marginTop: SPACING.xs,
      marginBottom: SPACING.sm,
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.3)',
    },
    totalLabel: {
      ...TYPOGRAPHY.captionBold,
      color: colors.textMuted,
      fontSize: 10,
      letterSpacing: 0.8,
    },
    itemCountText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    totalAmount: {
      ...TYPOGRAPHY.h2,
      color: colors.primary,
      fontSize: 18,
      fontWeight: '800',
    },
  });
