import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Armchair, Check, Info } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

// Layout definition: 6 rows (A to F), 8 seats per row with an aisle in the middle (between seat 4 and 5)
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEATS_PER_ROW = 8;
const OCCUPIED_PRESETS = ['A3', 'A4', 'B5', 'C2', 'D4', 'D5', 'E1', 'E8']; // Deterministic occupied demo seats

export default function InteractiveSeatMap({
  selectedSeats = [],
  onSeatsChange,
  maxSeats = 6,
  ticketPrice = 350,
}) {
  const isSeatOccupied = (seatId) => OCCUPIED_PRESETS.includes(seatId);
  const isSeatSelected = (seatId) => selectedSeats.includes(seatId);

  const handleToggleSeat = (seatId) => {
    if (isSeatOccupied(seatId)) return;

    if (isSeatSelected(seatId)) {
      onSeatsChange(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= maxSeats) {
        return; // Exceeded maximum allowable seats
      }
      onSeatsChange([...selectedSeats, seatId]);
    }
  };

  const totalPrice = selectedSeats.length * ticketPrice;

  return (
    <View style={styles.container}>
      {/* Curved Screen Indicator */}
      <View style={styles.screenContainer}>
        <View style={styles.screenArc} />
        <Text style={styles.screenText}>ALL EYES ON SCREEN (IMAX LASER)</Text>
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
                  const isAisle = idx === 3; // Aisle after seat 4

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

      {/* Selected Summary Footer */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>
            {selectedSeats.length > 0
              ? `${selectedSeats.length} SEAT${selectedSeats.length > 1 ? 'S' : ''} SELECTED`
              : 'TAP SEATS TO SELECT'}
          </Text>
          <Text style={styles.summarySeats} numberOfLines={1}>
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'No seats chosen yet (Max 6)'}
          </Text>
        </View>

        {selectedSeats.length > 0 && (
          <View style={styles.summaryRight}>
            <Text style={styles.summaryPrice}>₹{totalPrice}</Text>
            <Text style={styles.summarySub}>Estimated Pass</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: SPACING.xs,
  },
  screenContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  screenArc: {
    width: '85%',
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 6,
  },
  screenText: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 1.2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: RADIUS.xs,
  },
  legendText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  gridScroll: {
    paddingVertical: SPACING.xs,
    justifyContent: 'center',
  },
  grid: {
    gap: SPACING.xs + 2,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  rowLabel: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    color: COLORS.textMuted,
    width: 16,
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
    borderRadius: RADIUS.xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  seatAvailable: {
    backgroundColor: COLORS.card,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  seatSelected: {
    backgroundColor: COLORS.primary,
    borderColor: '#FFFFFF',
  },
  seatOccupied: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  seatText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  seatTextSelected: {
    color: '#07090E',
    fontWeight: '900',
  },
  seatTextOccupied: {
    color: 'rgba(255, 255, 255, 0.15)',
  },
  aisleSpace: {
    width: 16,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  summaryLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  summaryLabel: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  summarySeats: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    marginTop: 2,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryPrice: {
    ...TYPOGRAPHY.h3,
    color: COLORS.secondary,
  },
  summarySub: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
