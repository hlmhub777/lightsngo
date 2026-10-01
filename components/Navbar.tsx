import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StartLights from "@/components/StartLights";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let avatarUrl: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-asphalt-700 bg-asphalt-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/feed" className="flex items-center gap-2.5">
          <StartLights size="sm" />
          <span className="font-display text-xl font-700 tracking-wide text-paper">
            Lights<span className="text-flag-red">N</span>Go
          </span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/feed" className="text-paper/80 hover:text-paper">
              Feed
            </Link>
            <Link href="/races" className="text-paper/80 hover:text-paper">
              Races
            </Link>
            <Link href="/messages" className="text-paper/80 hover:text-paper">
              Messages
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-sm border border-asphalt-600 px-3 py-1.5 text-paper hover:border-flag-red"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : null}
              {username ?? "Profile"}
            </Link>
          </nav>
        ) : (
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-paper/80 hover:text-paper">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-sm bg-flag-red px-3 py-1.5 font-medium text-paper hover:bg-flag-red/90"
            >
              Join
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
