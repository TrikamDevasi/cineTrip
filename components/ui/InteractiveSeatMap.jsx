import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Armchair, Check, Info } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 8;
const OCCUPIED_PRESETS = ['A3', 'A4', 'B5', 'C2', 'D4', 'D5', 'E1', 'E8'];

export default function InteractiveSeatMap({
  selectedSeats = [],
  onSeatsChange,
  maxSeats = 6,
  ticketPrice = 350,
  demo = false,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isSeatOccupied = (seatId) => OCCUPIED_PRESETS.includes(seatId);
  const isSeatSelected = (seatId) => selectedSeats.includes(seatId);

  const handleToggleSeat = (seatId) => {
    if (isSeatOccupied(seatId)) return;

    if (isSeatSelected(seatId)) {
      onSeatsChange(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= maxSeats) return;
      onSeatsChange([...selectedSeats, seatId]);
    }
  };

  const totalPrice = selectedSeats.length * ticketPrice;

  return (
    <View style={styles.container}>
      {demo && (
        <View style={styles.demoNotice}>
          <Info size={14} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.demoNoticeText}>
            DEMO SEAT LAYOUT — occupancy and pricing are illustrative, not live availability.
          </Text>
        </View>
      )}

      {/* Curved Screen Indicator */}
      <View style={styles.screenContainer}>
        <View style={styles.screenArc} />
        <Text style={styles.screenText}>SCREEN</Text>
      </View>

      {/* Seat Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatAvailable]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatSelected]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatOccupied]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
      </View>

      {/* Interactive Seating Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridScroll}>
        <View style={styles.grid}>
          {ROWS.map((row) => (
            <View key={row} style={styles.row}>
              <Text style={styles.rowLabel}>{row}</Text>
              
              <View style={styles.seatsRow}>
                {Array.from({ length: SEATS_PER_ROW }, (_, idx) => {
                  const seatNum = idx + 1;
                  const seatId = `${row}${seatNum}`;
                  const occupied = isSeatOccupied(seatId);
                  const selected = isSeatSelected(seatId);
                  const isAisle = idx === 3;

                  return (
                    <React.Fragment key={seatId}>
                      <TouchableOpacity
                        style={[
                          styles.seat,
                          occupied
                            ? styles.seatOccupied
                            : selected
                            ? styles.seatSelected
                            : styles.seatAvailable,
                        ]}
                        onPress={() => handleToggleSeat(seatId)}
                        disabled={occupied}
                        activeOpacity={0.7}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected, disabled: occupied }}
                        accessibilityLabel={`Row ${row}, Seat ${seatNum}, ${occupied ? 'Occupied' : selected ? 'Selected' : 'Available'}`}
                      >
                        <Text
                          style={[
                            styles.seatText,
                            selected && styles.seatTextSelected,
                            occupied && styles.seatTextOccupied,
                          ]}
                        >
                          {seatNum}
                        </Text>
                      </TouchableOpacity>
                      {isAisle && <View style={styles.aisleSpace} />}
                    </React.Fragment>
                  );
                })}
              </View>
              <Text style={styles.rowLabel}>{row}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Selected Seats & Pricing Summary Pill */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>
            {selectedSeats.length > 0
              ? `${selectedSeats.length} SEAT${selectedSeats.length > 1 ? 'S' : ''} SELECTED`
              : 'SELECT YOUR SEATS'}
          </Text>
          <Text style={styles.summarySeatsText} numberOfLines={1}>
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Tap seats in the grid above'}
          </Text>
        </View>

        <View style={styles.summaryRight}>
          <Text style={styles.priceLabel}>{demo ? 'EST. TOTAL (DEMO)' : 'EST. TOTAL'}</Text>
          <Text style={styles.priceValue}>₹{totalPrice}</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  demoNoticeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  screenContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  screenArc: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginBottom: 6,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(229, 169, 60, 0.8)',
      },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
      },
    }),
  },
  screenText: {
    ...TYPOGRAPHY.badge,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  gridScroll: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    ...TYPOGRAPHY.captionBold,
    color: colors.textMuted,
    width: 14,
    textAlign: 'center',
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seat: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  seatAvailable: {
    backgroundColor: colors.surface,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  seatSelected: {
    backgroundColor: colors.primary,
    borderColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  seatOccupied: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  seatText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  seatTextSelected: {
    color: '#07090E',
    fontWeight: '900',
  },
  seatTextOccupied: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  aisleSpace: {
    width: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  summaryLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  summaryLabel: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: colors.primary,
    marginBottom: 2,
  },
  summarySeatsText: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.text,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    ...TYPOGRAPHY.badge,
    fontSize: 9,
    color: colors.textMuted,
  },
  priceValue: {
    ...TYPOGRAPHY.h2,
    color: colors.text,
    fontWeight: '900',
  },
});
