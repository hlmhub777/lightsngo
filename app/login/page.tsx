"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Captcha, { type CaptchaHandle } from "@/components/Captcha";
import PasswordInput from "@/components/PasswordInput";
import GoogleButton from "@/components/GoogleButton";
import { friendlyAuthError } from "@/lib/authErrors";

const CAPTCHA_ENABLED = !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const captchaRef = useRef<CaptchaHandle>(null);

  // Errors passed back from the Google sign-in callback (?error=...).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("error");
    if (e) setError(friendlyAuthError({ code: e, message: e }));
  }, []);

  async function resendConfirmation() {
    setInfo(null);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (resendError) setError(friendlyAuthError(resendError));
    else setInfo("We sent you a new confirmation email. Check your inbox (and spam).");
  }

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
      setNeedsConfirm(signInError.code === "email_not_confirmed" ||
        /email not confirmed/i.test(signInError.message));
      setError(friendlyAuthError(signInError));
      setCaptchaToken(null);
      captchaRef.current?.reset();
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-3xl font-700 text-paper">Log in</h1>

      <div className="mt-8">
        <GoogleButton label="Log in with Google" onError={setError} />
        <div className="my-6 flex items-center gap-3 text-xs text-paper/40">
          <span className="h-px flex-1 bg-asphalt-600" />
          or with email
          <span className="h-px flex-1 bg-asphalt-600" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm text-paper/70">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-flag-amber hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput value={password} onChange={setPassword} />
        </div>

        <Captcha
          ref={captchaRef}
          onVerify={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
        />

        {error && <p className="text-sm text-flag-red">{error}</p>}
        {needsConfirm && email && (
          <button
            type="button"
            onClick={resendConfirmation}
            className="self-start text-sm text-flag-amber hover:underline"
          >
            Resend confirmation email
          </button>
        )}
        {info && <p className="text-sm text-paper/70">{info}</p>}

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
