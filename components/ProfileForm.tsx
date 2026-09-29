"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  country: string | null;
  gender: string | null;
  birth_year: number | null;
  favorite_team: string | null;
  favorite_driver: string | null;
  tracks_visited: string[] | null;
  bio: string | null;
};

const TEAMS = [
  "Red Bull Racing",
  "Ferrari",
  "Mercedes",
  "McLaren",
  "Aston Martin",
  "Alpine",
  "Williams",
  "RB",
  "Kick Sauber",
  "Haas",
];

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState({
    username: profile.username ?? "",
    country: profile.country ?? "",
    gender: profile.gender ?? "",
    birth_year: profile.birth_year ?? "",
    favorite_team: profile.favorite_team ?? "",
    favorite_driver: profile.favorite_driver ?? "",
    tracks_visited: (profile.tracks_visited ?? []).join(", "),
    bio: profile.bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: form.username,
        country: form.country || null,
        gender: form.gender || null,
        birth_year: form.birth_year ? Number(form.birth_year) : null,
        favorite_team: form.favorite_team || null,
        favorite_driver: form.favorite_driver || null,
        tracks_visited: form.tracks_visited
          ? form.tracks_visited.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        bio: form.bio || null,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Username">
        <input
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Country">
          <input
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className="input"
            placeholder="Romania"
          />
        </Field>
        <Field label="Gender">
          <select
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
            className="input"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <Field label="Birth year">
        <input
          type="number"
          value={form.birth_year}
          onChange={(e) => update("birth_year", e.target.value)}
          className="input"
          placeholder="1995"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Team you support">
          <select
            value={form.favorite_team}
            onChange={(e) => update("favorite_team", e.target.value)}
            className="input"
          >
            <option value="">Choose a team</option>
            {TEAMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Favorite driver">
          <input
            value={form.favorite_driver}
            onChange={(e) => update("favorite_driver", e.target.value)}
            className="input"
            placeholder="e.g. Charles Leclerc"
          />
        </Field>
      </div>

      <Field label="Tracks you've been to (comma-separated)">
        <input
          value={form.tracks_visited}
          onChange={(e) => update("tracks_visited", e.target.value)}
          className="input"
          placeholder="Monza, Spa, Monaco"
        />
      </Field>

      <Field label="Bio">
        <textarea
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          rows={3}
          className="input resize-none"
        />
      </Field>

      <div className="mt-1 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-sm bg-flag-red px-4 py-2 text-sm font-medium text-paper hover:bg-flag-red/90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        {saved && <span className="text-sm text-signal-green">Saved.</span>}
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 3px;
          border: 1px solid #3a4250;
          background: #0b0e11;
          padding: 0.5rem 0.75rem;
          color: #f3f1ec;
          outline: none;
        }
        .input:focus {
          border-color: #e10600;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-paper/70">{label}</span>
      {children}
    </label>
  );
}
