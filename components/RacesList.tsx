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
    const q = query.trim().toLowerCase();
    return races.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q);

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
