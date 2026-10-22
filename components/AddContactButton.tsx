"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_NOTE = 200;

export default function AddContactButton({
  userId,
  otherId,
  otherName,
}: {
  userId: string;
  otherId: string;
  otherName?: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendRequest() {
    setSending(true);
    setError(null);
    const trimmed = note.trim().slice(0, MAX_NOTE);
    const { error: insertError } = await supabase.from("contacts").insert({
      requester_id: userId,
      recipient_id: otherId,
      note: trimmed || null,
    });
    setSending(false);
    if (insertError) {
      setError("Couldn't send the request. Please try again.");
      return;
    }
    setSent(true);
    setOpen(false);
    router.refresh();
  }

  if (sent) {
    return (
      <span className="rounded-sm border border-asphalt-600 px-4 py-2 text-sm text-paper/60">
        Request sent
      </span>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-sm bg-flag-amber px-4 py-2 text-sm font-medium text-asphalt-950 hover:bg-flag-amber/90"
      >
        Add contact
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-sm border border-asphalt-700 bg-asphalt-900 p-3">
      <label htmlFor="contact-note" className="text-sm text-paper/80">
        Add a short note{otherName ? ` for ${otherName}` : ""}{" "}
        <span className="text-paper/40">(optional)</span>
      </label>
      <textarea
        id="contact-note"
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
        rows={2}
        placeholder="Hi! I'm going to Monza too — which grandstand are you in?"
        className="w-full resize-none rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-paper/40">
          {note.length}/{MAX_NOTE}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setOpen(false);
              setNote("");
              setError(null);
            }}
            className="rounded-sm border border-asphalt-600 px-3 py-1.5 text-sm text-paper/70 hover:border-paper/50"
          >
            Cancel
          </button>
          <button
            onClick={sendRequest}
            disabled={sending}
            className="rounded-sm bg-flag-amber px-3 py-1.5 text-sm font-medium text-asphalt-950 hover:bg-flag-amber/90 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send request"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-flag-red">{error}</p>}
    </div>
  );
}
