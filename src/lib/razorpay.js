export async function createCourseOrder(courseId, authToken) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const response = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ courseId }),
  });

  if (!response.ok) {
    throw new Error('Unable to create Razorpay order');
  }

  return response.json();
}
