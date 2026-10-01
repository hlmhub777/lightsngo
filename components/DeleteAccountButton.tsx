"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteAccountButton({
  username,
}: {
  username: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc("delete_user_account");

    if (rpcError) {
      setDeleting(false);
      setError(rpcError.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!open) {
    return (
      <div className="mt-10 border-t border-asphalt-800 pt-6">
        <h2 className="font-display text-sm font-600 text-paper/60">
          Danger zone
        </h2>
        <button
          onClick={() => setOpen(true)}
          className="mt-2 rounded-sm border border-asphalt-600 px-3 py-1.5 text-sm text-paper/60 hover:border-flag-red hover:text-flag-red"
        >
          Delete my account
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-sm border border-flag-red/40 bg-flag-red/5 p-4">
      <h2 className="font-display text-sm font-600 text-flag-red">
        Delete your account
      </h2>
      <p className="mt-1 text-sm text-paper/70">
        This permanently deletes your account, profile, posts, comments,
        contacts, and messages. This can&rsquo;t be undone.
      </p>
      <p className="mt-3 text-sm text-paper/70">
        Type <span className="font-mono text-paper">{username}</span> below
        to confirm.
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={username}
        className="mt-2 w-full rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
      />

      {error && <p className="mt-2 text-sm text-flag-red">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            setOpen(false);
            setConfirmText("");
            setError(null);
          }}
          className="px-3 py-1.5 text-sm text-paper/60 hover:text-paper"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={confirmText !== username || deleting}
          className="rounded-sm bg-flag-red px-4 py-1.5 text-sm font-medium text-paper hover:bg-flag-red/90 disabled:opacity-40"
        >
          {deleting ? "Deleting…" : "Permanently delete my account"}
        </button>
      </div>
    </div>
  );
}
