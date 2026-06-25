# Owner Content Editing Guide

Course creation, deletion, publishing, video uploads, and content changes are owner/admin tasks only.

In the current local MVP, the owner is configured in:

```text
src/App.jsx
```

```js
const ownerEmail = 'harideepsingh13@gmail.com';
```

For production, this should come from Supabase Auth and the `profiles.role = 'admin'` database field. The Supabase migration already includes admin-only RLS policies.

Most course changes happen in:

```text
src/data/courses.js
```

## Change Course Text

Find the course you want and edit these fields:

```js
title: 'OOS Investigation',
shortDesc: 'Short card description',
description: 'Full course description',
thumbnail: 'https://image-url-here',
instructor: 'Harish Singh',
level: 'Intermediate',
priceInr: 1499,
```

Use `priceInr: 0` for a free course.

## Add or Change Videos

Each lesson now has its own video field:

```js
lesson('Overview of OOS: Definition and Importance', {
  duration: '10 min',
  isPreview: true,
  videoUrl: '/videos/oos-introduction.mp4',
  attachmentUrl: '/materials/oos-introduction.pdf',
  notes: 'Write lesson notes here.',
}),
```

For quick local testing:

1. Put your MP4 file inside `public/videos/`
2. Use a URL like `/videos/my-video-name.mp4`

For production:

1. Upload the video to Cloudflare Stream, Mux, Vimeo, or another secure video host
2. Paste the hosted video URL into `videoUrl`

## Add Course Materials

Put PDFs or PPT files in a public folder such as:

```text
public/materials/
```

Then reference them:

```js
attachmentUrl: '/materials/oos-notes.pdf'
```

## Add a New Topic or Subtopic

Modules are topics. Lessons are subtopics.

```js
modules: [
  {
    title: 'New Topic Name',
    lessons: [
      lesson('New Subtopic 1', {
        duration: '8 min',
        videoUrl: '/videos/new-subtopic-1.mp4',
        notes: 'Notes for this subtopic.',
      }),
      lesson('New Subtopic 2', {
        duration: '12 min',
        videoUrl: '/videos/new-subtopic-2.mp4',
        notes: 'More notes.',
      }),
    ],
  },
],
```

## Add a New Course

Copy one full course object inside the `courses = [...]` array, paste it after another course, and change:

```js
{
  id: 'new-course-id',
  slug: 'new-course-url',
  title: 'New Course Title',
  shortDesc: 'Short course card text.',
  description: 'Full course description.',
  thumbnail: 'https://image-url-here',
  instructor: 'Harish Singh',
  level: 'Beginner',
  priceInr: 999,
  published: true,
  whatYouWillLearn: [
    'Outcome one.',
    'Outcome two.',
  ],
  modules: [
    {
      title: 'First Topic',
      lessons: [
        lesson('First Subtopic', {
          duration: '10 min',
          isPreview: true,
          videoUrl: '/videos/first-subtopic.mp4',
          notes: 'Intro lesson notes.',
        }),
      ],
    },
  ],
}
```

Important:

- `id` should be unique.
- `slug` controls the course URL, for example `/courses/new-course-url`.
- Put a comma between courses.

## Remove a Course

Delete the full course object from `src/data/courses.js`.

Start deleting from:

```js
{
  id: 'course-id',
```

Stop after that course object’s closing:

```js
},
```

## Hide a Course Without Deleting It

Set:

```js
published: false,
```

The public landing page, catalog, and course detail pages now hide unpublished courses. The owner/admin course table still shows all courses.

## Owner/Admin Access Rule

Learners should never edit `src/data/courses.js`.

Later, when Supabase is fully connected, Harish will manage this from `/admin/courses` instead of editing code. Until then, treat this file as the owner-only course CMS file.
