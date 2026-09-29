import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GuideComposer from "@/components/GuideComposer";

const CATEGORY_LABELS: Record<string, string> = {
  transport: "Getting around",
  hotel: "Where to stay",
  food: "Where to eat",
  nightlife: "Nightlife",
};

export default async function RaceHubPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: race } = await supabase
    .from("race_events")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!race) notFound();

  const { data: entries } = await supabase
    .from("guide_entries")
    .select("id, category, title, content, author:profiles(username)")
    .eq("race_event_id", race.id)
    .order("created_at", { ascending: false });

  const grouped = Object.keys(CATEGORY_LABELS).map((cat) => ({
    key: cat,
    label: CATEGORY_LABELS[cat],
    items: (entries ?? []).filter((e: any) => e.category === cat),
  }));

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
        <Link
          href={`/races/${race.slug}/chat`}
          className="whitespace-nowrap rounded-sm bg-flag-red px-4 py-2 text-sm font-medium text-paper hover:bg-flag-red/90"
        >
          Open chat room
        </Link>
      </div>

      <p className="mt-6 rounded-sm border border-asphalt-700 bg-asphalt-900 p-3 text-xs text-paper/50">
        Prices near race weekend spike hard — these tips are for {race.season_year}
        specifically, from people actually going. Book early.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {grouped.map((group) => (
          <section key={group.key}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-600 text-paper">
                {group.label}
              </h2>
              <GuideComposer raceEventId={race.id} userId={user.id} />
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {group.items.length > 0 ? (
                group.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-sm border border-asphalt-700 bg-asphalt-900 p-3"
                  >
                    <p className="text-sm font-medium text-paper">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-paper/70">
                      {item.content}
                    </p>
                    <p className="mt-2 font-mono text-[11px] text-paper/40">
                      — {item.author?.username ?? "a fan"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-paper/40">No tips yet.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
