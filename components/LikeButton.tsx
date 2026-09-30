"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LikeButton({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}) {
  const supabase = createClient();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [{ count: totalCount }, { data: mine }] = await Promise.all([
        supabase
          .from("post_likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId),
        supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", userId)
          .maybeSingle(),
      ]);
      if (!cancelled) {
        setCount(totalCount ?? 0);
        setLiked(!!mine);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [postId, userId, supabase]);

  async function toggle() {
    if (busy) return;
    setBusy(true);

    if (liked) {
      // Optimistic unlike
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      if (error) {
        // revert on failure
        setLiked(true);
        setCount((c) => c + 1);
      }
    } else {
      // Optimistic like
      setLiked(true);
      setCount((c) => c + 1);
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: userId });
      if (error) {
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      }
    }

    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm transition-colors ${
        liked ? "text-flag-red" : "text-paper/50 hover:text-paper/80"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{count > 0 ? count : ""}</span>
    </button>
  );
}
