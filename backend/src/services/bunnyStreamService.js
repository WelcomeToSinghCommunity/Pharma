import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const API_KEY = process.env.BUNNY_API_KEY;
const CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || 'vz-3efe159a-ff3.b-cdn.net';
const BASE_URL = 'https://video.bunnycdn.com';

if (!LIBRARY_ID || !API_KEY) {
  console.warn('WARNING: Bunny.net Stream library ID or API Key is missing in environment variables.');
}

/**
 * Create a video entry on Bunny.net and stream the file from disk
 * @param {string} filePath - Absolute path to the temporary video file on disk
 * @param {string} title - Title of the video
 * @returns {Promise<{videoId: string, playbackUrl: string, url: string}>}
 */
export async function uploadVideo(filePath, title) {
  try {
    const videoTitle = title || path.basename(filePath) || 'Untitled Video';
    
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Temporary file not found at: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Step 1: Create a video object "slot" on Bunny.net
    console.log(`[BunnyStream] Creating video slot for: "${videoTitle}" (${Math.round(fileSize / (1024 * 1024))} MB)`);
    const createResponse = await fetch(`${BASE_URL}/library/${LIBRARY_ID}/videos`, {
      method: 'POST',
      headers: {
        'AccessKey': API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({ title: videoTitle }),
    });

    const createData = await createResponse.json();
    if (!createResponse.ok) {
      throw new Error(createData.message || 'Failed to create video slot on Bunny.net');
    }

    const videoId = createData.guid;
    console.log(`[BunnyStream] Video slot created. ID: ${videoId}. Streaming binary to Bunny...`);

    // Step 2: Stream the actual video binary file using fs.createReadStream
    const fileStream = fs.createReadStream(filePath);
    const uploadResponse = await fetch(`${BASE_URL}/library/${LIBRARY_ID}/videos/${videoId}`, {
      method: 'PUT',
      headers: {
        'AccessKey': API_KEY,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileSize.toString(),
      },
      body: fileStream,
    });

    if (!uploadResponse.ok) {
      const uploadData = await uploadResponse.json().catch(() => ({}));
      throw new Error(uploadData.message || 'Failed to upload video binary to Bunny.net');
    }

    console.log(`[BunnyStream] Video upload successful for ID: ${videoId}`);

    const playbackUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`;
    const directUrl = `https://${CDN_HOSTNAME}/${videoId}/playlist.m3u8`;

    return {
      videoId,
      playbackUrl, // For iframe embed
      url: directUrl, // For direct HLS stream
    };
  } catch (error) {
    console.error('[BunnyStream] Upload Error:', error);
    throw new Error(`Bunny.net video upload failed: ${error.message}`);
  }
}

/**
 * Get video details/status from Bunny.net
 * @param {string} videoId - The video ID/guid
 * @returns {Promise<Object>}
 */
export async function getVideoDetails(videoId) {
  try {
    const response = await fetch(`${BASE_URL}/library/${LIBRARY_ID}/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'AccessKey': API_KEY,
        'accept': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get video details');
    }

    return data;
  } catch (error) {
    console.error('[BunnyStream] Details Error:', error);
    throw new Error(`Failed to get video details: ${error.message}`);
  }
}

/**
 * Delete a video from Bunny.net Stream library
 * @param {string} videoId - The video ID/guid
 * @returns {Promise<void>}
 */
export async function deleteVideo(videoId) {
  try {
    console.log(`[BunnyStream] Deleting video ID: ${videoId}`);
    const response = await fetch(`${BASE_URL}/library/${LIBRARY_ID}/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'AccessKey': API_KEY,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete video from Bunny.net');
    }
    
    console.log(`[BunnyStream] Successfully deleted video ID: ${videoId}`);
  } catch (error) {
    console.error('[BunnyStream] Delete Error:', error);
    throw new Error(`Failed to delete video from Bunny.net: ${error.message}`);
  }
}
