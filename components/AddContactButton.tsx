"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddContactButton({
  userId,
  otherId,
}: {
  userId: string;
  otherId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendRequest() {
    setSending(true);
    setError(null);
    const { error: insertError } = await supabase
      .from("contacts")
      .insert({ requester_id: userId, recipient_id: otherId });
    setSending(false);
    if (insertError) {
      setError("Couldn't send the request. Please try again.");
      return;
    }
    setSent(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={sendRequest}
        disabled={sending || sent}
        className="rounded-sm bg-flag-amber px-4 py-2 text-sm font-medium text-asphalt-950 hover:bg-flag-amber/90 disabled:opacity-50"
      >
        {sent ? "Request sent" : sending ? "Sending…" : "Add contact"}
      </button>
      {error && <p className="text-xs text-flag-red">{error}</p>}
    </div>
  );
}
