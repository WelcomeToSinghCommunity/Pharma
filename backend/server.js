import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/payments', paymentRoutes);

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
