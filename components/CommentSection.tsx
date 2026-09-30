"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  author: { username: string } | null;
};

export default function CommentSection({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}) {
  const supabase = createClient();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

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
        .select("id, content, created_at, author:profiles(username)")
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
    const { data, error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, author_id: userId, content: text })
      .select("id, content, created_at, author:profiles(username)")
      .single();
    setPosting(false);
    if (!error && data) {
      setComments((prev) => [...prev, data as any]);
      setCount((c) => c + 1);
      setDraft("");
    }
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
          {comments.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-medium text-paper">
                {c.author?.username ?? "fan"}
              </span>{" "}
              <span className="text-paper/40">
                · {new Date(c.created_at).toLocaleString()}
              </span>
              <p className="mt-0.5 text-paper/80">{c.content}</p>
            </div>
          ))}
          {loaded && comments.length === 0 && (
            <p className="text-sm text-paper/40">
              No replies yet — say something.
            </p>
          )}

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
