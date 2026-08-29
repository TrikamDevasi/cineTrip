/**
 * Cloud Media Uploader Abstraction
 * Handles image/video upload to cloud providers (Cloudinary / S3 / Supabase Storage)
 * with robust local fallback and upload status reporting.
 */

export class MediaUploader {
  constructor() {
    this.cloudinaryCloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || null;
    this.cloudinaryUploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET || null;
  }

  /**
   * Check whether real cloud storage is configured via environment variables
   */
  isCloudConfigured() {
    return Boolean(this.cloudinaryCloudName && this.cloudinaryUploadPreset);
  }

  /**
   * Upload media file
   * @param {string} localUri - Local file path from Camera or ImagePicker
   * @param {string} mediaType - 'photo' | 'video'
   * @param {Function} onProgress - Optional callback for upload percentage
   * @returns {Promise<Object>} { success: boolean, url: string, isCloud: boolean, error?: string }
   */
  async uploadMedia(localUri, mediaType = 'photo', onProgress) {
    if (!localUri) {
      return { success: false, error: 'No media URI provided' };
    }

    // If cloud credentials exist, perform real cloud upload
    if (this.isCloudConfigured()) {
      try {
        const formData = new FormData();
        const fileExt = localUri.split('.').pop() || (mediaType === 'video' ? 'mp4' : 'jpg');
        const filename = `cinetrip_${Date.now()}.${fileExt}`;

        formData.append('file', {
          uri: localUri,
          type: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
          name: filename,
        });
        formData.append('upload_preset', this.cloudinaryUploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/${mediaType === 'video' ? 'video' : 'image'}/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();
        if (data.secure_url) {
          return {
            success: true,
            url: data.secure_url,
            isCloud: true,
          };
        } else {
          throw new Error(data.error?.message || 'Cloudinary upload failed');
        }
      } catch (err) {
        console.warn('Cloud upload failed, falling back to local URI:', err.message);
        // Fallback gracefully to local URI
        return {
          success: true,
          url: localUri,
          isCloud: false,
          warning: 'Stored locally (Cloud service unreachable)',
        };
      }
    }

    // Honest fallback when cloud storage is not configured
    return {
      success: true,
      url: localUri,
      isCloud: false,
      note: 'Stored on device (Configure EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME for multi-device sync)',
    };
  }
}

export const mediaUploader = new MediaUploader();
export default mediaUploader;
