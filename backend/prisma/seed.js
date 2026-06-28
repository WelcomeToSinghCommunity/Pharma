import { PrismaClient } from '@prisma/client';
import { courses } from '../../src/data/courses.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.videoLike.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  console.log('Cleared existing data');

  // Seed courses
  for (const course of courses) {
    console.log(`Seeding course: ${course.title}`);

    const createdCourse = await prisma.course.create({
      data: {
        slug: course.slug,
        title: course.title,
        shortDesc: course.shortDesc,
        description: course.description,
        thumbnailUrl: course.thumbnail,
        instructor: course.instructor,
        level: course.level.toUpperCase(),
        priceInr: course.priceInr,
        whatYouWillLearn: course.whatYouWillLearn,
        isPublished: course.published,
        modules: {
          create: course.modules.map((mod, modIndex) => ({
            title: mod.title,
            sortOrder: modIndex,
            lessons: {
              create: mod.lessons.map((lesson, lessonIndex) => ({
                title: lesson.title,
                contentText: lesson.notes,
                videoUrl: lesson.videoUrl !== '/videos/upload-your-video.mp4' ? lesson.videoUrl : null,
                videoDuration: parseDuration(lesson.duration),
                attachmentUrl: lesson.attachmentUrl || null,
                isPreview: lesson.isPreview || false,
                sortOrder: lessonIndex,
              })),
            },
          })),
        },
      },
    });

    console.log(`  Created course: ${createdCourse.id}`);
  }

  console.log('Seed completed successfully!');
}

// Helper to parse duration string (e.g., "10 min" -> 600 seconds)
function parseDuration(duration) {
  if (!duration) return 0;
  const match = duration.match(/(\d+)\s*(min|minute|minutes|hr|hour|hours)/i);
  if (!match) return 0;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit.startsWith('hr') || unit.startsWith('hour')) {
    return value * 60;
  }
  return value;
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
