import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.",
  );
}

/**
 * Creates a Supabase client for use in Server Components and Route Handlers.
 * This does not manage auth cookies/sessions yet — it's a plain anon-key
 * client for public data access. Swap for `@supabase/ssr`'s
 * `createServerClient` once auth is introduced.
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl!, supabaseKey!, {
    auth: {
      persistSession: false,
    },
  });
}
