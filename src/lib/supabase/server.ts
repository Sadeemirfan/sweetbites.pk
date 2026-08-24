import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/db";

/**
 * Server-side Supabase client - for use in Server Components, Server
 * Actions, and Route Handlers. Reads/writes auth cookies via next/headers.
 *
 * Server Components can't set cookies (Next.js throws), so the `set`
 * call is wrapped in try/catch - session refresh in that case is instead
 * handled by src/middleware.ts, which runs on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component - middleware refreshes the
            // session instead.
          }
        },
      },
    }
  );
}
