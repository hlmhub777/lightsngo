"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/authErrors";

// Same rules as the email signup form.
const LATEST_ALLOWED_YEAR = new Date().getFullYear() - 18;
const EARLIEST_YEAR = 1920;
const BIRTH_YEARS = Array.from(
  { length: LATEST_ALLOWED_YEAR - EARLIEST_YEAR + 1 },
  (_, i) => LATEST_ALLOWED_YEAR - i
);

// Shown once to people who joined with Google, so everyone on LightsNGo
// has confirmed they're 18+ and accepted the Terms, like email sign-ups do.
export default function CompleteProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, birth_year")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.username) setUsername(profile.username);
      if (profile?.birth_year) setBirthYear(String(profile.birth_year));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const name = username.trim();
    if (name.length < 3 || name.length > 30 || !/^[a-zA-Z0-9_.]+$/.test(name)) {
      setError("Usernames need 3–30 characters: letters, numbers, _ or . only.");
      return;
    }
    const year = Number(birthYear);
    if (!birthYear || year < EARLIEST_YEAR || year > LATEST_ALLOWED_YEAR) {
      setError("Please choose your birth year. You need to be 18 or older to join.");
      return;
    }
    if (!agreed) {
      setError("You need to confirm you're 18+ and accept the Terms and Privacy Policy to continue.");
      return;
    }
    if (!userId) return;

    setLoading(true);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: name,
        birth_year: year,
        age_confirmed_18: true,
        terms_accepted_at: new Date().toISOString(),
      })
      .eq("id", userId);
    setLoading(false);

    if (updateError) {
      setError(friendlyAuthError(updateError));
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  async function handleCancel() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-3xl font-700 text-paper">One last step</h1>
      <p className="mt-1 text-sm text-paper/60">
        Pick your username and confirm you&rsquo;re 18+ to join LightsNGo.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-paper/70">Username</label>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-paper outline-none focus:border-flag-red"
            placeholder="scuderia_sam"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-paper/70">Birth year</label>
          <select
            required
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="w-full rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-paper outline-none focus:border-flag-red"
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
          <p className="mt-1 text-xs text-paper/50">
            Used to confirm you&rsquo;re 18+. It appears on your profile for other members.
          </p>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-paper/70">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-flag-red"
          />
          <span>
            I confirm I&rsquo;m 18 or older and agree to the{" "}
            <Link href="/terms" className="text-flag-amber hover:underline" target="_blank">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-flag-amber hover:underline" target="_blank">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && <p className="text-sm text-flag-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-sm bg-flag-red px-4 py-2.5 font-medium text-paper hover:bg-flag-red/90 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Continue"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-sm text-paper/50 hover:underline"
        >
          Not now — log me out
        </button>
      </form>
    </div>
  );
}
