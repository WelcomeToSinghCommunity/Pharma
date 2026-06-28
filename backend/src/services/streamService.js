import { STREAM_API_BASE, STREAM_API_TOKEN } from '../config/stream.js';

/**
 * Upload a video to Cloudflare Stream
 * @param {File} file - The video file to upload
 * @param {Object} metadata - Video metadata (title, etc.)
 * @returns {Promise<{videoId: string, playbackUrl: string, thumbnailUrl: string}>}
 */
export async function uploadVideoToStream(file, metadata = {}) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add metadata
  if (metadata.title) {
    formData.append('metadata', JSON.stringify({ title: metadata.title }));
  }
  formData.append('max_duration_seconds', '7200'); // 2 hours max
  formData.append('require_signed_urls', 'false'); // Public videos

  try {
    const response = await fetch(`${STREAM_API_BASE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STREAM_API_TOKEN}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Failed to upload video');
    }

    const video = data.result;
    
    return {
      videoId: video.uid,
      playbackUrl: video.playback?.hls || video.playback?.dash,
      thumbnailUrl: video.thumbnail,
      readyToStream: video.readyToStream,
      duration: video.duration,
    };
  } catch (error) {
    console.error('Stream Upload Error:', error);
    throw new Error('Failed to upload video to Cloudflare Stream.');
  }
}

/**
 * Get video details from Cloudflare Stream
 * @param {string} videoId - The video ID
 * @returns {Promise<Object>}
 */
export async function getVideoDetails(videoId) {
  try {
    const response = await fetch(`${STREAM_API_BASE}/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STREAM_API_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Failed to get video details');
    }

    return data.result;
  } catch (error) {
    console.error('Stream Details Error:', error);
    throw new Error('Failed to get video details from Cloudflare Stream.');
  }
}

/**
 * Delete a video from Cloudflare Stream
 * @param {string} videoId - The video ID
 * @returns {Promise<void>}
 */
export async function deleteVideoFromStream(videoId) {
  try {
    const response = await fetch(`${STREAM_API_BASE}/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${STREAM_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.errors?.[0]?.message || 'Failed to delete video');
    }
  } catch (error) {
    console.error('Stream Delete Error:', error);
    throw new Error('Failed to delete video from Cloudflare Stream.');
  }
}

/**
 * Get a direct upload URL for large videos
 * @param {string} fileName - The desired filename
 * @param {number} maxDurationSeconds - Maximum video duration in seconds
 * @returns {Promise<{uploadUrl: string, videoId: string}>}
 */
export async function getDirectUploadUrl(fileName, maxDurationSeconds = 7200) {
  try {
    const response = await fetch(`${STREAM_API_BASE}?direct_user=true`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STREAM_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_duration_seconds: maxDurationSeconds,
        metadata: {
          title: fileName,
        },
        require_signed_urls: 'false',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Failed to get upload URL');
    }

    return {
      uploadUrl: data.result.uploadURL,
      videoId: data.result.uid,
    };
  } catch (error) {
    console.error('Direct Upload URL Error:', error);
    throw new Error('Failed to get direct upload URL from Cloudflare Stream.');
  }
}

/**
 * Validate video file before upload
 * @param {File} file - The video file to validate
 * @returns {boolean}
 */
export function validateVideoFile(file) {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  const maxSize = 2 * 1024 * 1024 * 1024; // 2GB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid video format. Allowed formats: MP4, WebM, MOV, AVI');
  }

  if (file.size > maxSize) {
    throw new Error('Video size exceeds 2GB limit.');
  }

  return true;
}
