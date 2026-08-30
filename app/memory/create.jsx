import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image as RNImage,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Camera,
  Video,
  Zap,
  ZapOff,
  SwitchCamera,
  RotateCcw,
  Image as ImageIcon,
  Film,
  Users,
  Utensils,
  Sparkles,
  Trash2,
  Check,
  ArrowLeft,
  Flashlight,
  Play,
  ZoomIn,
  ZoomOut,
} from 'lucide-react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import Rating from '../../components/ui/Rating';
import Chip from '../../components/ui/Chip';
import { mediaUploader } from '../../services/media/mediaUploader';
import { FALLBACK_MOVIES, getImageUri } from '../../services/tmdb';
import { useMovieCatalog } from '../../hooks/useMovieCatalog';
import APP_CONFIG from '../../constants/config';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useContacts } from '../../hooks/useContacts';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { goBack } from '../../lib/navigation';

const EXPERIENCE_TYPES = [
  'IMAX Laser 3D',
  'IMAX 70mm Film',
  'Dolby Cinema',
  '4DX Motion',
  'VIP Recliner',
  'Standard',
];

const FLASH_MODES = ['off', 'on', 'auto'];

const ZOOM_STEP = 0.1;
const MAX_PHOTO_SIZE_MB = 20;
const MAX_VIDEO_SIZE_MB = 50;
const MB = 1024 * 1024;
const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic'];
const VIDEO_EXTENSIONS = ['mp4', 'mov'];
const FOCUS_RETICLE_SIZE = 48;
const FOCUS_RETICLE_MS = 900;

function VideoPreview({ uri }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (Platform.OS === 'web') {
    return <video src={uri} controls playsInline style={styles.previewWebVideo} />;
  }
  return (
    <View style={styles.previewMedia}>
      <RNImage source={{ uri }} style={styles.previewMedia} resizeMode="cover" />
      <View style={styles.videoPlayOverlay}>
        <View style={styles.videoPlayBadge}>
          <Play size={18} color="#FFFFFF" strokeWidth={2.2} fill="#FFFFFF" />
        </View>
        <Text style={styles.videoPlaybackNote}>Real playback requires the video player.</Text>
      </View>
    </View>
  );
}

export default function CreateMemoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaMode, setMediaMode] = useState('photo');
  const cameraRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const hintTimerRef = useRef(null);
  const cameraSurfaceDims = useRef(null);
  const focusReticleAnim = useRef(new Animated.Value(0));
  const [zoom, setZoom] = useState(0);
  const [torchActive, setTorchActive] = useState(false);
  const [focusPoint, setFocusPoint] = useState(null);
  const [focusHintVisible, setFocusHintVisible] = useState(false);

  // Captured media
  const [photoUri, setPhotoUri] = useState(null);
  const [videoUri, setVideoUri] = useState(null);

  // Form state
  const [selectedMovie, setSelectedMovie] = useState(APP_CONFIG.DEMO_MODE ? FALLBACK_MOVIES[0] : null);
  const [cinemaName, setCinemaName] = useState(params.cinemaName ? String(params.cinemaName) : '');
  const [experienceType, setExperienceType] = useState(params.screenType ? String(params.screenType) : 'IMAX Laser 3D');
  const [rating, setRating] = useState(5);
  const [story, setStory] = useState('');
  const [favoriteMoment, setFavoriteMoment] = useState('');
  const [snackHighlight, setSnackHighlight] = useState('');
  const [selectedCompanions, setSelectedCompanions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const addMemory = useMemoryStore((s) => s.addMemory);
  const { contacts } = useContacts();
  const { snapshot: catalog } = useMovieCatalog();
  const movieOptions = APP_CONFIG.DEMO_MODE ? FALLBACK_MOVIES : catalog.movies;

  useEffect(() => {
    if (!selectedMovie && catalog.movies && catalog.movies.length > 0) {
      setSelectedMovie(catalog.movies[0]);
    }
  }, [catalog.movies]);

  useEffect(() => {
    if (params.movieTitle) {
      const match = movieOptions.find(
        (m) =>
          m.title.toLowerCase() === params.movieTitle.toLowerCase() ||
          String(m.id) === String(params.movieId)
      );
      if (match) {
        setSelectedMovie(match);
      } else {
        setSelectedMovie({
          id: params.movieId || null,
          title: params.movieTitle,
          poster_path: params.posterPath || null,
        });
      }
    }
    if (params.cinema) {
      setCinemaName(params.cinema);
    }
    if (params.format) {
      setExperienceType(params.format);
    }
  }, [params]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  const cycleFlash = () => {
    const idx = FLASH_MODES.indexOf(flashMode);
    setFlashMode(FLASH_MODES[(idx + 1) % FLASH_MODES.length]);
  };

  const flipCamera = () => {
    setCameraFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const closeCamera = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setCameraActive(false);
    setZoom(0);
    setTorchActive(false);
    setFocusPoint(null);
    setFocusHintVisible(false);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(1, Math.round((z + ZOOM_STEP) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0, Math.round((z - ZOOM_STEP) * 10) / 10));
  };

  const handleToggleTorch = () => {
    setTorchActive((prev) => !prev);
  };

  const handleTapToFocus = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    const dims = cameraSurfaceDims.current;
    const clamp = (v, max) =>
      Math.min(Math.max(v, FOCUS_RETICLE_SIZE / 2), max - FOCUS_RETICLE_SIZE / 2);
    const x = dims ? clamp(locationX, dims.width) : locationX;
    const y = dims ? clamp(locationY, dims.height) : locationY;
    setFocusPoint({ x, y, ts: Date.now() });
    setFocusHintVisible(true);
    focusReticleAnim.current.setValue(0);
    Animated.sequence([
      Animated.timing(focusReticleAnim.current, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(FOCUS_RETICLE_MS - 360),
      Animated.timing(focusReticleAnim.current, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setFocusPoint(null));
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setFocusHintVisible(false), 1600);
  };

  const validateGalleryAsset = (asset) => {
    const isVideo = asset.type === 'video';
    const uriPath = String(asset.uri || '').toLowerCase();
    const fileName = String(asset.fileName || uriPath.split('/').pop() || '').toLowerCase();
    const ext = fileName.includes('.') ? fileName.split('.').pop() : '';
    const allowedPhoto = ext ? PHOTO_EXTENSIONS.includes(ext) : true;
    const allowedVideo = ext ? VIDEO_EXTENSIONS.includes(ext) : true;
    if (isVideo && !allowedVideo) {
      Alert.alert('Invalid Format', 'Please pick a supported video file (mp4 or mov).');
      return false;
    }
    if (!isVideo && !allowedPhoto) {
      Alert.alert('Invalid Format', 'Please pick a supported photo (jpg, png or heic).');
      return false;
    }
    const maxBytes = (isVideo ? MAX_VIDEO_SIZE_MB : MAX_PHOTO_SIZE_MB) * MB;
    if (asset.fileSize != null && asset.fileSize > maxBytes) {
      Alert.alert(
        'File Too Large',
        isVideo
          ? `Videos must be smaller than ${MAX_VIDEO_SIZE_MB} MB.`
          : `Photos must be smaller than ${MAX_PHOTO_SIZE_MB} MB.`
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setVideoUri(null);
        closeCamera();
      }
    } catch {
      Alert.alert('Camera Error', 'Failed to capture photo.');
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
        closeCamera();
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
        Alert.alert('Camera Required', 'Please allow camera access to capture theater memories.');
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (!validateGalleryAsset(asset)) return;
        if (asset.type === 'video') {
          setVideoUri(asset.uri);
          setPhotoUri(null);
        } else {
          setPhotoUri(asset.uri);
          setVideoUri(null);
        }
      }
    } catch {
      Alert.alert('Gallery Error', 'Failed to pick media.');
    }
  };

  const handleSaveMemory = async () => {
    if (!story.trim() && !favoriteMoment.trim() && !photoUri && !videoUri) {
      Alert.alert('Incomplete Memory', 'Please add a photo, story, or highlight to save your memory.');
      return;
    }

    setIsSaving(true);
    try {
      let finalMediaUrl = photoUri;
      if (photoUri) {
        const uploadResult = await mediaUploader.uploadMedia(photoUri, 'photo');
        finalMediaUrl = uploadResult.url;
      }

      let finalVideoUrl = videoUri;
      if (videoUri) {
        const uploadResult = await mediaUploader.uploadMedia(videoUri, 'video');
        finalVideoUrl = uploadResult.url;
      }

      await addMemory({
        movie: selectedMovie
          ? { id: selectedMovie.id, title: selectedMovie.title, poster_path: selectedMovie.poster_path }
          : {
              id: null,
              title: cinemaName.trim() ? `Screening at ${cinemaName.trim()}` : 'Untitled Screening',
              poster_path: null,
            },
        cinemaName: cinemaName.trim() || (selectedMovie ? 'Cinema' : ''),
        experienceType,
        rating,
        story: story.trim(),
        favoriteMoment: favoriteMoment.trim(),
        snackHighlight: snackHighlight.trim(),
        photoUri: finalMediaUrl || (selectedMovie.poster_path ? getImageUri(selectedMovie.poster_path, 'w780') : null),
        videoUri: finalVideoUrl,
        watchedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        companions: selectedCompanions,
      });

      setIsSaving(false);
      Alert.alert('Memory Logged! 🎬', 'Your theatrical experience has been saved to your Journal.', [
        { text: 'View Journal', onPress: () => goBack(router, '/(tabs)/memories') },
      ]);
    } catch (err) {
      setIsSaving(false);
      Alert.alert('Error', err.message || 'Failed to save memory.');
    }
  };

  const styles = createStyles(colors);

  if (cameraActive) {
    return (
      <SafeAreaView style={styles.cameraSafeArea}>
        <CameraView
          ref={cameraRef}
          style={styles.cameraView}
          facing={cameraFacing}
          flash={Platform.OS === 'web' && torchActive ? 'torch' : flashMode}
          enableTorch={torchActive}
          zoom={zoom}
          autofocus="on"
          mode={mediaMode === 'video' ? 'video' : 'picture'}
        >
          <TouchableOpacity
            style={styles.cameraTouchSurface}
            activeOpacity={1}
            onPress={handleTapToFocus}
            onLayout={(e) => {
              cameraSurfaceDims.current = e.nativeEvent.layout;
            }}
            accessibilityLabel="Tap camera preview to focus"
          />
          {/* Top Camera Controls */}
          <View style={styles.cameraTopBar}>
            <IconButton
              icon="X"
              variant="surface"
              onPress={closeCamera}
              accessibilityLabel="Exit camera"
            />

            <View style={styles.topRightCameraControls}>
              <IconButton
                icon={flashMode === 'off' ? 'ZapOff' : 'Zap'}
                variant="surface"
                onPress={cycleFlash}
                accessibilityLabel={`Flash: ${flashMode}`}
                style={{ marginRight: SPACING.sm }}
              />
              <IconButton
                icon="Flashlight"
                variant={torchActive ? 'primary' : 'surface'}
                onPress={handleToggleTorch}
                accessibilityLabel={torchActive ? 'Torch on, tap to turn off' : 'Torch off, tap to turn on'}
                style={{ marginRight: SPACING.sm }}
              />
              <IconButton
                icon="SwitchCamera"
                variant="surface"
                onPress={flipCamera}
                accessibilityLabel="Flip camera"
              />
            </View>
          </View>

          {/* Mode Switcher: Photo vs Video */}
          <View style={styles.cameraModeBar}>
            <TouchableOpacity
              onPress={() => setMediaMode('photo')}
              style={[styles.mediaModeTab, mediaMode === 'photo' && styles.mediaModeTabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: mediaMode === 'photo' }}
            >
              <Text style={[styles.mediaModeText, mediaMode === 'photo' && styles.mediaModeTextActive]}>
                PHOTO
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMediaMode('video')}
              style={[styles.mediaModeTab, mediaMode === 'video' && styles.mediaModeTabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: mediaMode === 'video' }}
            >
              <Text style={[styles.mediaModeText, mediaMode === 'video' && styles.mediaModeTextActive]}>
                VIDEO
              </Text>
            </TouchableOpacity>
          </View>

          {/* Zoom Controls */}
          <View style={styles.zoomControls}>
            <IconButton
              icon="ZoomIn"
              variant="surface"
              onPress={handleZoomIn}
              disabled={zoom >= 1}
              accessibilityLabel="Zoom in"
            />
            <IconButton
              icon="ZoomOut"
              variant="surface"
              onPress={handleZoomOut}
              disabled={zoom <= 0}
              style={{ marginTop: SPACING.sm }}
              accessibilityLabel="Zoom out"
            />
          </View>

          {/* Focus Reticle + Hint */}
          {focusPoint ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.focusReticle,
                {
                  left: focusPoint.x - FOCUS_RETICLE_SIZE / 2,
                  top: focusPoint.y - FOCUS_RETICLE_SIZE / 2,
                  opacity: focusReticleAnim.current.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                  transform: [
                    {
                      scale: focusReticleAnim.current.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ) : null}

          {focusHintVisible ? (
            <View style={styles.focusHint} pointerEvents="none">
              <Text style={styles.focusHintText}>Tap to focus</Text>
            </View>
          ) : null}

          {/* Bottom Shutter Action */}
          <View style={styles.cameraBottomBar}>
            {mediaMode === 'photo' ? (
              <TouchableOpacity
                style={styles.shutterBtn}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Take photo"
              >
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.shutterBtn, isRecording && styles.shutterBtnRecording]}
                onPress={isRecording ? handleStopRecording : handleStartRecording}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
              >
                <View style={[styles.shutterInner, isRecording && styles.shutterInnerSquare]} />
              </TouchableOpacity>
            )}
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <IconButton
          icon="ArrowLeft"
          variant="surface"
          onPress={() => goBack(router, '/(tabs)/memories')}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Log Theatrical Memory</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* 1. MEDIA PICKER / PREVIEW */}
          <View style={styles.mediaCard}>
            {photoUri || videoUri ? (
              <View style={styles.previewContainer}>
                {videoUri ? (
                  <VideoPreview uri={videoUri} />
                ) : (
                  <RNImage source={{ uri: photoUri }} style={styles.previewMedia} resizeMode="cover" />
                )}
                <View style={styles.previewOverlay}>
                  <Button
                    title="Retake"
                    icon="RotateCcw"
                    variant="surface"
                    size="sm"
                    onPress={handleOpenCamera}
                    accessibilityLabel="Retake photo"
                  />
                  <IconButton
                    icon="Trash2"
                    variant="danger"
                    size={18}
                    onPress={() => {
                      setPhotoUri(null);
                      setVideoUri(null);
                    }}
                    accessibilityLabel="Remove photo"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.mediaPickerOptions}>
                <TouchableOpacity
                  style={styles.pickerTile}
                  onPress={handleOpenCamera}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Open camera to take photo or video"
                >
                  <Camera size={22} color={colors.primary} strokeWidth={2.2} />
                  <Text style={styles.pickerTileTitle}>Take Theater Photo / Video</Text>
                  <Text style={styles.pickerTileSub}>Capture the marquee, lobby or ticket stub</Text>
                </TouchableOpacity>

                <View style={styles.galleryButtonWrap}>
                  <Button
                    title="Choose from Gallery"
                    icon="Image"
                    variant="surface"
                    size="md"
                    onPress={handlePickFromGallery}
                    accessibilityLabel="Pick image from photo gallery"
                  />
                </View>
              </View>
            )}
          </View>

          {/* 2. CHOOSE MOVIE */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>MOVIE WATCHED</Text>
            {movieOptions.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
                {movieOptions.map((movie) => {
                  const isSelected = selectedMovie && selectedMovie.id === movie.id;
                  return (
                    <Chip
                      key={movie.id}
                      label={movie.title}
                      selected={isSelected}
                      onPress={() => setSelectedMovie(movie)}
                      accessibilityLabel={`Select movie ${movie.title}`}
                    />
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.emptyMoviesText}>
                No verified movies are available to attach right now. You can still log the memory below.
              </Text>
            )}
          </View>

          {/* 3. CINEMA & FORMAT */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>THEATER FORMAT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
              {EXPERIENCE_TYPES.map((fmt) => (
                <Chip
                  key={fmt}
                  label={fmt}
                  selected={experienceType === fmt}
                  onPress={() => setExperienceType(fmt)}
                  accessibilityLabel={`Select format ${fmt}`}
                />
              ))}
            </ScrollView>

            <Text style={[styles.sectionHeading, { marginTop: SPACING.md }]}>THEATER NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., PVR IMAX Laser Grand Mall"
              placeholderTextColor={colors.textMuted}
              value={cinemaName}
              onChangeText={setCinemaName}
            />
          </View>

          {/* 4. RATING */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>YOUR RATING</Text>
            <Rating
              rating={rating}
              maxRating={5}
              onRatingChange={setRating}
              showNumeric={true}
              size={22}
            />
          </View>

          {/* 5. STORY & EXPERIENCE */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>AUDITORIUM VIBE & STORY</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="How was the crowd reaction, screen clarity, and sound immersion?"
              placeholderTextColor={colors.textMuted}
              value={story}
              onChangeText={setStory}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.sectionHeading, { marginTop: SPACING.md }]}>BEST MOMENT / HIGHLIGHT</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., The third act IMAX aspect ratio shift..."
              placeholderTextColor={colors.textMuted}
              value={favoriteMoment}
              onChangeText={setFavoriteMoment}
            />
          </View>

          {/* 6. COMPANIONS & SNACKS */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>CONCESSION SNACK</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Large Butter Popcorn + Cold Brew"
              placeholderTextColor={colors.textMuted}
              value={snackHighlight}
              onChangeText={setSnackHighlight}
            />
          </View>

          {/* 7. DOMINANT SAVE BUTTON */}
          <View style={styles.saveBtnWrap}>
            <Button
              title={isSaving ? "Saving Memory..." : "Save to Journal 🎬"}
              variant="primary"
              size="lg"
              loading={isSaving}
              onPress={handleSaveMemory}
              accessibilityLabel="Save theatrical memory"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  cameraSafeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraTouchSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  zoomControls: {
    position: 'absolute',
    right: SPACING.lg,
    top: '45%',
    zIndex: 20,
  },
  focusReticle: {
    position: 'absolute',
    width: FOCUS_RETICLE_SIZE,
    height: FOCUS_RETICLE_SIZE,
    borderRadius: FOCUS_RETICLE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
    zIndex: 15,
  },
  focusHint: {
    position: 'absolute',
    top: '12%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  focusHintText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    backgroundColor: 'rgba(7, 9, 14, 0.72)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    overflow: 'hidden',
  },
  cameraView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  topRightCameraControls: {
    flexDirection: 'row',
  },
  cameraModeBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  mediaModeTab: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  mediaModeTabActive: {
    backgroundColor: colors.primarySubtle,
  },
  mediaModeText: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: colors.textMuted,
  },
  mediaModeTextActive: {
    color: colors.primary,
  },
  cameraBottomBar: {
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },
  shutterBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterBtnRecording: {
    borderColor: colors.danger,
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
  },
  shutterInnerSquare: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.danger,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl * 2,
  },
  mediaCard: {
    margin: SPACING.lg,
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  previewContainer: {
    position: 'relative',
    height: 210,
  },
  previewMedia: {
    width: '100%',
    height: '100%',
  },
  previewWebVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.35)',
  },
  videoPlayBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(7, 9, 14, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaybackNote: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaPickerOptions: {
    padding: SPACING.lg,
  },
  pickerTile: {
    minHeight: 110,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    gap: 4,
  },
  pickerTileTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.text,
  },
  pickerTileSub: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
  },
  galleryButtonWrap: {
    marginTop: SPACING.md,
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionHeading: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: SPACING.sm,
  },
  horizontalChips: {
    flexDirection: 'row',
  },
  emptyMoviesText: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    ...TYPOGRAPHY.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtnWrap: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
});
