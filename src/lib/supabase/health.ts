export type SupabaseHealthStatus = "connected" | "error";

export interface SupabaseHealthResult {
  status: SupabaseHealthStatus;
  message?: string;
}

/**
 * Lightweight connectivity check. Hits Supabase Auth's public `/health`
 * endpoint, which responds without requiring any table/migration to exist —
 * safe to call before the schema is set up.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { status: "error", message: "Missing Supabase environment variables" };
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabaseKey },
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: "error", message: `HTTP ${response.status}` };
    }

    return { status: "connected" };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
