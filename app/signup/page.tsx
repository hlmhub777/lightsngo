"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError(
        "You need to confirm you're 18+ and accept the Terms and Privacy Policy to continue."
      );
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          age_confirmed_18: true,
          terms_accepted: true,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-3xl font-700 text-paper">
        Join LightsNGo
      </h1>
      <p className="mt-1 text-sm text-paper/60">
        Set up your profile in a minute — you can add your team, tracks
        visited, and photo after this.
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
          <label className="mb-1 block text-sm text-paper/70">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-paper outline-none focus:border-flag-red"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-paper/70">Password</label>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-paper outline-none focus:border-flag-red"
            placeholder="At least 6 characters"
          />
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
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-paper/60">
        Already have an account?{" "}
        <Link href="/login" className="text-flag-amber hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
