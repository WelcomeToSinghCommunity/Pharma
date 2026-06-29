import { supabase } from '../config/supabaseStorage.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB (Supabase free tier limit)

/**
 * Save a file locally as a fallback
 */
async function saveFileLocally(bucket, file, folder = '') {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads', bucket, folder);
    fs.mkdirSync(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalName = file.originalname || file.name || 'file';
    const extension = originalName.split('.').pop() || 'bin';
    const fileName = `${timestamp}-${randomString}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save buffer to file
    fs.writeFileSync(filePath, file.buffer);

    // Return the local URL and path
    const localUrl = `http://localhost:3001/uploads/${bucket}/${folder}${fileName}`;
    console.log(`Saved file locally to: ${filePath}`);
    
    return {
      path: `${folder}${fileName}`,
      url: localUrl,
    };
  } catch (err) {
    console.error('Local file save failed:', err);
    throw new Error(`Failed to save file locally: ${err.message}`);
  }
}

/**
 * Upload a file to Supabase Storage, with fallback to local disk
 */
async function uploadFile(bucket, file, folder = '') {
  if (!supabase) {
    console.warn('Supabase Storage is not configured. Falling back to local storage.');
    return saveFileLocally(bucket, file, folder);
  }

  const originalName = file.originalname || file.name || 'file';
  const extension = originalName.split('.').pop() || 'bin';
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `${folder}${timestamp}-${randomString}.${extension}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        upsert: true,
        contentType: file.mimetype || file.type,
      });

    if (error) {
      console.warn(`Supabase storage upload failed (${error.message}). Falling back to local storage.`);
      return saveFileLocally(bucket, file, folder);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      path: data.path,
      url: publicUrl,
    };
  } catch (err) {
    console.warn(`Supabase upload error: ${err.message}. Falling back to local storage.`);
    return saveFileLocally(bucket, file, folder);
  }
}

/**
 * Upload thumbnail image
 */
async function uploadThumbnail(file) {
  const mimeType = file.mimetype || file.type;
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('File size exceeds 5MB limit.');
  }

  return uploadFile('thumbnails', file, '');
}

/**
 * Upload document/material (PDF, PPT, DOC)
 */
async function uploadMaterial(file) {
  const mimeType = file.mimetype || file.type;
  if (!ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
    throw new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, and PPTX files are allowed.');
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new Error('File size exceeds 10MB limit.');
  }

  return uploadFile('materials', file, '');
}

/**
 * Upload video
 */
async function uploadVideo(file, lessonTitle) {
  const mimeType = file.mimetype || file.type;
  if (!ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    throw new Error('Invalid file type. Only MP4, WebM, and OGG videos are allowed.');
  }

  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error('File size exceeds 500MB limit.');
  }

  // Sanitize lesson title for folder name
  const sanitizedTitle = lessonTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return uploadFile('videos', file, `${sanitizedTitle}/`);
}

/**
 * Delete file from storage (both local and Supabase)
 */
async function deleteFile(bucket, filePath) {
  // Try deleting from local disk first
  try {
    const localPath = path.join(__dirname, '../../uploads', bucket, filePath);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      console.log(`Successfully deleted local file: ${localPath}`);
    }
  } catch (err) {
    console.warn(`Local file delete error: ${err.message}`);
  }

  if (!supabase) {
    return true;
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.warn(`Supabase delete failed: ${error.message}`);
    }
  } catch (err) {
    console.warn(`Supabase delete error: ${err.message}`);
  }

  return true;
}

/**
 * Delete thumbnail
 */
async function deleteThumbnail(path) {
  return deleteFile('thumbnails', path);
}

/**
 * Delete material
 */
async function deleteMaterial(path) {
  return deleteFile('materials', path);
}

/**
 * Delete video
 */
async function deleteVideo(path) {
  return deleteFile('videos', path);
}

export {
  uploadThumbnail,
  uploadMaterial,
  uploadVideo,
  deleteThumbnail,
  deleteMaterial,
  deleteVideo,
};
