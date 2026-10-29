import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session if it's expired — required for server components.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-in users opening "/" go straight to the feed, without rendering the home page first.
  if (user && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/feed";
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  // People who joined with Google must finish the 18+ / birth year / terms
  // step before using the app (email sign-ups do this on the signup form).
  const path = request.nextUrl.pathname;
  const openPaths = ["/complete-profile", "/auth", "/login", "/signup", "/terms", "/privacy", "/api"];
  if (
    user &&
    user.app_metadata?.provider === "google" &&
    !openPaths.some((p) => path.startsWith(p))
  ) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("age_confirmed_18, birth_year, terms_accepted_at")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile || !profile.age_confirmed_18 || !profile.birth_year || !profile.terms_accepted_at) {
      const url = request.nextUrl.clone();
      url.pathname = "/complete-profile";
      url.search = "";
      const redirectResponse = NextResponse.redirect(url);
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
