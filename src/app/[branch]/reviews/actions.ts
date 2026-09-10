"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isBranch } from "@/lib/branches";

export type ReviewFormState = { status: "idle" | "success" | "error"; message: string };

/** Bots fill every field instantly; a person cannot. */
const MIN_FILL_MS = 3000;
const MAX_BODY_LENGTH = 1500;

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  // Honeypot - a real browser never sees this field, so anything in it
  // is a bot. Answer with the success message rather than an error, so
  // the bot has no signal to tune against.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success", message: "Thank you - your review has been sent for approval." };
  }

  const branch = String(formData.get("branch") ?? "");
  if (!isBranch(branch)) {
    return { status: "error", message: "We couldn't tell which branch this review is for." };
  }

  const startedAt = Number(formData.get("started_at") ?? 0);
  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return {
      status: "error",
      message: "That was submitted a little too quickly. Please try again.",
    };
  }

  const name = String(formData.get("customer_name") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);

  if (!name) return { status: "error", message: "Please tell us your name." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { status: "error", message: "Please choose a rating from 1 to 5 stars." };
  }
  if (body.length < 10) {
    return { status: "error", message: "Please write at least a sentence about your cake." };
  }
  if (body.length > MAX_BODY_LENGTH) {
    return { status: "error", message: "That review is too long - please shorten it a little." };
  }

  const supabase = await createClient();
  // is_approved defaults to false; the admin approves it before it shows
  // publicly (§11). Anonymous INSERT is allowed by RLS, anonymous SELECT
  // is not, so this row is write-only from here.
  const { error } = await supabase
    .from("reviews")
    .insert({ customer_name: name, rating, body, branch });

  if (error) {
    return {
      status: "error",
      message: "We couldn't save that just now. Please try again, or send it to us on WhatsApp.",
    };
  }

  revalidatePath(`/${branch}/reviews`);
  return {
    status: "success",
    message: "Thank you - your review has been sent and will appear once we've checked it.",
  };
}
