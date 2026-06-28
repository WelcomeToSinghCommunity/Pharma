import { s3, bucketName, publicUrl } from '../config/r2.js';
import { v4 as uuidv4 } from 'uuid';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_PDF_TYPES = ['application/pdf'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Upload a file to Cloudflare R2
 * @param {File} file - The file to upload
 * @param {string} folder - The folder path (e.g., 'thumbnails', 'materials', 'avatars')
 * @returns {Promise<{url: string, key: string}>}
 */
export async function uploadToR2(file, folder = 'uploads') {
  // Validate file type
  const fileType = file.mimetype || file.type;
  const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
  const isPdf = ALLOWED_PDF_TYPES.includes(fileType);
  const isDocument = ALLOWED_DOCUMENT_TYPES.includes(fileType);

  if (!isImage && !isPdf && !isDocument) {
    throw new Error('Invalid file type. Only images (JPEG, PNG, WebP, GIF) and PDFs are allowed.');
  }

  // Validate file size
  const fileSize = file.size || (file.buffer ? file.buffer.length : 0);
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 50MB limit.');
  }

  // Generate unique filename
  const fileExtension = fileType.split('/')[1] || 'bin';
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  const key = `${folder}/${uniqueFileName}`;

  // Prepare upload parameters
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer || file.data,
    ContentType: fileType,
    CacheControl: 'public, max-age=31536000', // 1 year cache
  };

  try {
    // Upload to R2
    const result = await s3.upload(params).promise();

    // Return public URL
    const url = `${publicUrl}/${key}`;
    
    return {
      url,
      key: result.Key,
      location: result.Location,
    };
  } catch (error) {
    console.error('R2 Upload Error:', error);
    throw new Error('Failed to upload file to Cloudflare R2.');
  }
}

/**
 * Delete a file from Cloudflare R2
 * @param {string} key - The file key
 * @returns {Promise<void>}
 */
export async function deleteFromR2(key) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('R2 Delete Error:', error);
    throw new Error('Failed to delete file from Cloudflare R2.');
  }
}

/**
 * Get a presigned URL for direct upload (for large files)
 * @param {string} fileName - The desired filename
 * @param {string} folder - The folder path
 * @param {string} fileType - The file MIME type
 * @returns {Promise<{url: string, key: string}>}
 */
export async function getPresignedUploadUrl(fileName, folder = 'uploads', fileType) {
  const fileExtension = fileType.split('/')[1] || 'bin';
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  const key = `${folder}/${uniqueFileName}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
    Expires: 3600, // 1 hour
  };

  try {
    const url = await s3.getSignedUrlPromise('putObject', params);
    return {
      url,
      key,
      publicUrl: `${publicUrl}/${key}`,
    };
  } catch (error) {
    console.error('Presigned URL Error:', error);
    throw new Error('Failed to generate presigned upload URL.');
  }
}

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean}
 */
export function validateFile(file, allowedTypes) {
  const fileType = file.mimetype || file.type;
  const fileSize = file.size || (file.buffer ? file.buffer.length : 0);

  if (!allowedTypes.includes(fileType)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 50MB limit.');
  }

  return true;
}
