import express from 'express';
import multer from 'multer';
import { uploadThumbnail, uploadMaterial, uploadVideo } from '../services/supabaseStorageService.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
  },
});

// Configure multer for video uploads (larger limit)
const videoStorage = multer.memoryStorage();
const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for videos (Supabase free tier)
  },
});

// ============================================
// SUPABASE STORAGE UPLOADS (thumbnails, PDFs, images, videos)
// ============================================

// Upload thumbnail
router.post('/thumbnail', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadThumbnail(req.file);
    res.json({ url: result.url, path: result.path });
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload thumbnail' });
  }
});

// Upload PDF/material
router.post('/material', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadMaterial(req.file);
    res.json({ url: result.url, path: result.path });
  } catch (error) {
    console.error('Material upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload material' });
  }
});

// Upload video
router.post('/video', videoUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const lessonTitle = req.body.title || req.file.originalname;
    const result = await uploadVideo(req.file, lessonTitle);
    res.json({ 
      playbackUrl: result.url, 
      videoId: result.path,
      url: result.url 
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload video' });
  }
});

export default router;
