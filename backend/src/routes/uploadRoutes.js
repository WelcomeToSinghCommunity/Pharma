import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadThumbnail, uploadMaterial } from '../services/supabaseStorageService.js';
import { uploadVideo } from '../services/bunnyStreamService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the local temp upload directory exists inside the workspace
const tempUploadDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const router = express.Router();

// Configure multer for memory storage (for small files like thumbnails and PDFs)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Configure multer for disk storage (for large files like videos, to save RAM)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `temp-video-${uniqueSuffix}${ext}`);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB video size limit
  },
});

// ============================================
// SUPABASE STORAGE UPLOADS (thumbnails, PDFs, images) & BUNNY.NET (videos)
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
    
    // Pass the absolute path of the uploaded file on disk to Bunny Stream service
    const result = await uploadVideo(req.file.path, lessonTitle);
    
    // Delete the temporary file from local disk to free space immediately
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete temporary video file:', err);
    });

    res.json({ 
      playbackUrl: result.playbackUrl, 
      videoId: result.videoId,
      url: result.url 
    });
  } catch (error) {
    console.error('Video upload error:', error);
    
    // Attempt cleanup if file exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to cleanup temporary video file:', err);
      });
    }
    
    res.status(500).json({ error: error.message || 'Failed to upload video' });
  }
});


export default router;
