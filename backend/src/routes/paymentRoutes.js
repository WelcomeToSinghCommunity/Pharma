import express from 'express';
import { razorpay } from '../config/razorpay.js';
import prisma from '../config/database.js';

const router = express.Router();

// Create Razorpay order for course enrollment
router.post('/create-order', async (req, res) => {
  try {
    const { courseId, amount } = req.body;

    if (!courseId || !amount) {
      return res.status(400).json({ error: 'courseId and amount are required' });
    }

    // Verify course exists by ID or Slug (for static fallback compatibility)
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: courseId },
          { slug: courseId }
        ]
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Validate amount matches course price
    if (amount !== course.priceInr) {
      return res.status(400).json({ error: 'Amount does not match course price' });
    }

    // Create Razorpay order using database UUID
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `course_${course.id}_${Date.now()}`,
      notes: {
        courseId: course.id,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// Verify payment and create enrollment
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      courseId,
      userId,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !courseId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Resolve courseId to database UUID (if it's a slug)
    const courseObj = await prisma.course.findFirst({
      where: {
        OR: [
          { id: courseId },
          { slug: courseId }
        ]
      }
    });

    if (!courseObj) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const dbCourseId = courseObj.id;

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: dbCourseId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment using database UUID
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: dbCourseId,
        status: 'ACTIVE',
        enrolledAt: new Date(),
      },
    });

    res.json({
      success: true,
      enrollmentId: enrollment.id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message || 'Payment verification failed' });
  }
});

// Get user enrollments
router.get('/enrollments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    res.json(enrollments);
  } catch (error) {
    console.error('Fetch enrollments error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch enrollments' });
  }
});

export default router;
