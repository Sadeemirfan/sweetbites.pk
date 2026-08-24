import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

/**
 * Payment proof upload for a first order (§7 step 6).
 *
 * `payment-proofs` is private with admin-only read AND write (§5), so
 * unlike `order-refs` the browser cannot upload to it with the anon key.
 * The file is relayed through here on the service-role client instead,
 * which also gives us a place to enforce the type and size limits.
 *
 * The response is the storage path, not a public URL - the bucket stays
 * private and only the admin dashboard can read the object back.
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is larger than 5 MB" }, { status: 413 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Please upload an image" }, { status: 415 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("payment-proofs")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ path });
}
