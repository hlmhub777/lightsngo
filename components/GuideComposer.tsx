"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Years someone could have visited: this year back 25 seasons.
const THIS_YEAR = new Date().getFullYear();
const VISIT_YEARS = Array.from({ length: 26 }, (_, i) => THIS_YEAR - i);

const TITLE_EXAMPLES: Record<string, string> = {
  transport: "e.g. 'Skip the taxi line, take the shuttle'",
  hotel: "e.g. 'Quiet hotel, 10 min walk to the shuttle'",
  food: "e.g. 'Best late-night food near the circuit'",
  nightlife: "e.g. 'Rooftop bar where fans meet after qualifying'",
};

export default function GuideComposer({
  raceEventId,
  userId,
  category,
  categoryLabel,
  onClose,
}: {
  raceEventId: string;
  userId: string;
  category: string;
  categoryLabel: string;
  onClose: () => void;
}) {
  const supabase = createClient();
  const router = useRouter();
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
    if (insertError) {
      setError("Couldn't save your tip. Please try again.");
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div className="mt-3 rounded-sm border border-asphalt-700 bg-asphalt-900 p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-flag-amber">
        New tip · {categoryLabel}
      </p>

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
        placeholder={`Short title, ${TITLE_EXAMPLES[category] ?? "e.g. 'What worked for you'"}`}
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
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-paper/60 hover:text-paper"
        >
          Cancel
        </button>
        <button
          type="button"
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
