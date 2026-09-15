import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
// expo-av may be unavailable in Expo Go — lazy-require guards the import
let Video = null;
let ResizeMode = null;
try {
  const av = require('expo-av');
  Video = av.Video;
  ResizeMode = av.ResizeMode;
} catch {}
import {
  Calendar,
  MapPin,
  Star,
  Sparkles,
  Users,
  Utensils,
  Video as VideoIcon,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  AlertCircle,
  Edit3,
  X,
} from 'lucide-react-native';
import FormatBadge from './FormatBadge';
import Rating from './ui/Rating';
import Button from './ui/Button';
import { useTheme } from '../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export default function MemoryCard({ memory, onDelete, onUpdate }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit memory state
  const [isEditing, setIsEditing] = useState(false);
  const [editStory, setEditStory] = useState(memory.story || '');
  const [editMoment, setEditMoment] = useState(memory.favoriteMoment || '');
  const [editSnack, setEditSnack] = useState(memory.snackHighlight || '');
  const [editRating, setEditRating] = useState(memory.rating || 5);
  const [editAuditorium, setEditAuditorium] = useState(memory.auditoriumRating || 5);
  const [editSound, setEditSound] = useState(memory.soundRating || 5);
  const [editScreen, setEditScreen] = useState(memory.screenRating || 5);
  const [editSeat, setEditSeat] = useState(memory.seat || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveEdit = async () => {
    if (!onUpdate) return;
    setIsUpdating(true);
    try {
      await onUpdate(memoryId, {
        story: editStory.trim(),
        favoriteMoment: editMoment.trim(),
        snackHighlight: editSnack.trim(),
        rating: editRating,
        personalRating: editRating,
        auditoriumRating: editAuditorium,
        soundRating: editSound,
        screenRating: editScreen,
        seat: editSeat.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      if (Platform.OS === 'web') {
        window.alert(err.message || 'Failed to update memory.');
      } else {
        Alert.alert('Error', err.message || 'Failed to update memory.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (!memory) return null;

  const movie = memory.movie || {};
  const rating = memory.rating || 5;
  const hasVideo = Boolean(memory.videoUri);
  const hasPhoto = Boolean(memory.photoUri);
  const memoryId = memory._id || memory.id;

  // Cleanup video when unmounting so audio doesn't linger
  useEffect(() => {
    return () => {
      if (videoRef.current && Platform.OS !== 'web') {
        videoRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const handlePlaybackStatusUpdate = useCallback((status) => {
    if (!status.isLoaded) {
      if (status.error) {
        setPlaybackError(true);
        setIsBuffering(false);
        setIsPlaying(false);
      }
      return;
    }

    setPlaybackError(false);
    setIsBuffering(status.isBuffering);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      setIsPlaying(false);
      videoRef.current?.setPositionAsync(0).catch(() => {});
    }
  }, []);

  const togglePlayback = async () => {
    if (Platform.OS === 'web') return; // Web uses native HTML5 controls
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        setPlaybackError(false);
        await videoRef.current.playAsync();
      }
    } catch {
      setPlaybackError(true);
    }
  };

  const handleRetryVideo = async () => {
    if (!videoRef.current || Platform.OS === 'web') return;
    setPlaybackError(false);
    setIsBuffering(true);
    try {
      await videoRef.current.replayAsync();
    } catch {
      setPlaybackError(true);
      setIsBuffering(false);
    }
  };

  const handleDeletePress = () => {
    if (!onDelete || !memoryId) return;

    const executeDelete = async () => {
      setIsDeleting(true);
      try {
        await onDelete(memoryId);
      } catch (err) {
        if (Platform.OS === 'web') {
          window.alert(err.message || 'Failed to delete memory.');
        } else {
          Alert.alert('Error', err.message || 'Failed to delete memory.');
        }
      } finally {
        setIsDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Delete this movie memory from your journal? This cannot be undone.'
      );
      if (confirmed) executeDelete();
    } else {
      Alert.alert(
        'Delete Memory',
        'Are you sure you want to remove this memory from your cinephile journal?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: executeDelete,
          },
        ]
      );
    }
  };

  return (
    <View style={styles.card}>
      {/* 1. HERO MEMORY MEDIA (INTERACTIVE VIDEO OR PHOTO / POSTER) */}
      {hasVideo ? (
        <View style={styles.videoContainer}>
          {Platform.OS === 'web' ? (
            <video
              src={memory.videoUri}
              controls
              playsInline
              poster={memory.photoUri || undefined}
              style={{
                width: '100%',
                height: 220,
                objectFit: 'cover',
                backgroundColor: '#07090E',
              }}
            />
          ) : (
            Video && ResizeMode ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={togglePlayback}
                style={styles.videoTouchContainer}
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? 'Pause video memory' : 'Play video memory'}
              >
                <Video
                  ref={videoRef}
                  source={{ uri: memory.videoUri }}
                  posterSource={memory.photoUri ? { uri: memory.photoUri } : undefined}
                  usePoster={Boolean(memory.photoUri)}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                  isLooping={false}
                  onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />

                {/* Play / Pause Interactive Overlay */}
                {!isPlaying && !isBuffering && !playbackError && (
                  <View style={styles.playOverlay}>
                    <View style={styles.playButtonCircle}>
                      <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
                    </View>
                  </View>
                )}

                {/* Buffering Spinner */}
                {isBuffering && (
                  <View style={styles.playOverlay}>
                    <View style={styles.bufferingCircle}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  </View>
                )}

                {/* Error State with Retry Button */}
                {playbackError && (
                  <View style={styles.errorOverlay}>
                    <AlertCircle size={22} color={colors.danger} />
                    <Text style={styles.errorText}>Video playback failed</Text>
                    <TouchableOpacity
                      onPress={handleRetryVideo}
                      style={styles.retryButton}
                      accessibilityRole="button"
                      accessibilityLabel="Retry video playback"
                    >
                      <RotateCcw size={13} color="#FFFFFF" />
                      <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              /* expo-av unavailable (Expo Go) — show poster + play icon placeholder */
              <View style={[styles.videoTouchContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                {memory.photoUri && (
                  <Image source={{ uri: memory.photoUri }} style={[styles.video, { opacity: 0.6 }]} resizeMode="cover" />
                )}
                <View style={styles.playButtonCircle}>
                  <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
                </View>
              </View>
            )
          )}

          <View style={styles.photoDateBadge}>
            <VideoIcon size={12} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.photoDateText}>
              Video Memory • {memory.watchedDate || 'Opening Night'}
            </Text>
          </View>
        </View>
      ) : hasPhoto ? (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: memory.photoUri }}
            style={styles.photo}
            resizeMode="cover"
          />
          <View style={styles.photoDateBadge}>
            <Calendar size={12} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.photoDateText}>{memory.watchedDate || 'Opening Night'}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.content}>
        {/* 2. HEADER: MOVIE TITLE & THEATER & DELETE OPTION */}
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.movieTitle} numberOfLines={1}>
              {movie.title || 'Theatrical Experience'}
            </Text>
            <View style={styles.cinemaRow}>
              <MapPin size={12} color={colors.primary} strokeWidth={2} />
              <Text style={styles.cinemaText} numberOfLines={1}>
                {memory.cinemaName || 'Certified IMAX Laser Auditorium'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            {/* Rating Pill */}
            <View style={styles.ratingBadge}>
              <Star size={12} color="#E5A93C" fill="#E5A93C" strokeWidth={1.5} />
              <Text style={styles.ratingText}>{rating}.0</Text>
            </View>

            {/* Edit Button */}
            {onUpdate && (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.actionIconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Edit memory"
              >
                <Edit3 size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            {/* Optional Delete Button */}
            {onDelete && (
              <TouchableOpacity
                onPress={handleDeletePress}
                disabled={isDeleting}
                style={styles.deleteButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Delete memory"
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.textMuted} />
                ) : (
                  <Trash2 size={15} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. FORMAT BADGES */}
        <View style={styles.formatRow}>
          <FormatBadge format={memory.experienceType || 'IMAX Laser'} size="small" />
        </View>

        {/* Multi-Dimensional Ratings Breakdown & Seat Tag */}
        {(memory.auditoriumRating || memory.soundRating || memory.screenRating || memory.seat) ? (
          <View style={styles.ratingsStrip}>
            {memory.screenRating ? (
              <View style={styles.dimPill}>
                <Text style={styles.dimPillText}>Screen: {memory.screenRating}★</Text>
              </View>
            ) : null}
            {memory.soundRating ? (
              <View style={styles.dimPill}>
                <Text style={styles.dimPillText}>Sound: {memory.soundRating}★</Text>
              </View>
            ) : null}
            {memory.auditoriumRating ? (
              <View style={styles.dimPill}>
                <Text style={styles.dimPillText}>Hall: {memory.auditoriumRating}★</Text>
              </View>
            ) : null}
            {memory.seat ? (
              <View style={[styles.dimPill, styles.seatPill]}>
                <Text style={styles.seatPillText}>Seat: {memory.seat}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* 4. SHORT JOURNAL STORY */}
        {memory.story ? (
          <Text style={styles.storyText}>{memory.story}</Text>
        ) : null}

        {/* 5. MEMORY HIGHLIGHT QUOTE */}
        {memory.favoriteMoment ? (
          <View style={styles.highlightBox}>
            <Sparkles size={14} color={colors.primary} strokeWidth={2} />
            <Text style={styles.highlightText} numberOfLines={2}>
              <Text style={styles.highlightBold}>Highlight: </Text>
              {memory.favoriteMoment}
            </Text>
          </View>
        ) : null}

        {/* 6. COMPANIONS & CONCESSIONS FOOTER */}
        {(memory.companions?.length > 0 || memory.snackHighlight) && (
          <View style={styles.footerRow}>
            {memory.companions && memory.companions.length > 0 && (
              <View style={styles.companionsRow}>
                <Users
                  size={12}
                  color={colors.textSecondary}
                  strokeWidth={2}
                  style={{ marginRight: 4 }}
                />
                {memory.companions.map((c, idx) => (
                  <View key={idx} style={styles.avatarTag}>
                    <Text style={styles.companionName}>{c.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {memory.snackHighlight ? (
              <View style={styles.snackRow}>
                <Utensils size={12} color={colors.primary} strokeWidth={2} />
                <Text style={styles.snackText} numberOfLines={1}>
                  {memory.snackHighlight}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* Edit Memory Modal */}
      <Modal
        visible={isEditing}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.editModalBackdrop}>
          <View style={styles.editModalCard}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Memory Details</Text>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.editFieldLabel}>OVERALL RATING (1–5)</Text>
              <Rating
                rating={editRating}
                maxRating={5}
                onRatingChange={setEditRating}
                showNumeric={true}
                size={18}
              />

              <Text style={styles.editFieldLabel}>AUDITORIUM RATING</Text>
              <Rating
                rating={editAuditorium}
                maxRating={5}
                onRatingChange={setEditAuditorium}
                showNumeric={true}
                size={18}
              />

              <Text style={styles.editFieldLabel}>SOUND RATING</Text>
              <Rating
                rating={editSound}
                maxRating={5}
                onRatingChange={setEditSound}
                showNumeric={true}
                size={18}
              />

              <Text style={styles.editFieldLabel}>SCREEN RATING</Text>
              <Rating
                rating={editScreen}
                maxRating={5}
                onRatingChange={setEditScreen}
                showNumeric={true}
                size={18}
              />

              <Text style={styles.editFieldLabel}>SEAT POSITION</Text>
              <TextInput
                style={styles.editTextInput}
                value={editSeat}
                onChangeText={setEditSeat}
                placeholder="e.g., Row E Seat 12"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.editFieldLabel}>AUDITORIUM VIBE / STORY</Text>
              <TextInput
                style={[styles.editTextInput, { minHeight: 60 }]}
                value={editStory}
                onChangeText={setEditStory}
                placeholder="How was the screening?"
                placeholderTextColor={colors.textMuted}
                multiline
              />

              <Text style={styles.editFieldLabel}>BEST MOMENT / HIGHLIGHT</Text>
              <TextInput
                style={styles.editTextInput}
                value={editMoment}
                onChangeText={setEditMoment}
                placeholder="Key moment or visual shift"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.editFieldLabel}>CONCESSION SNACK</Text>
              <TextInput
                style={styles.editTextInput}
                value={editSnack}
                onChangeText={setEditSnack}
                placeholder="e.g. Nachos and ICEE"
                placeholderTextColor={colors.textMuted}
              />

              <View style={styles.editActionsRow}>
                <Button
                  title="Cancel"
                  variant="surface"
                  size="sm"
                  onPress={() => setIsEditing(false)}
                />
                <Button
                  title={isUpdating ? "Saving..." : "Save Changes"}
                  variant="primary"
                  size="sm"
                  loading={isUpdating}
                  onPress={handleSaveEdit}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: RADIUS.lg,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      overflow: 'hidden',
      ...SHADOWS.card,
    },
    photoContainer: {
      width: '100%',
      height: 200,
      backgroundColor: colors.surface,
      position: 'relative',
    },
    videoContainer: {
      width: '100%',
      height: 220,
      backgroundColor: '#07090E',
      position: 'relative',
      overflow: 'hidden',
    },
    videoTouchContainer: {
      width: '100%',
      height: '100%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    playOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(7, 9, 14, 0.42)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButtonCircle: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: 'rgba(15, 23, 42, 0.82)',
      borderWidth: 2,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...SHADOWS.card,
    },
    bufferingCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      padding: SPACING.md,
    },
    errorText: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: RADIUS.full,
      marginTop: 4,
    },
    retryText: {
      ...TYPOGRAPHY.caption,
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 11,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    photoDateBadge: {
      position: 'absolute',
      bottom: SPACING.sm,
      left: SPACING.sm,
      backgroundColor: 'rgba(7, 9, 14, 0.82)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: RADIUS.full,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    photoDateText: {
      ...TYPOGRAPHY.caption,
      fontSize: 11,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    content: {
      padding: SPACING.lg,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    titleCol: {
      flex: 1,
      marginRight: SPACING.sm,
    },
    headerRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    movieTitle: {
      ...TYPOGRAPHY.h2,
      color: colors.text,
      marginBottom: 2,
    },
    cinemaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    cinemaText: {
      ...TYPOGRAPHY.caption,
      fontSize: 12,
      color: colors.textSecondary,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: RADIUS.full,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      gap: 4,
    },
    ratingText: {
      ...TYPOGRAPHY.badge,
      fontSize: 11,
      color: colors.text,
    },
    deleteButton: {
      padding: 4,
      borderRadius: RADIUS.xs,
    },
    formatRow: {
      flexDirection: 'row',
      marginBottom: SPACING.sm,
    },
    storyText: {
      ...TYPOGRAPHY.body,
      color: colors.text,
      lineHeight: 20,
      marginBottom: SPACING.sm,
    },
    highlightBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primarySubtle,
      borderRadius: RADIUS.xs,
      padding: SPACING.sm,
      gap: 6,
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.25)',
      marginBottom: SPACING.sm,
    },
    highlightText: {
      ...TYPOGRAPHY.caption,
      color: colors.text,
      flex: 1,
      lineHeight: 16,
    },
    highlightBold: {
      fontWeight: '800',
      color: colors.primary,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    companionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    avatarTag: {
      backgroundColor: colors.surface,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: RADIUS.xs,
      marginRight: 4,
    },
    companionName: {
      ...TYPOGRAPHY.caption,
      fontSize: 11,
      color: colors.textSecondary,
    },
    snackRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    snackText: {
      ...TYPOGRAPHY.caption,
      fontSize: 11,
      color: colors.textSecondary,
    },
    actionIconBtn: {
      padding: 6,
      borderRadius: RADIUS.full,
      backgroundColor: colors.surface,
      marginLeft: 4,
    },
    ratingsStrip: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 6,
      marginBottom: 6,
    },
    dimPill: {
      backgroundColor: '#0C111C',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: RADIUS.xs,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    dimPillText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    seatPill: {
      borderColor: 'rgba(229, 169, 60, 0.3)',
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
    },
    seatPillText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '700',
    },
    editModalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      justifyContent: 'center',
      padding: SPACING.lg,
    },
    editModalCard: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      maxHeight: '90%',
    },
    editModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
      paddingBottom: SPACING.sm,
    },
    editModalTitle: {
      ...TYPOGRAPHY.h2,
      color: colors.text,
      fontSize: 16,
    },
    editFieldLabel: {
      ...TYPOGRAPHY.captionBold,
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: SPACING.sm,
      marginBottom: 4,
    },
    editTextInput: {
      backgroundColor: '#090D16',
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: 8,
      color: colors.text,
      fontSize: 13,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    editActionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: SPACING.sm,
      marginTop: SPACING.lg,
    },
  });
