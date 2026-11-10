"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Remove contact / Block user, shown on a fan's profile page.
// Uses the same database functions as the menu inside a conversation.
export default function ContactActions({
  otherId,
  otherName,
  isContact,
}: {
  otherId: string;
  otherName: string;
  isContact: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function removeContact() {
    const ok = window.confirm(
      `Remove ${otherName} from your contacts? You won't be able to message each other anymore, and your conversation will be deleted for you.`
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("remove_contact", {
      other_id: otherId,
    });
    setBusy(false);
    if (rpcError) {
      setError("Couldn't remove this contact. Please try again.");
      return;
    }
    router.refresh();
  }

  async function blockUser() {
    const ok = window.confirm(
      `Block ${otherName}? They won't be able to message you or add you as a contact, you won't see their posts, tips or chat messages, and your conversation will be deleted for you. They won't be notified. You can unblock them later from your profile.`
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc("block_user", {
      other_id: otherId,
    });
    setBusy(false);
    if (rpcError) {
      setError("Couldn't block this user. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-4">
        {isContact && (
          <button
            type="button"
            onClick={removeContact}
            disabled={busy}
            className="text-xs text-paper/40 hover:text-flag-red disabled:opacity-50"
          >
            Remove contact
          </button>
        )}
        <button
          type="button"
          onClick={blockUser}
          disabled={busy}
          className="text-xs text-paper/40 hover:text-flag-red disabled:opacity-50"
        >
          Block
        </button>
      </div>
      {error && <p className="text-xs text-flag-red">{error}</p>}
    </div>
  );
}
