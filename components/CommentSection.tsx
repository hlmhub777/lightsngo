"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ReportButton from "@/components/ReportButton";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: { username: string } | null;
};

const COMMENT_SELECT =
  "id, content, created_at, author_id, author:profiles(username)";

export default function CommentSection({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("post_comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .then(({ count: c }) => {
        if (!cancelled) setCount(c ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [postId, supabase]);

  async function openComments() {
    setOpen((v) => !v);
    if (!loaded) {
      const { data } = await supabase
        .from("post_comments")
        .select(COMMENT_SELECT)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      setComments((data as any) ?? []);
      setLoaded(true);
    }
  }

  async function submitComment() {
    const text = draft.trim();
    if (!text) return;
    setPosting(true);
    setError(null);
    const { data, error: insertError } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, author_id: userId, content: text })
      .select(COMMENT_SELECT)
      .single();
    setPosting(false);
    if (!insertError && data) {
      setComments((prev) => [...prev, data as any]);
      setCount((c) => c + 1);
      setDraft("");
    } else if (insertError) {
      setError("Couldn't post your reply. Please try again.");
    }
  }

  async function deleteComment(id: string) {
    if (!window.confirm("Delete your reply?")) return;
    setError(null);
    const { data, error: delError } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", id)
      .select("id");
    if (delError || !data || data.length === 0) {
      setError("Couldn't delete that reply. Please try again.");
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== id));
    setCount((c) => Math.max(0, c - 1));
  }

  async function blockAuthor(authorId: string, username?: string) {
    const name = username ?? "this user";
    const ok = window.confirm(
      `Block ${name}? You won't see their posts, comments, tips or chat messages anymore, and they won't be able to message you. They won't be notified. You can unblock them later from your profile.`
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
    const removedCount = comments.filter((c) => c.author_id === authorId).length;
    setComments((prev) => prev.filter((c) => c.author_id !== authorId));
    setCount((c) => Math.max(0, c - removedCount));
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={openComments}
        className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm text-paper/50 hover:text-paper/80"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>{count > 0 ? count : "Reply"}</span>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3 border-t border-asphalt-700 pt-3">
          {comments.map((c) => {
            const mine = c.author_id === userId;
            return (
              <div key={c.id} className="text-sm">
                <span className="font-medium text-paper">
                  {c.author?.username ?? "fan"}
                </span>{" "}
                <span className="text-paper/40">
                  · {new Date(c.created_at).toLocaleString()}
                </span>
                <p className="mt-0.5 whitespace-pre-wrap text-paper/80">
                  {c.content}
                </p>
                <div className="mt-0.5 flex gap-3">
                  {mine ? (
                    <button
                      type="button"
                      onClick={() => deleteComment(c.id)}
                      className="text-[11px] text-paper/30 hover:text-flag-red"
                    >
                      Delete
                    </button>
                  ) : (
                    <>
                      <ReportButton
                        contentType="comment"
                        contentId={c.id}
                        reportedUserId={c.author_id}
                        reportedUsername={c.author?.username}
                        snapshot={c.content}
                      />
                      <button
                        type="button"
                        onClick={() => blockAuthor(c.author_id, c.author?.username)}
                        className="text-[11px] text-paper/30 hover:text-flag-red"
                      >
                        Block
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {loaded && comments.length === 0 && (
            <p className="text-sm text-paper/40">
              No replies yet — say something.
            </p>
          )}

          {error && <p className="text-sm text-flag-red">{error}</p>}
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Write a reply…"
              className="flex-1 rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-1.5 text-sm text-paper outline-none focus:border-flag-red"
            />
            <button
              onClick={submitComment}
              disabled={posting || !draft.trim()}
              className="rounded-sm bg-flag-red px-3 py-1.5 text-sm font-medium text-paper hover:bg-flag-red/90 disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
