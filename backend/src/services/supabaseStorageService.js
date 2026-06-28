import { supabase } from '../config/supabaseStorage.js';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB (Supabase free tier limit)

/**
 * Upload a file to Supabase Storage
 */
async function uploadFile(bucket, file, folder = '') {
  if (!supabase) {
    throw new Error('Supabase Storage is not configured');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop();
  const fileName = `${folder}${timestamp}-${randomString}.${extension}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return {
    path: data.path,
    url: publicUrl,
  };
}

/**
 * Upload thumbnail image
 */
async function uploadThumbnail(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
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
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
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
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
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
 * Delete file from Supabase Storage
 */
async function deleteFile(bucket, path) {
  if (!supabase) {
    throw new Error('Supabase Storage is not configured');
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
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
