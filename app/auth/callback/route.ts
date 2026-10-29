import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase sends the user here after:
//  - clicking the link in a password reset / email confirmation email, or
//  - signing in with Google.
// The URL carries a one-time `code`; we exchange it for a real session
// (stored in cookies), then send them on to wherever they need to be.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/feed";
  // Only allow redirects inside our own site.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/feed";

  // Google (or Supabase) can send the user back with an error instead of a code,
  // e.g. when they cancel the Google screen.
  const oauthError = searchParams.get("error_code") ?? searchParams.get("error");
  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.code ?? error?.message ?? "otp_expired")}`
    );
  }

  // People who signed up with Google haven't confirmed 18+ / birth year /
  // terms yet — send them to finish that before using the app.
  const { data: profile } = await supabase
    .from("profiles")
    .select("age_confirmed_18, birth_year, terms_accepted_at")
    .eq("id", data.user.id)
    .maybeSingle();

  const isPasswordReset = safeNext.startsWith("/reset-password");
  if (
    !isPasswordReset &&
    (!profile || !profile.age_confirmed_18 || !profile.birth_year || !profile.terms_accepted_at)
  ) {
    return NextResponse.redirect(`${origin}/complete-profile`);
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
