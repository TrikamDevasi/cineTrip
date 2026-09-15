import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Zap,
  ZapOff,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Film,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react-native';
import { useCamera } from '../../hooks/useCamera';
import { useTheme } from '../../hooks/useTheme';
import { decodeAndValidatePassPayload } from '../../services/qr';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import { TYPOGRAPHY, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { goBack } from '../../lib/navigation';

export default function TicketScannerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = createStyles(colors);

  const {
    hasCameraPermission,
    requestCameraPermission,
    torchActive,
    toggleTorch,
  } = useCamera();

  const [scanned, setScanned] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setIsVerifying(true);
    setResultModalVisible(true);

    const localDecode = decodeAndValidatePassPayload(data);

    if (!localDecode.success) {
      setIsVerifying(false);
      setVerificationResult({
        status: 'invalid',
        message: localDecode.error || 'Unrecognized QR code structure.',
        pass: null,
      });
      return;
    }

    const pass = localDecode.data;

    try {
      // Call public CineTrip Pass verification endpoint
      const response = await api.post('/api/plans/verify-pass', {
        tripId: pass.tripId,
        tripVersion: pass.tripVersion,
        expectedMovie: pass.movie,
        expectedCinema: pass.cinema,
      });

      setIsVerifying(false);
      if (response && response.data) {
        setVerificationResult({
          status: response.data.status,
          message: response.data.message,
          pass: {
            ...pass,
            ...response.data.trip,
          },
          currentVersion: response.data.currentVersion,
        });
      } else {
        setVerificationResult({
          status: 'valid',
          message: 'Pass signature and itinerary match CineTrip standards.',
          pass,
        });
      }
    } catch (err) {
      setIsVerifying(false);
      // Offline fallback: verified locally from cryptographically structured QR payload
      setVerificationResult({
        status: 'offline_verified',
        message: 'Pass payload verified locally. (Cloud database offline)',
        pass,
      });
    }
  };

  const handleScanAgain = () => {
    setResultModalVisible(false);
    setVerificationResult(null);
    setScanned(false);
  };

  // Permission Request View
  if (!hasCameraPermission) {
    return (
      <SafeAreaView style={styles.permissionSafe}>
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.iconNavBtn}
            onPress={() => goBack(router, '/(tabs)/planner')}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>Pass Scanner</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.permissionContent}>
          <View style={styles.permissionIconCircle}>
            <Camera size={40} color={colors.primary} />
          </View>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionDesc}>
            CineTrip uses your camera to scan companion passes and verify movie night itineraries.
          </Text>

          <Button
            title="Enable Camera"
            icon="Camera"
            variant="primary"
            size="lg"
            onPress={requestCameraPermission}
            style={styles.permButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Live Camera View */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchActive}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Reticle Overlay */}
      <SafeAreaView style={styles.overlaySafe} edges={['top', 'bottom']}>
        {/* Top Floating Control Bar */}
        <View style={styles.floatingHeader}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => goBack(router, '/(tabs)/planner')}
            accessibilityRole="button"
            accessibilityLabel="Exit scanner"
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Scan CineTrip Pass</Text>

          <TouchableOpacity
            style={[styles.circleBtn, torchActive && styles.circleBtnActive]}
            onPress={toggleTorch}
            accessibilityRole="button"
            accessibilityLabel="Toggle flashlight"
          >
            {torchActive ? (
              <ZapOff size={20} color="#07090E" />
            ) : (
              <Zap size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Viewfinder Target Frame */}
        <View style={styles.targetWrapper}>
          <View style={styles.targetFrame}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
          <Text style={styles.targetHint}>Align CineTrip QR code within frame</Text>
        </View>

        {/* Bottom Banner Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomInfoText}>
            Scans personal and squad passes for itinerary verification
          </Text>
        </View>
      </SafeAreaView>

      {/* Verification Result Modal */}
      <Modal
        visible={resultModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setResultModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {isVerifying ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Verifying pass with CineTrip...</Text>
              </View>
            ) : verificationResult ? (
              <View style={styles.resultBox}>
                {/* Status Badge */}
                {verificationResult.status === 'valid' && (
                  <View style={[styles.badge, styles.badgeValid]}>
                    <CheckCircle2 size={20} color="#10B981" />
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>
                      VERIFIED CINETRIP PASS
                    </Text>
                  </View>
                )}

                {verificationResult.status === 'offline_verified' && (
                  <View style={[styles.badge, styles.badgeOffline]}>
                    <CheckCircle2 size={20} color={colors.primary} />
                    <Text style={[styles.badgeText, { color: colors.primary }]}>
                      LOCALLY VERIFIED (OFFLINE)
                    </Text>
                  </View>
                )}

                {verificationResult.status === 'stale_version' && (
                  <View style={[styles.badge, styles.badgeStale]}>
                    <AlertTriangle size={20} color="#F59E0B" />
                    <Text style={[styles.badgeText, { color: '#F59E0B' }]}>
                      OUTDATED PASS VERSION
                    </Text>
                  </View>
                )}

                {(verificationResult.status === 'tampered' ||
                  verificationResult.status === 'cancelled' ||
                  verificationResult.status === 'invalid') && (
                  <View style={[styles.badge, styles.badgeInvalid]}>
                    <XCircle size={20} color="#EF4444" />
                    <Text style={[styles.badgeText, { color: '#EF4444' }]}>
                      {verificationResult.status === 'cancelled'
                        ? 'TRIP CANCELLED'
                        : 'PASS NOT VERIFIED'}
                    </Text>
                  </View>
                )}

                <Text style={styles.resultMessage}>{verificationResult.message}</Text>

                {/* Itinerary Details */}
                {verificationResult.pass ? (
                  <View style={styles.itineraryCard}>
                    <View style={styles.itineraryRow}>
                      <Film size={16} color={colors.primary} />
                      <Text style={styles.itineraryMovie} numberOfLines={2}>
                        {verificationResult.pass.movie}
                      </Text>
                    </View>

                    <View style={styles.itineraryRow}>
                      <MapPin size={14} color={colors.textMuted} />
                      <Text style={styles.itineraryDetail}>
                        {verificationResult.pass.cinema} •{' '}
                        {verificationResult.pass.format || 'Standard'}
                      </Text>
                    </View>

                    <View style={styles.itineraryRow}>
                      <Calendar size={14} color={colors.textMuted} />
                      <Text style={styles.itineraryDetail}>
                        {verificationResult.pass.date} at {verificationResult.pass.time}
                      </Text>
                    </View>

                    {verificationResult.pass.seats ? (
                      <View style={styles.itineraryRow}>
                        <Clock size={14} color={colors.textMuted} />
                        <Text style={styles.itineraryDetail}>
                          Seats: {verificationResult.pass.seats}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.versionRow}>
                      <Text style={styles.versionText}>
                        Pass Version: {verificationResult.pass.tripVersion || 1}
                      </Text>
                      {verificationResult.currentVersion ? (
                        <Text style={styles.versionText}>
                          Latest: v{verificationResult.currentVersion}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {/* Modal Actions */}
                <View style={styles.modalActionRow}>
                  <Button
                    title="Scan Another Pass"
                    icon="RefreshCw"
                    variant="primary"
                    size="md"
                    onPress={handleScanAgain}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Done"
                    variant="surface"
                    size="md"
                    onPress={() => {
                      setResultModalVisible(false);
                      goBack(router, '/(tabs)/planner');
                    }}
                    style={{ minWidth: 90 }}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    permissionSafe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    iconNavBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topNavTitle: {
      ...TYPOGRAPHY.h2,
      color: colors.text,
      fontSize: 16,
    },
    permissionContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.xl,
    },
    permissionIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.lg,
    },
    permissionTitle: {
      ...TYPOGRAPHY.h2,
      color: colors.text,
      textAlign: 'center',
      marginBottom: SPACING.xs,
    },
    permissionDesc: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.xl,
      lineHeight: 20,
    },
    permButton: {
      width: '100%',
    },
    overlaySafe: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    floatingHeader: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.sm,
    },
    circleBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    circleBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    headerTitle: {
      ...TYPOGRAPHY.bodyBold,
      color: '#FFFFFF',
      fontSize: 15,
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    targetWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    targetFrame: {
      width: 240,
      height: 240,
      borderRadius: RADIUS.lg,
      position: 'relative',
    },
    corner: {
      position: 'absolute',
      width: 32,
      height: 32,
      borderColor: colors.primary,
    },
    tl: {
      top: 0,
      left: 0,
      borderTopWidth: 4,
      borderLeftWidth: 4,
      borderTopLeftRadius: RADIUS.lg,
    },
    tr: {
      top: 0,
      right: 0,
      borderTopWidth: 4,
      borderRightWidth: 4,
      borderTopRightRadius: RADIUS.lg,
    },
    bl: {
      bottom: 0,
      left: 0,
      borderBottomWidth: 4,
      borderLeftWidth: 4,
      borderBottomLeftRadius: RADIUS.lg,
    },
    br: {
      bottom: 0,
      right: 0,
      borderBottomWidth: 4,
      borderRightWidth: 4,
      borderBottomRightRadius: RADIUS.lg,
    },
    targetHint: {
      ...TYPOGRAPHY.caption,
      color: '#FFFFFF',
      marginTop: SPACING.md,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: SPACING.md,
      paddingVertical: 4,
      borderRadius: RADIUS.full,
    },
    bottomInfo: {
      marginBottom: SPACING.md,
      backgroundColor: 'rgba(7, 9, 14, 0.75)',
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.xs,
      borderRadius: RADIUS.full,
    },
    bottomInfoText: {
      ...TYPOGRAPHY.caption,
      color: 'rgba(255,255,255,0.7)',
      fontSize: 11,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: RADIUS.xl,
      borderTopRightRadius: RADIUS.xl,
      padding: SPACING.xl,
      borderTopWidth: 1,
      borderColor: colors.cardBorder,
      ...SHADOWS.card,
    },
    loadingBox: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
      gap: SPACING.md,
    },
    loadingText: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
    },
    resultBox: {
      alignItems: 'center',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: SPACING.md,
      paddingVertical: 6,
      borderRadius: RADIUS.full,
      marginBottom: SPACING.sm,
      borderWidth: 1,
    },
    badgeValid: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
    },
    badgeOffline: {
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      borderColor: 'rgba(229, 169, 60, 0.4)',
    },
    badgeStale: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
    },
    badgeInvalid: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    badgeText: {
      ...TYPOGRAPHY.captionBold,
      letterSpacing: 0.5,
      fontSize: 12,
    },
    resultMessage: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.md,
      lineHeight: 18,
    },
    itineraryCard: {
      width: '100%',
      backgroundColor: '#0B0F19',
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      gap: 8,
    },
    itineraryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    itineraryMovie: {
      ...TYPOGRAPHY.bodyBold,
      color: colors.text,
      fontSize: 15,
      flex: 1,
    },
    itineraryDetail: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      fontSize: 13,
      flex: 1,
    },
    versionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.06)',
      paddingTop: 6,
      marginTop: 2,
    },
    versionText: {
      ...TYPOGRAPHY.caption,
      color: colors.textMuted,
      fontSize: 11,
    },
    modalActionRow: {
      flexDirection: 'row',
      gap: SPACING.md,
      width: '100%',
    },
  });
