import express from 'express';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { deleteThumbnail, deleteMaterial, deleteVideo } from '../services/supabaseStorageService.js';
import { deleteVideo as deleteBunnyVideo } from '../services/bunnyStreamService.js';

const router = express.Router();

// ============================================
// BUNNY.NET EMBED SIGNATURE HELPERS
// ============================================

const BUNNY_TOKEN_AUTH_KEY = process.env.BUNNY_TOKEN_AUTH_KEY || '2313c9f4-7d1d-4419-bf32-8cf7cd177946';
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID || '696606';

/**
 * Generate a secure signed URL for the Bunny.net video player iframe
 */
function signBunnyUrl(videoStreamId) {
  if (!BUNNY_TOKEN_AUTH_KEY || !videoStreamId) return null;
  
  const expirationTimeInSeconds = 10800; // 3 hours link expiration
  const expires = Math.floor(Date.now() / 1000) + expirationTimeInSeconds;
  
  // Signature algorithm: SHA256_HEX(token_security_key + video_id + expiration)
  const signatureString = BUNNY_TOKEN_AUTH_KEY + videoStreamId + expires;
  const token = crypto.createHash('sha256').update(signatureString).digest('hex');
  
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoStreamId}?token=${token}&expires=${expires}`;
}

/**
 * Check if the user is enrolled in the course or has admin privileges
 */
async function checkEnrollment(userId, courseId, adminEmail = 'harideepsingh13@gmail.com') {
  if (!userId) return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  // If user ID is not a valid UUID format, it cannot exist in auth/profiles, so return false
  if (!uuidRegex.test(userId)) {
    return false;
  }
  
  try {
    // 1. Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, role: true, email: true }
    });
    const adminEmails = ['harideepsingh13@gmail.com', 'kishansingh.nmims@gmail.com'];
    if (user && (
      user.isAdmin || 
      user.role === 'admin' || 
      user.email === adminEmail || 
      adminEmails.includes(user.email?.toLowerCase())
    )) {
      return true;
    }
    
    // 2. Resolve courseId if it is a slug
    let realCourseId = courseId;
    if (!uuidRegex.test(courseId)) {
      const course = await prisma.course.findUnique({
        where: { slug: courseId },
        select: { id: true }
      });
      if (!course) return false;
      realCourseId = course.id;
    }
    
    // 3. Check active enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: realCourseId
        }
      }
    });
    
    return !!enrollment;
  } catch (error) {
    console.error('[Security] Error checking enrollment:', error);
    return false;
  }
}

/**
 * Secure course lessons: generate signed URLs for allowed users/previews, and redact locked content
 */
async function secureAndSignCourse(course, userId) {
  const isEnrolled = course.priceInr === 0 || await checkEnrollment(userId, course.id);
  
  // Create a deep copy of the course object
  const courseCopy = JSON.parse(JSON.stringify(course));
  
  for (const module of courseCopy.modules) {
    for (const lesson of module.lessons) {
      const canAccess = isEnrolled || lesson.isPreview;
      
      if (canAccess) {
        if (lesson.videoStreamId) {
          lesson.videoUrl = signBunnyUrl(lesson.videoStreamId);
        }
      } else {
        // Redact locked content details to prevent direct access
        lesson.videoUrl = null;
        lesson.videoStreamId = null;
      }
    }
  }
  
  return courseCopy;
}

// ============================================
// COURSES
// ============================================

// Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const { published } = req.query;
    
    const courses = await prisma.course.findMany({
      where: published === 'true' ? { isPublished: true } : undefined,
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                isPreview: true,
                videoDuration: true,
                sortOrder: true,
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.headers['x-user-id'];

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const securedCourse = await secureAndSignCourse(course, userId);
    res.json(securedCourse);
  } catch (error) {
    console.error('Get course by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    // UUID format validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    let course;
    if (uuidRegex.test(id)) {
      course = await prisma.course.findUnique({
        where: { id },
        include: {
          modules: {
            include: {
              lessons: {
                orderBy: { sortOrder: 'asc' },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    } else {
      course = await prisma.course.findUnique({
        where: { slug: id },
        include: {
          modules: {
            include: {
              lessons: {
                orderBy: { sortOrder: 'asc' },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const securedCourse = await secureAndSignCourse(course, userId);
    res.json(securedCourse);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create course
router.post('/', async (req, res) => {
  try {
    const {
      slug,
      title,
      shortDesc,
      description,
      thumbnailUrl,
      instructor,
      level,
      priceInr,
      whatYouWillLearn,
      isPublished,
      modules,
    } = req.body;

    // Validate required fields
    if (!slug || !title) {
      return res.status(400).json({ error: 'Slug and title are required' });
    }

    // Check if slug already exists
    const existing = await prisma.course.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Course with this slug already exists' });
    }

    // Create course with modules and lessons
    const course = await prisma.course.create({
      data: {
        slug,
        title,
        shortDesc,
        description,
        thumbnailUrl,
        instructor: instructor || 'Harish Singh',
        level: level || 'INTERMEDIATE',
        priceInr: priceInr || 0,
        whatYouWillLearn: whatYouWillLearn || [],
        isPublished: isPublished || false,
        modules: modules ? {
          create: modules.map((mod, modIndex) => ({
            title: mod.title,
            sortOrder: modIndex,
            lessons: mod.lessons ? {
              create: mod.lessons.map((lesson, lessonIndex) => ({
                title: lesson.title,
                contentText: lesson.contentText,
                videoUrl: lesson.videoUrl,
                videoStreamId: lesson.videoStreamId,
                videoDuration: lesson.videoDuration,
                attachmentUrl: lesson.attachmentUrl,
                isPreview: lesson.isPreview || false,
                sortOrder: lessonIndex,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      slug,
      title,
      shortDesc,
      description,
      thumbnailUrl,
      instructor,
      level,
      priceInr,
      whatYouWillLearn,
      isPublished,
      modules,
    } = req.body;

    console.log('Updating course:', id, 'with data:', { title, slug, modulesCount: modules?.length });

    // Check if ID is a valid UUID, otherwise find by slug first to get the real UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let realId = id;
    
    let existing;
    if (uuidRegex.test(id)) {
      existing = await prisma.course.findUnique({ where: { id } });
    } else {
      existing = await prisma.course.findUnique({ where: { slug: id } });
      if (existing) {
        realId = existing.id; // Map it to the database UUID!
      }
    }

    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if new slug conflicts with another course
    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.course.findUnique({ where: { slug } });
      if (slugConflict) {
        return res.status(400).json({ error: 'Course with this slug already exists' });
      }
    }

    // Update course
    const course = await prisma.course.update({
      where: { id: realId },
      data: {
        ...(slug && { slug }),
        ...(title && { title }),
        ...(shortDesc !== undefined && { shortDesc }),
        ...(description !== undefined && { description }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(instructor && { instructor }),
        ...(level && { level }),
        ...(priceInr !== undefined && { priceInr }),
        ...(whatYouWillLearn !== undefined && { whatYouWillLearn }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    // Handle modules update if provided
    if (modules) {
      console.log('Updating modules for course:', realId);
      // Delete existing modules and lessons
      await prisma.module.deleteMany({ where: { courseId: realId } });

      // Create new modules and lessons
      for (const [modIndex, mod] of modules.entries()) {
        const createdModule = await prisma.module.create({
          data: {
            courseId: realId,
            title: mod.title,
            sortOrder: modIndex,
          },
        });

        if (mod.lessons) {
          for (const [lessonIndex, lesson] of mod.lessons.entries()) {
            await prisma.lesson.create({
              data: {
                moduleId: createdModule.id,
                title: lesson.title,
                contentText: lesson.contentText,
                videoUrl: lesson.videoUrl,
                videoStreamId: lesson.videoStreamId,
                videoDuration: lesson.videoDuration,
                attachmentUrl: lesson.attachmentUrl,
                isPreview: lesson.isPreview || false,
                sortOrder: lessonIndex,
              },
            });
          }
        }
      }
    }

    // Fetch updated course with relations
    const updatedCourse = await prisma.course.findUnique({
      where: { id: realId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    res.json(updatedCourse);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is a valid UUID, otherwise find by slug first to get the real UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let realId = id;
    
    let course;
    if (uuidRegex.test(id)) {
      course = await prisma.course.findUnique({
        where: { id },
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      });
    } else {
      course = await prisma.course.findUnique({
        where: { slug: id },
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      });
      if (course) {
        realId = course.id; // Map it to the database UUID!
      }
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete associated files from Supabase Storage
    if (course.thumbnailUrl) {
      try {
        const key = course.thumbnailUrl.split('/').pop();
        await deleteThumbnail(key);
      } catch (error) {
        console.error('Failed to delete thumbnail:', error);
      }
    }

    // Delete videos and materials from Bunny.net and Supabase Storage
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.videoStreamId) {
          try {
            await deleteBunnyVideo(lesson.videoStreamId);
          } catch (error) {
            console.error('Failed to delete Bunny.net video:', error);
          }
        } else if (lesson.videoUrl && !lesson.videoUrl.includes('mediadelivery.net')) {
          try {
            const key = lesson.videoUrl.split('/').pop();
            await deleteVideo(key);
          } catch (error) {
            console.error('Failed to delete Supabase video:', error);
          }
        }
        if (lesson.attachmentUrl) {
          try {
            const key = lesson.attachmentUrl.split('/').pop();
            await deleteMaterial(key);
          } catch (error) {
            console.error('Failed to delete attachment:', error);
          }
        }
      }
    }

    // Delete course (cascade will delete modules and lessons)
    await prisma.course.delete({ where: { id: realId } });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// ============================================
// MODULES
// ============================================

// Create module
router.post('/:courseId/modules', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, sortOrder } = req.body;

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        sortOrder: sortOrder || 0,
      },
    });

    res.status(201).json(module);
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// Update module
router.put('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, sortOrder } = req.body;

    const module = await prisma.module.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    res.json(module);
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// Delete module
router.delete('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.module.delete({ where: { id } });

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

// ============================================
// LESSONS
// ============================================

// Create lesson
router.post('/modules/:moduleId/lessons', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      contentText,
      videoUrl,
      videoStreamId,
      videoDuration,
      attachmentUrl,
      isPreview,
      sortOrder,
    } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        contentText,
        videoUrl,
        videoStreamId,
        videoDuration,
        attachmentUrl,
        isPreview: isPreview || false,
        sortOrder: sortOrder || 0,
      },
    });

    res.status(201).json(lesson);
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update lesson
router.put('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      contentText,
      videoUrl,
      videoStreamId,
      videoDuration,
      attachmentUrl,
      isPreview,
      sortOrder,
    } = req.body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(contentText !== undefined && { contentText }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(videoStreamId !== undefined && { videoStreamId }),
        ...(videoDuration !== undefined && { videoDuration }),
        ...(attachmentUrl !== undefined && { attachmentUrl }),
        ...(isPreview !== undefined && { isPreview }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    res.json(lesson);
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete lesson
router.delete('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get lesson to delete associated files
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    
    if (lesson) {
      if (lesson.videoStreamId) {
        try {
          await deleteBunnyVideo(lesson.videoStreamId);
        } catch (error) {
          console.error('Failed to delete Bunny.net video:', error);
        }
      } else if (lesson.videoUrl && !lesson.videoUrl.includes('mediadelivery.net')) {
        try {
          const key = lesson.videoUrl.split('/').pop();
          await deleteVideo(key);
        } catch (error) {
          console.error('Failed to delete Supabase video:', error);
        }
      }
      if (lesson.attachmentUrl) {
        try {
          const key = lesson.attachmentUrl.split('/').pop();
          await deleteMaterial(key);
        } catch (error) {
          console.error('Failed to delete attachment:', error);
        }
      }
    }

    await prisma.lesson.delete({ where: { id } });

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

export default router;
