import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://lightsngo.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const { data: races } = await supabase
    .from("race_events")
    .select("slug")
    .order("race_date", { ascending: true });

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/races`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const racePages: MetadataRoute.Sitemap = (races ?? []).map((race) => ({
    url: `${BASE_URL}/races/${race.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...racePages];
}
