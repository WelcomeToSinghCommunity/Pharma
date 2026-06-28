import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

// ============================================
// COMMENTS
// ============================================

// Get comments for a lesson
router.get('/lesson/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const comments = await prisma.comment.findMany({
      where: { lessonId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            isInstructor: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                isInstructor: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    // Check if current user liked each comment
    const userId = req.headers['x-user-id'];
    if (userId) {
      const commentIds = comments.map(c => c.id);
      const userLikes = await prisma.commentLike.findMany({
        where: {
          commentId: { in: commentIds },
          userId,
        },
      });

      const likedCommentIds = new Set(userLikes.map(l => l.commentId));
      
      comments.forEach(comment => {
        comment.isLikedByUser = likedCommentIds.has(comment.id);
      });
    }

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment
router.post('/', async (req, res) => {
  try {
    const { lessonId, userId, content } = req.body;

    if (!lessonId || !userId || !content) {
      return res.status(400).json({ error: 'lessonId, userId, and content are required' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        lessonId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            isInstructor: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.to(`lesson-${lessonId}`).emit('comment-created', comment);

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update comment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isPinned } = req.body;

    const comment = await prisma.comment.update({
      where: { id },
      data: {
        ...(content && { content }),
        ...(isPinned !== undefined && { isPinned }),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            isInstructor: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.to(`lesson-${comment.lessonId}`).emit('comment-updated', comment);

    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    await prisma.comment.delete({ where: { id } });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.to(`lesson-${comment.lessonId}`).emit('comment-deleted', { id });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ============================================
// REPLIES
// ============================================

// Get replies for a comment
router.get('/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;

    const replies = await prisma.reply.findMany({
      where: { commentId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            isInstructor: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(replies);
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

// Create reply
router.post('/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content are required' });
    }

    // Get comment to emit socket event
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const reply = await prisma.reply.create({
      data: {
        commentId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            isInstructor: true,
          },
        },
      },
    });

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.to(`lesson-${comment.lessonId}`).emit('reply-created', reply);

    res.status(201).json(reply);
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Update reply
router.put('/replies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const reply = await prisma.reply.update({
      where: { id },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            isInstructor: true,
          },
        },
      },
    });

    // Get comment to emit socket event
    const comment = await prisma.comment.findUnique({ where: { id: reply.commentId } });
    if (comment) {
      const io = req.app.get('io');
      io.to(`lesson-${comment.lessonId}`).emit('reply-updated', reply);
    }

    res.json(reply);
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({ error: 'Failed to update reply' });
  }
});

// Delete reply
router.delete('/replies/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const reply = await prisma.reply.findUnique({ where: { id } });
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    await prisma.reply.delete({ where: { id } });

    // Get comment to emit socket event
    const comment = await prisma.comment.findUnique({ where: { id: reply.commentId } });
    if (comment) {
      const io = req.app.get('io');
      io.to(`lesson-${comment.lessonId}`).emit('reply-deleted', { id });
    }

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

export default router;
