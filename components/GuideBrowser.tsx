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
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = entries.filter((e) => {
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        (e.author?.username ?? "").toLowerCase().includes(q)
      );
    });
    result = [...result].sort((a, b) => {
      const diff =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sort === "newest" ? -diff : diff;
    });
    return result;
  }, [entries, query, sort]);

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: filtered.filter((e) => e.category === cat.key),
  }));

  const searching = query.trim().length > 0;

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
          onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
          className="rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red sm:w-40"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

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
                  {searching ? "No tips match that search." : "No tips yet."}
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
