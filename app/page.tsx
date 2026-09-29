import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StartLights from "@/components/StartLights";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/feed");

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-24 pt-20 text-center">
      <StartLights size="lg" />
      <span className="mb-4 mt-4 font-mono text-xs uppercase tracking-[0.2em] text-flag-amber">
        Lights out, and away we go
      </span>
      <h1 className="font-display text-5xl font-700 leading-tight text-paper sm:text-6xl">
        Find your people at every Grand Prix.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-paper/70">
        Race-day chat rooms, city guides written by fans who&rsquo;ve actually
        been there, and a place to keep talking with the ones you meet along
        the way.
      </p>
      <div className="mt-9 flex gap-3">
        <Link
          href="/signup"
          className="rounded-sm bg-flag-red px-6 py-3 font-medium text-paper hover:bg-flag-red/90"
        >
          Join LightsNGo
        </Link>
        <Link
          href="/login"
          className="rounded-sm border border-asphalt-600 px-6 py-3 font-medium text-paper hover:border-paper/50"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
