"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The /auth/callback route already exchanged the email link's code
    // for a real (temporary "recovery") session by the time we get here.
    // We just confirm one exists before letting the form submit.
    supabase.auth.getUser().then(({ data }) => {
      setReady(!!data.user);
      if (!data.user) {
        setError(
          "This reset link is invalid or has expired. Please request a new one."
        );
      }
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/feed");
      router.refresh();
    }, 1500);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-700 text-paper">
          Password updated
        </h1>
        <p className="mt-3 text-sm text-paper/60">Taking you to your feed…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-3xl font-700 text-paper">
        Set a new password
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-paper/70">
            New password
          </label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            minLength={8}
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-paper/70">
            Confirm new password
          </label>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            minLength={8}
          />
        </div>

        {error && <p className="text-sm text-flag-red">{error}</p>}

        <button
          type="submit"
          disabled={loading || !ready}
          className="mt-2 rounded-sm bg-flag-red px-4 py-2.5 font-medium text-paper hover:bg-flag-red/90 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
