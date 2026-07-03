import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import courseRoutes from './src/routes/courseRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import commentRoutes from './src/routes/commentRoutes.js';
import reactionRoutes from './src/routes/reactionRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server for Socket.IO
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Make io globally available for routes
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join lesson-specific room for comments
  socket.on('join-lesson', (lessonId) => {
    socket.join(`lesson-${lessonId}`);
    console.log(`Socket ${socket.id} joined lesson-${lessonId}`);
  });

  // Leave lesson room
  socket.on('leave-lesson', (lessonId) => {
    socket.leave(`lesson-${lessonId}`);
    console.log(`Socket ${socket.id} left lesson-${lessonId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://nextgenpharma.vercel.app',
  'https://nextgenpharma.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, or local testing)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.indexOf(origin) !== -1 || 
      origin.startsWith('http://localhost') || 
      origin.startsWith('http://127.0.0.1') ||
      (origin.includes('nextgenpharma') && origin.endsWith('.vercel.app'))
    ) {
      return callback(null, true);
    }
    const msg = 'The CORS policy for this site does not allow access from origin: ' + origin;
    return callback(new Error(msg), false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads folder
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/payments', paymentRoutes);

// Announcement configuration routes
app.get('/api/announcement', (req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'announcement.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return res.json(JSON.parse(data));
    }
  } catch (err) {
    console.error('Error reading announcement.json:', err);
  }
  // Default fallback if file doesn't exist
  res.json({
    show: true,
    badge: "Notice",
    text: "🚀 GAMP 5 & CSA Validation Course is launching next week! Register early for 20% off.",
    linkText: "Learn More",
    linkUrl: "/courses",
    theme: "gradient-teal"
  });
});

app.post('/api/announcement', (req, res) => {
  try {
    const { show, badge, text, linkText, linkUrl, theme } = req.body;
    const filePath = path.join(process.cwd(), 'announcement.json');
    const config = { show, badge, text, linkText, linkUrl, theme };
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
    res.json({ success: true, config });
  } catch (err) {
    console.error('Error writing announcement.json:', err);
    res.status(500).json({ error: 'Failed to save announcement configuration' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

export { io };
