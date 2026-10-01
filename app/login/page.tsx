"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Captcha from "@/components/Captcha";

const CAPTCHA_ENABLED = !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (CAPTCHA_ENABLED && !captchaToken) {
      setError("Please complete the verification check below.");
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken: captchaToken ?? undefined },
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-3xl font-700 text-paper">Log in</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-paper/70">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-paper outline-none focus:border-flag-red"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-paper/70">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm border border-asphalt-600 bg-asphalt-900 px-3 py-2 text-paper outline-none focus:border-flag-red"
          />
        </div>

        <Captcha
          onVerify={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
        />

        {error && <p className="text-sm text-flag-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-sm bg-flag-red px-4 py-2.5 font-medium text-paper hover:bg-flag-red/90 disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-paper/60">
        New here?{" "}
        <Link href="/signup" className="text-flag-amber hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
