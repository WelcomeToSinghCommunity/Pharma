const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper for fetch requests
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add user ID from localStorage if available
  const userId = localStorage.getItem('userId');
  if (userId) {
    headers['X-User-Id'] = userId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ============================================
// COURSES
// ============================================

export async function getCourses(published = true) {
  return fetchAPI(`/courses?published=${published}`);
}

export async function getCourseBySlug(slug) {
  return fetchAPI(`/courses/slug/${slug}`);
}

export async function getCourseById(id) {
  return fetchAPI(`/courses/${id}`);
}

export async function createCourse(courseData) {
  return fetchAPI('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData),
  });
}

export async function updateCourse(id, courseData) {
  return fetchAPI(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(courseData),
  });
}

export async function deleteCourse(id) {
  return fetchAPI(`/courses/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// MODULES
// ============================================

export async function createModule(courseId, moduleData) {
  return fetchAPI(`/courses/${courseId}/modules`, {
    method: 'POST',
    body: JSON.stringify(moduleData),
  });
}

export async function updateModule(id, moduleData) {
  return fetchAPI(`/courses/modules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(moduleData),
  });
}

export async function deleteModule(id) {
  return fetchAPI(`/courses/modules/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// LESSONS
// ============================================

export async function createLesson(moduleId, lessonData) {
  return fetchAPI(`/courses/modules/${moduleId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(lessonData),
  });
}

export async function updateLesson(id, lessonData) {
  return fetchAPI(`/courses/lessons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(lessonData),
  });
}

export async function deleteLesson(id) {
  return fetchAPI(`/courses/lessons/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// FILE UPLOADS
// ============================================

export async function uploadThumbnail(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload/thumbnail`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

export async function uploadMaterial(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload/material`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

export async function uploadVideo(file, title) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  const response = await fetch(`${API_BASE}/upload/video`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

export async function getVideoDirectUploadUrl(fileName, maxDuration) {
  return fetchAPI('/upload/video/direct-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, maxDuration }),
  });
}

// ============================================
// COMMENTS
// ============================================

export async function getComments(lessonId, limit = 50, offset = 0) {
  return fetchAPI(`/comments/lesson/${lessonId}?limit=${limit}&offset=${offset}`);
}

export async function getCourseComments(courseId, limit = 10) {
  return fetchAPI(`/comments/course/${courseId}?limit=${limit}`);
}

export async function createComment(lessonId, userId, content) {
  return fetchAPI('/comments', {
    method: 'POST',
    body: JSON.stringify({ lessonId, userId, content }),
  });
}

export async function updateComment(id, data) {
  return fetchAPI(`/comments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteComment(id) {
  return fetchAPI(`/comments/${id}`, {
    method: 'DELETE',
  });
}

export async function createReply(commentId, userId, content) {
  return fetchAPI(`/comments/${commentId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ userId, content }),
  });
}

export async function updateReply(id, content) {
  return fetchAPI(`/comments/replies/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

export async function deleteReply(id) {
  return fetchAPI(`/comments/replies/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// REACTIONS
// ============================================

export async function likeComment(commentId, userId) {
  return fetchAPI(`/reactions/comments/${commentId}`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function unlikeComment(commentId, userId) {
  return fetchAPI(`/reactions/comments/${commentId}`, {
    method: 'DELETE',
    body: JSON.stringify({ userId }),
  });
}

export async function reactToVideo(lessonId, userId, type) {
  return fetchAPI(`/reactions/videos/${lessonId}`, {
    method: 'POST',
    body: JSON.stringify({ userId, type }),
  });
}

export async function removeVideoReaction(lessonId, userId) {
  return fetchAPI(`/reactions/videos/${lessonId}`, {
    method: 'DELETE',
    body: JSON.stringify({ userId }),
  });
}

export async function getVideoReactionCounts(lessonId) {
  return fetchAPI(`/reactions/videos/${lessonId}/counts`);
}

export async function getUserVideoReaction(lessonId, userId) {
  return fetchAPI(`/reactions/videos/${lessonId}/user/${userId}`);
}

// ============================================
// ANNOUNCEMENTS
// ============================================

export async function getAnnouncement() {
  return fetchAPI('/announcement');
}

export async function updateAnnouncement(config) {
  return fetchAPI('/announcement', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

// ============================================
// REVIEWS & RATINGS
// ============================================

export async function getCourseReviews(courseId) {
  return fetchAPI(`/courses/${courseId}/reviews`);
}

export async function submitCourseReview(courseId, userId, rating, content) {
  return fetchAPI(`/courses/${courseId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ userId, rating, content }),
  });
}
