"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AvatarUpload from "@/components/AvatarUpload";

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

// Same rule as sign-up: 18+ by birth year.
const LATEST_ALLOWED_YEAR = new Date().getFullYear() - 18;
const EARLIEST_YEAR = 1920;
const BIRTH_YEARS = Array.from(
  { length: LATEST_ALLOWED_YEAR - EARLIEST_YEAR + 1 },
  (_, i) => LATEST_ALLOWED_YEAR - i
);

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();

  const [form, setForm] = useState({
    username: profile.username ?? "",
    country: profile.country ?? "",
    gender: profile.gender ?? "",
    birth_year: profile.birth_year ? String(profile.birth_year) : "",
    favorite_team: profile.favorite_team ?? "",
    favorite_driver: profile.favorite_driver ?? "",
    tracks_visited: (profile.tracks_visited ?? []).join(", "),
    bio: profile.bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingBirthYear = !profile.birth_year;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
    setError(null);
  }

  async function handleSave() {
    setError(null);

    const year = Number(form.birth_year);
    if (!form.birth_year || year < EARLIEST_YEAR || year > LATEST_ALLOWED_YEAR) {
      setError("Please choose your birth year. LightsNGo is for people aged 18 and over.");
      return;
    }

    if (!form.username.trim()) {
      setError("Please enter a username.");
      return;
    }

    setSaving(true);
    const { error: saveError } = await supabase
      .from("profiles")
      .update({
        username: form.username.trim(),
        country: form.country || null,
        gender: form.gender || null,
        birth_year: year,
        favorite_team: form.favorite_team || null,
        favorite_driver: form.favorite_driver || null,
        tracks_visited: form.tracks_visited
          ? form.tracks_visited.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        bio: form.bio || null,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (saveError) {
      if (saveError.code === "23505") {
        setError("That username is already taken. Please choose another one.");
      } else if (saveError.message.toLowerCase().includes("birth year")) {
        setError("Please choose a valid birth year. You need to be 18 or older.");
      } else {
        setError("Couldn't save your profile. Please try again.");
      }
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {missingBirthYear && (
        <p className="rounded-sm border border-flag-amber/40 bg-flag-amber/5 px-3 py-2 text-sm text-paper/80">
          Please add your birth year below. It&rsquo;s required to confirm
          you&rsquo;re 18 or older.
        </p>
      )}

      <AvatarUpload
        userId={profile.id}
        username={form.username || profile.username}
        currentAvatarUrl={profile.avatar_url}
      />

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
            placeholder="Your country"
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
        <select
          required
          value={form.birth_year}
          onChange={(e) => update("birth_year", e.target.value)}
          className="input"
        >
          <option value="" disabled>
            Choose your birth year
          </option>
          {BIRTH_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-paper/50">
          Required to confirm you&rsquo;re 18+.
        </span>
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
            placeholder="Your favorite driver"
          />
        </Field>
      </div>

      <Field label="Tracks you've been to">
        <input
          value={form.tracks_visited}
          onChange={(e) => update("tracks_visited", e.target.value)}
          className="input"
          placeholder="Tracks you've visited, separated by commas"
        />
      </Field>

      <Field label="Bio">
        <textarea
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
          rows={3}
          className="input resize-none"
          placeholder="A few words about you as a fan"
        />
      </Field>

      {error && <p className="text-sm text-flag-red">{error}</p>}

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
