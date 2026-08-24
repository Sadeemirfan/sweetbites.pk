import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

/**
 * Service-role client. Bypasses RLS entirely, so it must never reach the
 * browser - the `server-only` import above turns any client-component
 * import of this file into a build error rather than a leaked key.
 *
 * Checkout needs it for three things the anonymous role deliberately
 * cannot do under the §5 RLS matrix:
 *
 *  1. Read `products` prices to recalculate the total server-side
 *     (§8 rule 7 - a client-sent total is never trusted).
 *  2. Check a phone against `customers` for the first-order advance
 *     rule. Doing this here rather than through a public RPC keeps
 *     "has this number ordered before?" off the public API surface.
 *  3. Call create_website_order and read back the generated order
 *     number. Anonymous INSERT is allowed, but INSERT ... RETURNING is
 *     also checked against the SELECT policy, and orders are
 *     admin-read-only - so the anon key can create an order but can
 *     never learn its number.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase service-role credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
