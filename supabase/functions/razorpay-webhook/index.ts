import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

async function hmacSha256(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  const payload = await req.text();
  const expected = await hmacSha256(Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "", payload);
  const received = req.headers.get("x-razorpay-signature") ?? "";

  if (expected !== received) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
  }

  const event = JSON.parse(payload);

  if (event.event !== "payment.captured") {
    return new Response(JSON.stringify({ ok: true, ignored: event.event }));
  }

  const payment = event.payload.payment.entity;
  const { userId, courseId } = payment.notes ?? {};

  if (!userId || !courseId) {
    return new Response(JSON.stringify({ error: "Missing payment notes" }), { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { error } = await supabase.from("enrollments").upsert({
    user_id: userId,
    course_id: courseId,
    payment_id: payment.id,
    status: "active",
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }));
});
