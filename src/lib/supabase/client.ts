import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variables.",
  );
}

/**
 * Creates a Supabase client for use in Client Components.
 * `createBrowserClient` returns a singleton in the browser, so calling this
 * multiple times does not create redundant connections.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseKey!);
}
