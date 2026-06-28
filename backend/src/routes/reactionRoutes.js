import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

// ============================================
// COMMENT LIKES
// ============================================

// Like a comment
router.post('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if already liked
    const existing = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already liked this comment' });
    }

    const like = await prisma.commentLike.create({
      data: {
        commentId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Get comment for socket emission
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        _count: {
          select: { likes: true },
        },
      },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (comment) {
      io.to(`lesson-${comment.lessonId}`).emit('comment-liked', {
        commentId,
        likeCount: comment._count.likes + 1,
        userId,
      });
    }

    res.status(201).json(like);
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

// Unlike a comment
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await prisma.commentLike.deleteMany({
      where: {
        commentId,
        userId,
      },
    });

    // Get comment for socket emission
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        _count: {
          select: { likes: true },
        },
      },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (comment) {
      io.to(`lesson-${comment.lessonId}`).emit('comment-unliked', {
        commentId,
        likeCount: Math.max(0, comment._count.likes - 1),
        userId,
      });
    }

    res.json({ message: 'Comment unliked successfully' });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ error: 'Failed to unlike comment' });
  }
});

// ============================================
// VIDEO LIKES/DISLIKES
// ============================================

// Like or dislike a video
router.post('/videos/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userId, type } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ error: 'userId and type are required' });
    }

    if (!['LIKE', 'DISLIKE'].includes(type)) {
      return res.status(400).json({ error: 'type must be LIKE or DISLIKE' });
    }

    // Check if user already reacted
    const existing = await prisma.videoLike.findUnique({
      where: {
        lessonId_userId: {
          lessonId,
          userId,
        },
      },
    });

    if (existing) {
      // Update if different type
      if (existing.type !== type) {
        const updated = await prisma.videoLike.update({
          where: { id: existing.id },
          data: { type },
        });

        // Get reaction counts
        const counts = await getVideoReactionCounts(lessonId);

        // Emit socket event
        const io = req.app.get('io');
        io.to(`lesson-${lessonId}`).emit('video-reaction-changed', {
          lessonId,
          ...counts,
          userId,
          type,
        });

        return res.json({ ...updated, counts });
      }

      return res.status(400).json({ error: 'Already reacted with this type' });
    }

    // Create new reaction
    const reaction = await prisma.videoLike.create({
      data: {
        lessonId,
        userId,
        type,
      },
    });

    // Get reaction counts
    const counts = await getVideoReactionCounts(lessonId);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`lesson-${lessonId}`).emit('video-reaction-added', {
      lessonId,
      ...counts,
      userId,
      type,
    });

    res.status(201).json({ ...reaction, counts });
  } catch (error) {
    console.error('Video reaction error:', error);
    res.status(500).json({ error: 'Failed to react to video' });
  }
});

// Remove video reaction
router.delete('/videos/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await prisma.videoLike.deleteMany({
      where: {
        lessonId,
        userId,
      },
    });

    // Get reaction counts
    const counts = await getVideoReactionCounts(lessonId);

    // Emit socket event
    const io = req.app.get('io');
    io.to(`lesson-${lessonId}`).emit('video-reaction-removed', {
      lessonId,
      ...counts,
      userId,
    });

    res.json({ message: 'Reaction removed successfully', counts });
  } catch (error) {
    console.error('Remove video reaction error:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// Get video reaction counts
router.get('/videos/:lessonId/counts', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const counts = await getVideoReactionCounts(lessonId);
    res.json(counts);
  } catch (error) {
    console.error('Get video reaction counts error:', error);
    res.status(500).json({ error: 'Failed to get reaction counts' });
  }
});

// Get user's reaction on a video
router.get('/videos/:lessonId/user/:userId', async (req, res) => {
  try {
    const { lessonId, userId } = req.params;

    const reaction = await prisma.videoLike.findUnique({
      where: {
        lessonId_userId: {
          lessonId,
          userId,
        },
      },
    });

    res.json(reaction || null);
  } catch (error) {
    console.error('Get user reaction error:', error);
    res.status(500).json({ error: 'Failed to get user reaction' });
  }
});

// Helper function to get video reaction counts
async function getVideoReactionCounts(lessonId) {
  const reactions = await prisma.videoLike.groupBy({
    by: ['type'],
    where: { lessonId },
    _count: true,
  });

  const counts = {
    LIKE: 0,
    DISLIKE: 0,
  };

  reactions.forEach(r => {
    counts[r.type] = r._count;
  });

  return counts;
}

export default router;
