"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Race = {
  slug: string;
  name: string;
  city: string;
  country: string;
  season_year: number;
  race_date: string | null;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Extra words people type when searching (abbreviations, nicknames,
// track names). Keys are a country or city as stored in race_events,
// written without accents and in lowercase.
const SEARCH_ALIASES: Record<string, string[]> = {
  // countries
  "united states": ["usa", "us", "u.s.", "u.s.a.", "america", "american", "states"],
  "united kingdom": ["uk", "britain", "great britain", "gb", "england", "british"],
  "great britain": ["uk", "britain", "united kingdom", "gb", "england", "british"],
  "united arab emirates": ["uae", "emirates"],
  "saudi arabia": ["saudi", "ksa"],
  "netherlands": ["holland", "dutch"],
  "mexico": ["mex"],
  "brazil": ["brasil"],
  "spain": ["espana"],
  "italy": ["italia"],
  "monaco": ["monte carlo"],
  // cities / circuits
  "austin": ["texas", "cota", "circuit of the americas"],
  "miami": ["florida"],
  "las vegas": ["vegas", "nevada"],
  "mexico city": ["cdmx", "hermanos rodriguez"],
  "sao paulo": ["interlagos"],
  "abu dhabi": ["yas marina", "uae"],
  "jeddah": ["saudi"],
  "lusail": ["doha", "qatar"],
  "sakhir": ["bahrain"],
  "silverstone": ["uk", "britain", "british"],
  "spielberg": ["red bull ring", "austria"],
  "spa": ["spa-francorchamps", "belgium"],
  "spa-francorchamps": ["spa", "belgium"],
  "zandvoort": ["holland", "dutch"],
  "monza": ["italia"],
  "imola": ["italia"],
  "baku": ["azerbaijan"],
  "suzuka": ["japan"],
  "shanghai": ["china"],
  "melbourne": ["australia", "albert park"],
  "montreal": ["canada"],
  "barcelona": ["catalunya", "spain"],
  "madrid": ["madring", "spain"],
  "budapest": ["hungaroring", "hungary"],
  "singapore": ["marina bay"],
};

// Lowercase and strip accents, so "Sao Paulo" finds "São Paulo".
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function searchText(race: Race) {
  const city = normalize(race.city);
  const country = normalize(race.country);
  return [
    normalize(race.name),
    city,
    country,
    ...(SEARCH_ALIASES[city] ?? []),
    ...(SEARCH_ALIASES[country] ?? []),
  ].join(" | ");
}

export default function RacesList({ races }: { races: Race[] }) {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState<string>("all");

  const monthsPresent = useMemo(() => {
    const set = new Set<number>();
    races.forEach((r) => {
      if (r.race_date) set.add(new Date(r.race_date).getMonth());
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [races]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return races.filter((r) => {
      const matchesQuery = !q || searchText(r).includes(q);

      const matchesMonth =
        month === "all" ||
        (r.race_date && new Date(r.race_date).getMonth() === Number(month));

      return matchesQuery && matchesMonth;
    });
  }, [races, query, month]);

  return (
    <div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by race, city, or country…"
          className="flex-1 rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
        />
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red sm:w-48"
        >
          <option value="all">All months</option>
          {monthsPresent.map((m) => (
            <option key={m} value={m}>
              {MONTHS[m]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filtered.length > 0 ? (
          filtered.map((race) => (
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
          ))
        ) : (
          <p className="rounded-sm border border-dashed border-asphalt-600 p-6 text-center text-sm text-paper/50">
            No races match that search.
          </p>
        )}
      </div>
    </div>
  );
}
