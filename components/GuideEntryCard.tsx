"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import ReportButton from "@/components/ReportButton";

type Author = { username: string; avatar_url?: string | null } | null;

export type Reply = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: Author;
};

export type Entry = {
  id: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  author: Author;
  replies?: Reply[];
};

const REPLY_SELECT =
  "id, content, created_at, author_id, author:profiles!author_id(username, avatar_url)";

export default function GuideEntryCard({
  item,
  userId,
}: {
  item: Entry;
  userId: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [replies, setReplies] = useState<Reply[]>(
    [...(item.replies ?? [])].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  );
  const [deleted, setDeleted] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMine = !!userId && userId === item.author_id;

  async function deleteTip() {
    const ok = window.confirm(
      "Delete this tip? Replies to it will be deleted too. This can't be undone."
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    const { data, error: delError } = await supabase
      .from("guide_entries")
      .delete()
      .eq("id", item.id)
      .select("id");
    setBusy(false);
    if (delError || !data || data.length === 0) {
      setError("Couldn't delete this tip. Please try again.");
      return;
    }
    setDeleted(true);
    router.refresh();
  }

  async function sendReply() {
    const text = draft.trim();
    if (!text || !userId) return;
    if (text.length > 1000) {
      setError("Replies can be up to 1000 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("guide_replies")
      .insert({ guide_entry_id: item.id, author_id: userId, content: text })
      .select(REPLY_SELECT)
      .single();
    setBusy(false);
    if (insertError || !data) {
      setError("Couldn't post your reply. Please try again.");
      return;
    }
    setReplies((prev) => [...prev, data as unknown as Reply]);
    setDraft("");
    setReplyOpen(false);
  }

  async function deleteReply(replyId: string) {
    const ok = window.confirm("Delete your reply?");
    if (!ok) return;
    setError(null);
    const { data, error: delError } = await supabase
      .from("guide_replies")
      .delete()
      .eq("id", replyId)
      .select("id");
    if (delError || !data || data.length === 0) {
      setError("Couldn't delete that reply. Please try again.");
      return;
    }
    setReplies((prev) => prev.filter((r) => r.id !== replyId));
  }

  async function blockAuthor(authorId: string, username?: string) {
    const name = username ?? "this user";
    const ok = window.confirm(
      `Block ${name}? You won't see their tips, posts or chat messages anymore, and they won't be able to message you. They won't be notified. You can unblock them later from your profile.`
    );
    if (!ok) return;
    setError(null);
    const { error: rpcError } = await supabase.rpc("block_user", {
      other_id: authorId,
    });
    if (rpcError) {
      setError("Couldn't block this user. Please try again.");
      return;
    }
    if (authorId === item.author_id) {
      setDeleted(true);
    } else {
      setReplies((prev) => prev.filter((r) => r.author_id !== authorId));
    }
    router.refresh();
  }

  if (deleted) return null;

  return (
    <div className="rounded-sm border border-asphalt-700 bg-asphalt-900 p-3">
      <p className="text-sm font-medium text-paper">{item.title}</p>
      <p className="mt-1 whitespace-pre-line text-sm text-paper/70">
        {item.content}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-paper/40">
          <Avatar
            url={item.author?.avatar_url}
            name={item.author?.username ?? "?"}
            size={18}
          />
          {item.author?.username ?? "a fan"} ·{" "}
          {new Date(item.created_at).toLocaleDateString()}
        </span>

        {userId ? (
          <button
            type="button"
            onClick={() => setReplyOpen((o) => !o)}
            disabled={busy}
            className="text-xs text-paper/60 hover:text-paper disabled:opacity-50"
          >
            Reply
          </button>
        ) : (
          <Link href="/login" className="text-xs text-paper/60 hover:text-paper">
            Log in to reply
          </Link>
        )}

        {isMine && (
          <button
            type="button"
            onClick={deleteTip}
            disabled={busy}
            className="text-xs text-paper/40 hover:text-flag-red disabled:opacity-50"
          >
            Delete
          </button>
        )}

        {userId && !isMine && (
          <>
            <ReportButton
              contentType="guide_entry"
              contentId={item.id}
              reportedUserId={item.author_id}
              reportedUsername={item.author?.username}
              snapshot={`${item.title}\n\n${item.content}`}
              className="text-xs text-paper/40 hover:text-flag-amber"
            />
            <button
              type="button"
              onClick={() => blockAuthor(item.author_id, item.author?.username)}
              disabled={busy}
              className="text-xs text-paper/40 hover:text-flag-red disabled:opacity-50"
            >
              Block
            </button>
          </>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-3 flex flex-col gap-2 border-l-2 border-asphalt-700 pl-3">
          {replies.map((r) => (
            <div key={r.id}>
              <p className="whitespace-pre-line text-sm text-paper/75">
                {r.content}
              </p>
              <div className="mt-1 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-paper/40">
                  <Avatar
                    url={r.author?.avatar_url}
                    name={r.author?.username ?? "?"}
                    size={16}
                  />
                  {r.author?.username ?? "a fan"} ·{" "}
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
                {userId === r.author_id && (
                  <button
                    type="button"
                    onClick={() => deleteReply(r.id)}
                    className="text-[11px] text-paper/40 hover:text-flag-red"
                  >
                    Delete
                  </button>
                )}
                {userId && userId !== r.author_id && (
                  <>
                    <ReportButton
                      contentType="guide_reply"
                      contentId={r.id}
                      reportedUserId={r.author_id}
                      reportedUsername={r.author?.username}
                      snapshot={r.content}
                      className="text-[11px] text-paper/40 hover:text-flag-amber"
                    />
                    <button
                      type="button"
                      onClick={() => blockAuthor(r.author_id, r.author?.username)}
                      className="text-[11px] text-paper/40 hover:text-flag-red"
                    >
                      Block
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {replyOpen && userId && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder={`Reply to ${item.author?.username ?? "this tip"}…`}
            className="w-full rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setReplyOpen(false);
                setDraft("");
                setError(null);
              }}
              className="px-3 py-1.5 text-sm text-paper/60 hover:text-paper"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={sendReply}
              disabled={busy || !draft.trim()}
              className="rounded-sm bg-flag-red px-4 py-1.5 text-sm font-medium text-paper hover:bg-flag-red/90 disabled:opacity-50"
            >
              {busy ? "Posting…" : "Post reply"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-flag-red">{error}</p>}
    </div>
  );
}
