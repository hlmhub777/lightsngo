"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Result = { id: string; username: string; favorite_team: string | null };

export default function AddContactSearch({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, favorite_team")
      .ilike("username", `%${query.trim()}%`)
      .neq("id", userId)
      .limit(10);
    setSearching(false);
    setResults(data ?? []);
  }

  async function sendRequest(recipientId: string) {
    setError(null);
    const { error: insertError } = await supabase
      .from("contacts")
      .insert({ requester_id: userId, recipient_id: recipientId });
    if (!insertError) {
      setSentTo((prev) => [...prev, recipientId]);
      router.refresh();
    } else {
      setError(insertError.message);
    }
  }

  return (
    <div className="rounded-sm border border-asphalt-700 bg-asphalt-900 p-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Find a fan by username…"
          className="flex-1 rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
        />
        <button
          onClick={handleSearch}
          className="rounded-sm border border-asphalt-600 px-3 py-2 text-sm text-paper/80 hover:border-paper/50"
        >
          {searching ? "…" : "Search"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-flag-red">{error}</p>}

      {results.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {results.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-sm border border-asphalt-700 px-3 py-2"
            >
              <div>
                <p className="text-sm text-paper">{r.username}</p>
                {r.favorite_team && (
                  <p className="text-xs text-paper/50">{r.favorite_team}</p>
                )}
              </div>
              <button
                onClick={() => sendRequest(r.id)}
                disabled={sentTo.includes(r.id)}
                className="rounded-sm bg-flag-amber px-3 py-1 text-xs font-medium text-asphalt-950 hover:bg-flag-amber/90 disabled:opacity-50"
              >
                {sentTo.includes(r.id) ? "Sent" : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
