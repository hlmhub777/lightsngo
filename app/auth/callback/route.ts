import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase sends the user here after they click the link in a password
// reset (or email confirmation) email, with a one-time `code` in the URL.
// We exchange it for a real session (stored in cookies), then send them
// on to wherever they actually need to be.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/feed";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
