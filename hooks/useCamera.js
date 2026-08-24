import { useState, useRef, useCallback, useEffect } from 'react';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';

/**
 * Reusable camera hook encapsulating camera state, flip, flash, zoom,
 * photo capture, and video recording timer with automatic resource cleanup.
 */
export const useCamera = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [zoom, setZoom] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const cameraRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const flip = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  const cycleFlash = useCallback(() => {
    const modes = ['off', 'on', 'auto'];
    setFlash((current) => {
      const idx = modes.indexOf(current);
      return modes[(idx + 1) % modes.length];
    });
  }, []);

  const takePhoto = useCallback(async (options = {}) => {
    if (!cameraRef.current) return null;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: options.quality ?? 0.85,
        base64: options.base64 ?? false,
      });
      return photo;
    } catch (err) {
      console.warn('takePhoto error:', err.message);
      throw err;
    }
  }, []);

  const startRecording = useCallback(async (options = {}) => {
    if (!cameraRef.current) return null;
    try {
      if (!micPermission?.granted) {
        await requestMicPermission();
      }
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);

      const video = await cameraRef.current.recordAsync({
        maxDuration: options.maxDuration ?? 60,
      });
      return video;
    } catch (err) {
      console.warn('startRecording error:', err.message);
      throw err;
    } finally {
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [micPermission, requestMicPermission]);

  const stopRecording = useCallback(() => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  }, [isRecording]);

  return {
    cameraRef,
    facing,
    flash,
    zoom,
    isRecording,
    recordingDuration,
    hasCameraPermission: cameraPermission?.granted ?? false,
    hasMicPermission: micPermission?.granted ?? false,
    requestCameraPermission,
    requestMicPermission,
    flip,
    cycleFlash,
    setZoom,
    takePhoto,
    startRecording,
    stopRecording,
  };
};
