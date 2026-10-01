"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Captcha, { type CaptchaHandle } from "@/components/Captcha";

const CAPTCHA_ENABLED = !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<CaptchaHandle>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (CAPTCHA_ENABLED && !captchaToken) {
      setError("Please complete the verification check below.");
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        captchaToken: captchaToken ?? undefined,
      }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      setCaptchaToken(null);
      captchaRef.current?.reset();
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-700 text-paper">
          Check your email
        </h1>
        <p className="mt-3 text-sm text-paper/60">
          If an account exists for {email}, we&rsquo;ve sent a link to reset
          your password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-flag-amber hover:underline"
        >
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-3xl font-700 text-paper">
        Reset your password
      </h1>
      <p className="mt-1 text-sm text-paper/60">
        Enter the email you signed up with and we&rsquo;ll send you a link to
        set a new password.
      </p>

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

        <Captcha
          ref={captchaRef}
          onVerify={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
        />

        {error && <p className="text-sm text-flag-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-sm bg-flag-red px-4 py-2.5 font-medium text-paper hover:bg-flag-red/90 disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-sm text-paper/60">
        <Link href="/login" className="text-flag-amber hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
