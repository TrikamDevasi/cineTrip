import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

/**
 * Reusable hook for media selection (gallery images/videos)
 * and camera media capture
 */
export const useMediaPicker = () => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickFromGallery = useCallback(async (options = {}) => {
    setError(null);
    setIsLoading(true);

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Gallery access denied. Please allow access in settings.');
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library in device settings.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect || [4, 3],
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: options.allowsMultipleSelection ?? false,
      });

      if (result.canceled) {
        setIsLoading(false);
        return null;
      }

      const asset = result.assets[0];
      setSelectedMedia(asset);
      setIsLoading(false);
      return asset;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, []);

  const pickVideoFromGallery = useCallback(() =>
    pickFromGallery({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    }), [pickFromGallery]);

  const clear = useCallback(() => {
    setSelectedMedia(null);
    setError(null);
  }, []);

  return {
    selectedMedia,
    isLoading,
    error,
    pickFromGallery,
    pickVideoFromGallery,
    clear,
  };
};
