"use client";

import { useMemo, useState } from "react";
import GuideComposer from "@/components/GuideComposer";
import GuideEntryCard, { type Entry } from "@/components/GuideEntryCard";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "transport", label: "Getting around" },
  { key: "hotel", label: "Where to stay" },
  { key: "food", label: "Where to eat" },
  { key: "nightlife", label: "Nightlife" },
];

type SortKey = "recent_visit" | "newest" | "oldest";

export default function GuideBrowser({
  raceEventId,
  userId,
  entries,
}: {
  raceEventId: string;
  userId: string | null;
  entries: Entry[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent_visit");
  const [year, setYear] = useState<number | "all">("all");

  // Years that actually have tips, newest first.
  const years = useMemo(() => {
    const set = new Set<number>();
    entries.forEach((e) => {
      if (e.visit_year) set.add(e.visit_year);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = entries.filter((e) => {
      if (year !== "all" && e.visit_year !== year) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        (e.author?.username ?? "").toLowerCase().includes(q)
      );
    });
    result = [...result].sort((a, b) => {
      const byDate =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest") return -byDate;
      if (sort === "newest") return byDate;
      // Most recent visit first, then newest posted.
      const byYear = (b.visit_year ?? 0) - (a.visit_year ?? 0);
      return byYear !== 0 ? byYear : byDate;
    });
    return result;
  }, [entries, query, sort, year]);

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: filtered.filter((e) => e.category === cat.key),
  }));

  const filtering = query.trim().length > 0 || year !== "all";

  return (
    <div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tips (hotel names, areas, keywords)…"
          className="flex-1 rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red sm:w-48"
        >
          <option value="recent_visit">Most recent visit</option>
          <option value="newest">Newest tips</option>
          <option value="oldest">Oldest tips</option>
        </select>
      </div>

      {years.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(["all", ...years] as const).map((y) => {
            const active = year === y;
            return (
              <button
                key={String(y)}
                type="button"
                onClick={() => setYear(y)}
                className={`rounded-sm border px-2.5 py-1 font-mono text-xs ${
                  active
                    ? "border-flag-amber text-flag-amber"
                    : "border-asphalt-600 text-paper/60 hover:text-paper"
                }`}
              >
                {y === "all" ? "All years" : y}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-8">
        {grouped.map((group) => (
          <section key={group.key}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-600 text-paper">
                {group.label}
              </h2>
              <GuideComposer raceEventId={raceEventId} userId={userId} />
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {group.items.length > 0 ? (
                group.items.map((item) => (
                  <GuideEntryCard key={item.id} item={item} userId={userId} />
                ))
              ) : (
                <p className="text-sm text-paper/40">
                  {filtering ? "No tips match that filter." : "No tips yet."}
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
