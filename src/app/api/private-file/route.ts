import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Opens one object out of a private bucket for the signed-in admin.
 *
 * `payment-proofs`, `receipts` and `order-refs` are all private under
 * §5, so the dashboard only ever holds the storage path. Without this
 * the three screens that reference those files were dead ends - they
 * printed the raw path and told the owner to go and find it in the
 * Supabase console, which is not something she is ever going to do.
 *
 * The signed URL is minted with the service role and handed back as a
 * redirect, so the link is just an <a href> and the bucket stays
 * private. It expires in a minute - long enough to open, too short to
 * be worth passing around.
 */

const BUCKETS = ["payment-proofs", "receipts", "order-refs"] as const;
const EXPIRES_IN = 60;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get("bucket");
  const path = searchParams.get("path");

  if (!bucket || !BUCKETS.includes(bucket as (typeof BUCKETS)[number])) {
    return NextResponse.json({ error: "Unknown bucket" }, { status: 400 });
  }
  // The path comes off a database row rather than from the user, but it
  // lands in a storage key either way - keep it to one flat object name.
  if (!path || path.includes("..") || path.startsWith("/")) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, EXPIRES_IN);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Couldn't open that file" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
