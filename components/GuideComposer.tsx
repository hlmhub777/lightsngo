"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  { value: "transport", label: "Transport" },
  { value: "hotel", label: "Hotel" },
  { value: "food", label: "Food" },
  { value: "nightlife", label: "Nightlife" },
] as const;

// Years someone could have visited: this year back 25 seasons.
const THIS_YEAR = new Date().getFullYear();
const VISIT_YEARS = Array.from({ length: 26 }, (_, i) => THIS_YEAR - i);

export default function GuideComposer({
  raceEventId,
  userId,
}: {
  raceEventId: string;
  userId: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]["value"]>("transport");
  const [visitYear, setVisitYear] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!visitYear) {
      setError("Please choose the year you went.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError("Please add a title and your tip.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from("guide_entries").insert({
      race_event_id: raceEventId,
      author_id: userId,
      category,
      visit_year: Number(visitYear),
      title: title.trim(),
      content: content.trim(),
    });
    setSaving(false);
    if (!insertError) {
      setTitle("");
      setContent("");
      setVisitYear("");
      setOpen(false);
      router.refresh();
    } else {
      setError("Couldn't save your tip. Please try again.");
    }
  }

  if (!userId) {
    return (
      <a
        href="/login"
        className="rounded-sm border border-dashed border-asphalt-600 px-3 py-1.5 text-sm text-paper/50 hover:border-flag-amber hover:text-flag-amber"
      >
        Log in to add a tip
      </a>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-sm border border-dashed border-asphalt-600 px-3 py-1.5 text-sm text-paper/70 hover:border-flag-amber hover:text-flag-amber"
      >
        + Add a tip
      </button>
    );
  }

  return (
    <div className="rounded-sm border border-asphalt-700 bg-asphalt-900 p-4">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`rounded-sm border px-2.5 py-1 text-xs font-mono uppercase tracking-wide ${
              category === c.value
                ? "border-flag-amber text-flag-amber"
                : "border-asphalt-600 text-paper/60"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-paper/60">
          When did you go?
        </span>
        <select
          value={visitYear}
          onChange={(e) => {
            setVisitYear(e.target.value);
            setError(null);
          }}
          className="w-full rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
        >
          <option value="" disabled>
            Choose the year of your visit
          </option>
          {VISIT_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Short title, e.g. 'Skip the taxi line, take the shuttle'"
        className="mt-3 w-full rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="The actual tip — be specific. Prices help, but say they're from your visit."
        className="mt-2 w-full resize-none rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
      />
      {error && <p className="mt-2 text-sm text-flag-red">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="px-3 py-1.5 text-sm text-paper/60 hover:text-paper"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-sm bg-flag-amber px-4 py-1.5 text-sm font-medium text-asphalt-950 hover:bg-flag-amber/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save tip"}
        </button>
      </div>
    </div>
  );
}
