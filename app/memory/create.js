import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image as RNImage,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  X,
  Camera,
  Video,
  Zap,
  ZapOff,
  SwitchCamera,
  RotateCcw,
  Image as ImageIcon,
  Star,
  User,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { FALLBACK_MOVIES } from '../../services/tmdb';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useContacts } from '../../hooks/useContacts';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

const EXPERIENCE_TYPES = [
  'IMAX Laser 3D',
  'IMAX 70mm Film',
  'Dolby Cinema',
  '4DX Motion',
  'VIP Recliner',
  'Standard',
];

const FLASH_MODES = ['off', 'on', 'auto'];

export default function CreateMemoryScreen() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [zoom, setZoom] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaMode, setMediaMode] = useState('photo'); // 'photo' | 'video'
  const cameraRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Captured media
  const [photoUri, setPhotoUri] = useState(null);
  const [videoUri, setVideoUri] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'photo' | 'video'

  // Form state
  const [selectedMovie, setSelectedMovie] = useState(FALLBACK_MOVIES[0]);
  const [cinemaName, setCinemaName] = useState('');
  const [experienceType, setExperienceType] = useState('IMAX Laser 3D');
  const [rating, setRating] = useState(5);
  const [story, setStory] = useState('');
  const [favoriteMoment, setFavoriteMoment] = useState('');
  const [snackHighlight, setSnackHighlight] = useState('');
  const [selectedCompanions, setSelectedCompanions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const addMemory = useMemoryStore((s) => s.addMemory);
  const { contacts } = useContacts();

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const cycleFlash = () => {
    const idx = FLASH_MODES.indexOf(flashMode);
    setFlashMode(FLASH_MODES[(idx + 1) % FLASH_MODES.length]);
  };

  const flipCamera = () => {
    setCameraFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setVideoUri(null);
        setMediaType('photo');
        setCameraActive(false);
      }
    } catch {
      Alert.alert('Camera Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleStartRecording = async () => {
    if (!cameraRef.current) return;
    try {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);

      const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
      if (video?.uri) {
        setVideoUri(video.uri);
        setPhotoUri(null);
        setMediaType('video');
        setCameraActive(false);
      }
    } catch {
      Alert.alert('Recording Error', 'Failed to record video.');
    } finally {
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const handleStopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  const handleOpenCamera = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Camera Required', 'Please allow camera access in settings.');
        return;
      }
    }
    if (mediaMode === 'video' && !micPermission?.granted) {
      await requestMicPermission();
    }
    setCameraActive(true);
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.type === 'video') {
          setVideoUri(asset.uri);
          setPhotoUri(null);
          setMediaType('video');
        } else {
          setPhotoUri(asset.uri);
          setVideoUri(null);
          setMediaType('photo');
        }
      }
    } catch (err) {
      Alert.alert('Gallery Error', err.message);
    }
  };

  const handleToggleCompanion = (companion) => {
    const exists = selectedCompanions.some((c) => c.name === companion.name);
    setSelectedCompanions(
      exists
        ? selectedCompanions.filter((c) => c.name !== companion.name)
        : [...selectedCompanions, companion]
    );
  };

  const handleSaveMemory = async () => {
    if (!story.trim() && !favoriteMoment.trim()) {
      Alert.alert('Add a Story', 'Please share a brief note or your favorite moment from this night.');
      return;
    }

    setIsSaving(true);
    const result = await addMemory({
      movie: selectedMovie,
      watchedDate: new Date().toISOString().split('T')[0],
      experienceType,
      cinemaName: cinemaName.trim(),
      rating,
      story: story.trim(),
      favoriteMoment: favoriteMoment.trim(),
      companions: selectedCompanions,
      snackHighlight: snackHighlight.trim(),
      photoUri: mediaType === 'photo' ? photoUri : null,
      videoUri: mediaType === 'video' ? videoUri : null,
    });
    setIsSaving(false);

    if (result.success) {
      Alert.alert(
        result.offline ? 'Saved Locally' : 'Memory Logged!',
        result.offline
          ? 'Your memory has been saved locally. It will sync when you are back online.'
          : 'Your theatrical experience has been saved to your Cinephile Journal.',
        [{ text: 'View Journal', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Save Failed', result.error || 'Please try again.');
    }
  };

  const formatSeconds = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const displayUri = photoUri || videoUri;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Log Movie Night Memory</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close journal creation"
        >
          <X size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* MEDIA CAPTURE SECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Theatrical Snapshot</Text>
          <Text style={styles.sectionSubtitle}>
            Photo, video, or pick from gallery
          </Text>

          {/* Mode Selector */}
          {!cameraActive && !displayUri && (
            <View style={styles.modeRow}>
              {[
                { id: 'photo', label: 'Photo', icon: Camera },
                { id: 'video', label: 'Video', icon: Video },
              ].map((mode) => {
                const IconComp = mode.icon;
                const isSelected = mediaMode === mode.id;
                return (
                  <TouchableOpacity
                    key={mode.id}
                    style={[styles.modeBtn, isSelected && styles.modeBtnActive]}
                    onPress={() => setMediaMode(mode.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Capture mode: ${mode.label}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <IconComp
                      size={15}
                      color={isSelected ? '#07090E' : COLORS.primary}
                      strokeWidth={2}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.modeBtnText, isSelected && styles.modeBtnTextActive]}>
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {cameraActive ? (
            <View style={styles.cameraContainer}>
              {cameraPermission?.granted ? (
                <CameraView
                  style={styles.camera}
                  ref={cameraRef}
                  facing={cameraFacing}
                  flash={flashMode}
                  zoom={zoom}
                  mode={mediaMode}
                >
                  {/* Top controls */}
                  <View style={styles.camTopControls}>
                    <TouchableOpacity
                      style={styles.camControlBtn}
                      onPress={() => setCameraActive(false)}
                      accessibilityRole="button"
                      accessibilityLabel="Close camera"
                    >
                      <X size={20} color="#fff" strokeWidth={2} />
                    </TouchableOpacity>

                    {/* Flash */}
                    <TouchableOpacity
                      style={styles.camControlBtn}
                      onPress={cycleFlash}
                      accessibilityRole="button"
                      accessibilityLabel={`Toggle flash. Currently ${flashMode}`}
                    >
                      {flashMode === 'off' ? (
                        <ZapOff size={20} color="#fff" strokeWidth={2} />
                      ) : (
                        <Zap size={20} color={flashMode === 'on' ? COLORS.secondary : '#fff'} strokeWidth={2} />
                      )}
                    </TouchableOpacity>

                    {/* Flip */}
                    <TouchableOpacity
                      style={styles.camControlBtn}
                      onPress={flipCamera}
                      accessibilityRole="button"
                      accessibilityLabel="Switch front and rear camera"
                    >
                      <SwitchCamera size={20} color="#fff" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  {/* Recording timer */}
                  {isRecording && (
                    <View style={styles.recordingBadge}>
                      <View style={styles.recordingDot} />
                      <Text style={styles.recordingText}>{formatSeconds(recordingSeconds)}</Text>
                    </View>
                  )}

                  {/* Zoom slider */}
                  <View style={styles.zoomRow}>
                    {[0, 0.25, 0.5, 0.75, 1].map((z) => (
                      <TouchableOpacity key={z} onPress={() => setZoom(z)} style={styles.zoomBtn}>
                        <Text style={[styles.zoomBtnText, zoom === z && styles.zoomBtnTextActive]}>
                          {z === 0 ? '1x' : z === 0.25 ? '2x' : z === 0.5 ? '3x' : z === 0.75 ? '4x' : '5x'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Bottom shutter */}
                  <View style={styles.cameraControls}>
                    <View style={{ width: 44 }} />

                    {mediaMode === 'photo' ? (
                      <TouchableOpacity
                        style={styles.snapBtn}
                        onPress={handleTakePhoto}
                        accessibilityRole="button"
                        accessibilityLabel="Take photograph"
                      >
                        <View style={styles.snapBtnInner} />
                      </TouchableOpacity>
                    ) : isRecording ? (
                      <TouchableOpacity
                        style={styles.stopBtn}
                        onPress={handleStopRecording}
                        accessibilityRole="button"
                        accessibilityLabel="Stop recording video"
                      >
                        <View style={styles.stopBtnInner} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.recordBtn}
                        onPress={handleStartRecording}
                        accessibilityRole="button"
                        accessibilityLabel="Start recording video"
                      >
                        <View style={styles.recordBtnInner} />
                      </TouchableOpacity>
                    )}

                    <View style={{ width: 44 }} />
                  </View>
                </CameraView>
              ) : (
                <View style={styles.permissionBox}>
                  <Camera size={36} color={COLORS.textMuted} strokeWidth={1.8} />
                  <Text style={styles.permissionText}>Camera access required</Text>
                  <TouchableOpacity
                    style={styles.grantBtn}
                    onPress={requestCameraPermission}
                    accessibilityRole="button"
                    accessibilityLabel="Grant camera access"
                  >
                    <Text style={styles.grantBtnText}>Grant Access</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : displayUri ? (
            <View style={styles.previewContainer}>
              {mediaType === 'video' ? (
                <View style={styles.videoPreview}>
                  <Video size={40} color={COLORS.primary} strokeWidth={2} />
                  <Text style={styles.videoLabel}>Video recorded</Text>
                </View>
              ) : (
                <RNImage source={{ uri: displayUri }} style={styles.previewImage} resizeMode="cover" />
              )}
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => { setCameraActive(true); setPhotoUri(null); setVideoUri(null); }}
                  accessibilityRole="button"
                  accessibilityLabel="Retake photo or video"
                >
                  <RotateCcw size={14} color="#fff" strokeWidth={2} />
                  <Text style={styles.retakeText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => { setPhotoUri(null); setVideoUri(null); setMediaType(null); }}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo or video"
                >
                  <Trash2 size={14} color={COLORS.danger} strokeWidth={2} />
                  <Text style={[styles.retakeText, { color: COLORS.danger }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.mediaBtnsRow}>
              <TouchableOpacity
                style={styles.openCameraBtn}
                onPress={handleOpenCamera}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={mediaMode === 'video' ? 'Open camera to record video' : 'Open camera to take snapshot'}
              >
                {mediaMode === 'video' ? (
                  <Video size={26} color={COLORS.primary} strokeWidth={2} />
                ) : (
                  <Camera size={26} color={COLORS.primary} strokeWidth={2} />
                )}
                <Text style={styles.openCameraText}>
                  {mediaMode === 'video' ? 'Record Video' : 'Open Camera'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.galleryBtn}
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Choose from media gallery"
              >
                <ImageIcon size={24} color={COLORS.secondary} strokeWidth={2} />
                <Text style={[styles.openCameraText, { color: COLORS.secondary }]}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* MOVIE SELECTION */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Movie Watched</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.movieScroll}>
            {FALLBACK_MOVIES.map((m) => {
              const isSelected = selectedMovie?.id === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.movieChip, isSelected && styles.movieChipActive]}
                  onPress={() => setSelectedMovie(m)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select movie ${m.title}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.movieChipText, isSelected && styles.movieChipTextActive]}>
                    {m.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* EXPERIENCE & CINEMA */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Experience Format</Text>
          <View style={styles.optionsWrap}>
            {EXPERIENCE_TYPES.map((fmt) => {
              const isSelected = experienceType === fmt;
              return (
                <TouchableOpacity
                  key={fmt}
                  style={[styles.optionPill, isSelected && styles.optionPillActive]}
                  onPress={() => setExperienceType(fmt)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select format ${fmt}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.optionPillText, isSelected && styles.optionPillTextActive]}>
                    {fmt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Cinema / Theater Name</Text>
          <TextInput
            style={styles.textInput}
            value={cinemaName}
            onChangeText={setCinemaName}
            placeholder="e.g. PVR INOX Palladium Laser"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* RATING */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Theatrical Rating</Text>
          <View style={styles.starPicker}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setRating(s)}
                style={styles.starTouch}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${s} out of 5 stars`}
              >
                <Star
                  size={30}
                  color={COLORS.secondary}
                  fill={s <= rating ? COLORS.secondary : 'transparent'}
                  strokeWidth={1.8}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* STORY & HIGHLIGHTS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your Review & Theatrical Highlights</Text>

          <Text style={styles.inputLabel}>Auditorium Story & Crowd Vibe</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={story}
            onChangeText={setStory}
            placeholder="How was the crowd reaction, screen brightness, and sound bass?"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Favorite Scene / Moment</Text>
          <TextInput
            style={styles.textInput}
            value={favoriteMoment}
            onChangeText={setFavoriteMoment}
            placeholder="e.g. The sand worm ride or docking sequence"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Snacks & Refreshment Highlight</Text>
          <TextInput
            style={styles.textInput}
            value={snackHighlight}
            onChangeText={setSnackHighlight}
            placeholder="e.g. Caramel popcorn + Double espresso"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* COMPANIONS */}
        {contacts.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tag Companions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionsWrap}>
                {contacts.slice(0, 12).map((c) => {
                  const isSelected = selectedCompanions.some((item) => item.name === c.name);
                  return (
                    <TouchableOpacity
                      key={c.id || c.name}
                      style={[styles.companionChip, isSelected && styles.companionChipActive]}
                      onPress={() => handleToggleCompanion(c)}
                      accessibilityRole="button"
                      accessibilityLabel={`Tag companion: ${c.name}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <User size={12} color={isSelected ? '#07090E' : COLORS.primary} strokeWidth={2} style={{ marginRight: 4 }} />
                      <Text style={[styles.compName, isSelected && styles.compNameActive]}>
                        {c.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* SAVE BUTTON */}
        <TouchableOpacity
          style={[styles.saveMemoryBtn, isSaving && { opacity: 0.6 }]}
          onPress={handleSaveMemory}
          disabled={isSaving}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Save memory to cinephile journal"
        >
          {isSaving ? (
            <ActivityIndicator color="#07090E" size="small" />
          ) : (
            <>
              <Sparkles size={18} color="#07090E" strokeWidth={2.2} />
              <Text style={styles.saveMemoryBtnText}>Save Memory to Journal</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  scroll: { flex: 1 },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  sectionSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, marginBottom: 10 },

  // Mode row
  modeRow: { flexDirection: 'row', marginBottom: 10 },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: RADIUS.full, marginRight: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  modeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  modeBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  modeBtnTextActive: { color: '#07090E' },

  // Camera
  cameraContainer: { height: 320, borderRadius: RADIUS.md, overflow: 'hidden', marginTop: 8 },
  camera: { flex: 1 },
  camTopControls: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  camControlBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  recordingBadge: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, marginRight: 6 },
  recordingText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  zoomRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 6,
  },
  zoomBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  zoomBtnText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  zoomBtnTextActive: { color: COLORS.primary, fontWeight: '900' },
  cameraControls: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  snapBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  snapBtnInner: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#07090E' },
  recordBtn: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 4, borderColor: COLORS.danger,
    justifyContent: 'center', alignItems: 'center',
  },
  recordBtnInner: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.danger },
  stopBtn: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 4, borderColor: COLORS.danger,
    justifyContent: 'center', alignItems: 'center',
  },
  stopBtnInner: { width: 24, height: 24, borderRadius: 4, backgroundColor: COLORS.danger },
  permissionBox: {
    height: 200, backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  permissionText: { color: COLORS.textSecondary, fontSize: 13 },
  grantBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.sm },
  grantBtnText: { color: '#07090E', fontWeight: '800', fontSize: 12 },

  // Preview
  previewContainer: { marginTop: 8 },
  previewImage: { width: '100%', height: 200, borderRadius: RADIUS.md },
  videoPreview: {
    height: 160, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  videoLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  previewActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  retakeBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(7,9,14,0.8)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.xs, gap: 4,
  },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.xs, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', gap: 4,
  },
  retakeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Media buttons
  mediaBtnsRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  openCameraBtn: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, paddingVertical: 18, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: 'rgba(0,240,255,0.3)', borderStyle: 'dashed', gap: 6,
  },
  galleryBtn: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, paddingVertical: 18, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: 'rgba(255,184,0,0.3)', borderStyle: 'dashed', gap: 6,
  },
  openCameraText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  // Movie
  movieScroll: { marginTop: 8 },
  movieChip: {
    backgroundColor: COLORS.surface, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.sm, marginRight: 8, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  movieChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  movieChipText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  movieChipTextActive: { color: '#07090E' },

  // Options
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  optionPill: {
    backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: RADIUS.sm, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  optionPillActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  optionPillText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  optionPillTextActive: { color: '#07090E', fontWeight: '800' },

  // Stars
  starPicker: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 },
  starTouch: { padding: 6 },

  // Inputs
  inputLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 },
  textInput: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.sm,
    paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text,
    fontSize: 13, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  textArea: { height: 70 },

  // Companions
  companionChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: RADIUS.full, marginRight: 8, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  companionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  compName: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  compNameActive: { color: '#07090E', fontWeight: '800' },

  // Save
  saveMemoryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, marginHorizontal: SPACING.lg, marginTop: SPACING.lg,
    paddingVertical: 15, borderRadius: RADIUS.md, gap: 8, ...SHADOWS.glowCyan,
  },
  saveMemoryBtnText: { fontSize: 14, fontWeight: '900', color: '#07090E' },
});
