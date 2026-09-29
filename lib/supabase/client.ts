import { createBrowserClient } from "@supabase/ssr";

// Used in components that run in the browser (most of our pages).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
