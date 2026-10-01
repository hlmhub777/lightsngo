import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GuideBrowser from "@/components/GuideBrowser";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: race } = await supabase
    .from("race_events")
    .select("name, city, country, season_year")
    .eq("slug", params.slug)
    .single();

  if (!race) return {};

  const title = `${race.name} ${race.season_year} — Travel Guide & Fan Chat | LightsNGo`;
  const description = `Where to stay, how to get around, and where to eat for the ${race.season_year} ${race.name} in ${race.city}, ${race.country} — tips from fans who've actually been, plus a live race-day chat room.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function RaceHubPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: race } = await supabase
    .from("race_events")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!race) notFound();

  const { data: entries } = await supabase
    .from("guide_entries")
    .select(
      "id, category, title, content, created_at, author_id, author:profiles!author_id(username, avatar_url), replies:guide_replies!guide_entry_id(id, content, created_at, author_id, author:profiles!author_id(username, avatar_url))"
    )
    .eq("race_event_id", race.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-flag-amber">
            {race.season_year} season
          </p>
          <h1 className="mt-1 font-display text-3xl font-700 text-paper">
            {race.name}
          </h1>
          <p className="mt-1 text-sm text-paper/60">
            {race.city}, {race.country}
            {race.race_date &&
              ` · ${new Date(race.race_date).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}`}
          </p>
        </div>
        {user ? (
          <Link
            href={`/races/${race.slug}/chat`}
            className="whitespace-nowrap rounded-sm bg-flag-red px-4 py-2 text-sm font-medium text-paper hover:bg-flag-red/90"
          >
            Open chat room
          </Link>
        ) : (
          <Link
            href="/login"
            className="whitespace-nowrap rounded-sm border border-asphalt-600 px-4 py-2 text-sm font-medium text-paper hover:border-flag-red"
          >
            Log in for chat
          </Link>
        )}
      </div>

      <p className="mt-6 rounded-sm border border-asphalt-700 bg-asphalt-900 p-3 text-xs text-paper/50">
        Prices near race weekend spike hard — these tips are for {race.season_year}
        specifically, from people actually going. Book early.
      </p>

      <GuideBrowser
        raceEventId={race.id}
        userId={user?.id ?? null}
        entries={(entries as any) ?? []}
      />
    </div>
  );
}
