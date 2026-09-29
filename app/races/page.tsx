import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RacesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: races } = await supabase
    .from("race_events")
    .select("slug, name, city, country, season_year, race_date")
    .order("race_date", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-700 text-paper">
        Race weekends
      </h1>
      <p className="mt-1 text-sm text-paper/60">
        Each race has its own chat room and a city guide written by fans
        who&rsquo;ve actually been.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {races?.map((race) => (
          <Link
            key={race.slug}
            href={`/races/${race.slug}`}
            className="flex items-center justify-between rounded-sm border border-asphalt-700 bg-asphalt-900 px-4 py-3 hover:border-flag-red"
          >
            <div>
              <p className="font-display text-lg font-600 text-paper">
                {race.name}
              </p>
              <p className="text-sm text-paper/60">
                {race.city}, {race.country}
              </p>
            </div>
            <span className="font-mono text-xs text-paper/50">
              {race.race_date
                ? new Date(race.race_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : race.season_year}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
