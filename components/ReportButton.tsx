"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type ReportContentType =
  | "post"
  | "comment"
  | "chat_message"
  | "guide_entry"
  | "guide_reply"
  | "direct_message"
  | "user";

const REASONS: { key: string; label: string }[] = [
  { key: "spam", label: "Spam or scam" },
  { key: "harassment", label: "Harassment or bullying" },
  { key: "hate", label: "Hate speech" },
  { key: "sexual", label: "Sexual content" },
  { key: "violence", label: "Violence or threats" },
  { key: "illegal", label: "Illegal content" },
  { key: "underage", label: "This person may be under 18" },
  { key: "other", label: "Something else" },
];

export default function ReportButton({
  contentType,
  contentId,
  reportedUserId,
  reportedUsername,
  snapshot,
  className,
  children,
}: {
  contentType: ReportContentType;
  contentId?: string | null;
  reportedUserId: string;
  reportedUsername?: string;
  snapshot?: string | null;
  className?: string;
  children?: React.ReactNode;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    setReason("");
    setDetails("");
    setSent(false);
    setError(null);
  }

  async function submit() {
    if (!reason) {
      setError("Please choose a reason.");
      return;
    }
    setSending(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSending(false);
      setError("Please log in to report.");
      return;
    }

    const { error: insertError } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      content_type: contentType,
      content_id: contentId ?? null,
      content_snapshot: snapshot ? snapshot.slice(0, 4000) : null,
      reason,
      details: details.trim() ? details.trim().slice(0, 1000) : null,
    });

    setSending(false);
    if (insertError) {
      setError("Couldn't send your report. Please try again.");
      return;
    }
    setSent(true);
  }

  const what =
    contentType === "user"
      ? reportedUsername ?? "this user"
      : `this ${
          {
            post: "post",
            comment: "comment",
            chat_message: "message",
            guide_entry: "tip",
            guide_reply: "reply",
            direct_message: "message",
          }[contentType]
        }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ?? "text-[11px] text-paper/30 hover:text-flag-amber"
        }
      >
        {children ?? "Report"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-sm border border-asphalt-700 bg-asphalt-900 p-4 text-left"
          >
            {sent ? (
              <>
                <h2
                  id="report-title"
                  className="font-display text-lg font-600 text-paper"
                >
                  Report sent
                </h2>
                <p className="mt-2 text-sm text-paper/70">
                  Thanks for letting us know. We&rsquo;ll review it and take
                  action if it breaks the rules. The person you reported
                  won&rsquo;t be told who reported them.
                </p>
                <p className="mt-2 text-sm text-paper/70">
                  If you don&rsquo;t want to see them anymore, you can also
                  block them.
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-sm bg-flag-red px-4 py-1.5 text-sm font-medium text-paper hover:bg-flag-red/90"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2
                  id="report-title"
                  className="font-display text-lg font-600 text-paper"
                >
                  Report {what}
                </h2>
                <p className="mt-1 text-sm text-paper/60">
                  Why are you reporting it?
                </p>

                <div className="mt-3 flex flex-col gap-1.5">
                  {REASONS.map((r) => (
                    <label
                      key={r.key}
                      className="flex cursor-pointer items-center gap-2.5 text-sm text-paper/80"
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r.key}
                        checked={reason === r.key}
                        onChange={() => {
                          setReason(r.key);
                          setError(null);
                        }}
                        className="h-4 w-4 accent-flag-red"
                      />
                      {r.label}
                    </label>
                  ))}
                </div>

                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Anything else we should know? (optional)"
                  className="mt-3 w-full rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
                />

                {error && <p className="mt-2 text-sm text-flag-red">{error}</p>}

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="px-3 py-1.5 text-sm text-paper/60 hover:text-paper"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={sending}
                    className="rounded-sm bg-flag-red px-4 py-1.5 text-sm font-medium text-paper hover:bg-flag-red/90 disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Send report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
