import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RacesList from "@/components/RacesList";

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

      <RacesList races={races ?? []} />
    </div>
  );
}
