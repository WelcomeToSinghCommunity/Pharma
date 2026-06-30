import express from 'express';
import { razorpay } from '../config/razorpay.js';
import prisma from '../config/database.js';

const router = express.Router();

const BACKEND_STATIC_COURSES = [
  { id: 'oos-investigation', slug: 'oos-investigation', title: 'OOS Investigation', priceInr: 1499 },
  { id: 'equipment-qualification', slug: 'equipment-qualification', title: 'Qualification of Instrument/Equipment', priceInr: 999 },
  { id: 'smoke-study-validation', slug: 'smoke-study-validation', title: 'Smoke Study: Airflow Visualization', priceInr: 1999 },
  { id: 'csa-guidelines-fda-audits', slug: 'csa-guidelines-fda-audits', title: 'Implementation of CSA Guidelines & FDA Audits', priceInr: 0 }
];

// Create Razorpay order for course enrollment
router.post('/create-order', async (req, res) => {
  try {
    const { courseId, amount } = req.body;

    if (!courseId || !amount) {
      return res.status(400).json({ error: 'courseId and amount are required' });
    }

    // Verify course exists by ID or Slug (with safety try-catch for DB down states)
    let course = null;
    try {
      course = await prisma.course.findFirst({
        where: {
          OR: [
            { id: courseId },
            { slug: courseId }
          ]
        },
      });
    } catch (dbError) {
      console.warn('Database query failed during order creation, falling back to static list:', dbError.message);
    }

    // Fallback if course not found in DB
    if (!course) {
      const staticCourse = BACKEND_STATIC_COURSES.find(c => c.id === courseId || c.slug === courseId);
      if (staticCourse) {
        course = {
          id: staticCourse.id,
          title: staticCourse.title,
          priceInr: staticCourse.priceInr,
          slug: staticCourse.slug
        };
      }
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Validate amount matches course price
    if (amount !== course.priceInr) {
      return res.status(400).json({ error: 'Amount does not match course price' });
    }

    // Create Razorpay order using database UUID
    let order = null;
    let isMock = false;

    // Call Razorpay API only if client is initialized
    if (razorpay) {
      try {
        // Keep receipt ID under 40 characters (Razorpay validation limit)
        const receiptId = `rcpt_${course.id.substring(0, 8)}_${Date.now().toString().slice(-8)}`;
        const options = {
          amount: amount * 100, // Razorpay expects amount in paise
          currency: 'INR',
          receipt: receiptId,
          notes: {
            courseId: course.id,
          },
        };
        order = await razorpay.orders.create(options);
      } catch (rzpError) {
        console.warn('Razorpay order creation failed, switching to mock checkout:', rzpError.message);
        isMock = true;
      }
    } else {
      console.warn('Razorpay not configured on server, switching to mock checkout');
      isMock = true;
    }

    if (isMock || !order) {
      // Return a simulated mock order for testing/fallback
      return res.json({
        orderId: `mock_order_${course.id}_${Date.now()}`,
        amount: amount * 100,
        currency: 'INR',
        keyId: 'rzp_test_mock_key',
        isMock: true
      });
    }

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      isMock: false
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

    // Bypass signature check for simulated mock payments
    const isMock = (razorpayOrderId && razorpayOrderId.startsWith('mock_order_')) && razorpaySignature === 'mock_signature_valid';

    if (!isMock) {
      // Verify signature
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'fallback_secret');
      hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    }

    // Resolve courseId to database UUID (if it's a slug)
    let courseObj = null;
    try {
      courseObj = await prisma.course.findFirst({
        where: {
          OR: [
            { id: courseId },
            { slug: courseId }
          ]
        }
      });
    } catch (dbError) {
      console.warn('Database error during verification lookup:', dbError.message);
    }
    
    const dbCourseId = courseObj ? courseObj.id : courseId;

    // Ensure the user exists in the PostgreSQL User table to satisfy foreign key constraints
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!dbUser) {
        const email = req.body.email || `student_${userId.substring(0, 8)}@example.com`;
        const fullName = req.body.fullName || 'Registered Student';
        
        await prisma.user.create({
          data: {
            id: userId,
            email,
            fullName,
          }
        });
        console.log(`Dynamically created missing user record in DB: ${userId}`);
      }
    } catch (userDbError) {
      console.warn('Failed to ensure user exists in DB:', userDbError.message);
    }

    let enrollment = null;
    let dbSuccess = false;

    try {
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
      enrollment = await prisma.enrollment.create({
        data: {
          userId,
          courseId: dbCourseId,
          status: 'ACTIVE',
          enrolledAt: new Date(),
        },
      });
      dbSuccess = true;
    } catch (dbError) {
      console.warn('Database error during enrollment verification, using mock fallback:', dbError.message);
    }

    if (!dbSuccess || !enrollment) {
      // Return a simulated mock enrollment if database is offline or has constraint errors
      return res.json({
        success: true,
        enrollmentId: `mock_enrollment_${dbCourseId}_${Date.now()}`,
        isMock: true
      });
    }

    res.json({
      success: true,
      enrollmentId: enrollment.id,
      isMock: false
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

    let enrollments = [];
    try {
      enrollments = await prisma.enrollment.findMany({
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
    } catch (dbError) {
      console.warn('Database offline, returning fallback static enrollments:', dbError.message);
      // In offline/mock mode, return a list of static enrollments for testing
      return res.json([
        {
          courseId: 'oos-investigation',
          status: 'ACTIVE',
          course: BACKEND_STATIC_COURSES.find(c => c.id === 'oos-investigation')
        },
        {
          courseId: 'equipment-qualification',
          status: 'ACTIVE',
          course: BACKEND_STATIC_COURSES.find(c => c.id === 'equipment-qualification')
        },
        {
          courseId: 'smoke-study-validation',
          status: 'ACTIVE',
          course: BACKEND_STATIC_COURSES.find(c => c.id === 'smoke-study-validation')
        }
      ]);
    }

    res.json(enrollments);
  } catch (error) {
    console.error('Fetch enrollments error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch enrollments' });
  }
});

export default router;
