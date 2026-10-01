import { createClient } from "@/lib/supabase/server";
import RacesList from "@/components/RacesList";

export const metadata = {
  title: "2027 F1 Race Calendar — LightsNGo",
  description:
    "Every 2027 Formula 1 race weekend, with fan-written city guides covering transport, hotels, food, and nightlife for each Grand Prix — plus a live race-day chat room.",
};

export default async function RacesPage() {
  const supabase = createClient();

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

      <RacesList races={races ?? []} />
    </div>
  );
}
