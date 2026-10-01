"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

type Post = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: { username: string; avatar_url: string | null } | null;
  race_event: { slug: string; name: string; city: string } | null;
};

export default function PostCard({
  post,
  currentUserId,
}: {
  post: Post;
  currentUserId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [removed, setRemoved] = useState(false);

  const initials = (post.author?.username ?? "?").slice(0, 2).toUpperCase();
  const isMine = post.author_id === currentUserId;

  async function handleDelete() {
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    setDeleting(true);
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) {
      setRemoved(true);
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  if (removed) return null;

  return (
    <article className="rounded-sm border border-asphalt-700 bg-asphalt-900 p-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-asphalt-700">
          {post.author?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-xs text-paper/80">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-paper">
            {post.author?.username ?? "Deleted user"}
          </p>
          <p className="text-xs text-paper/50">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
        {post.race_event && (
          <Link
            href={`/races/${post.race_event.slug}`}
            className="rounded-sm border border-asphalt-600 px-2 py-1 font-mono text-[11px] text-flag-amber hover:border-flag-amber"
          >
            {post.race_event.city}
          </Link>
        )}
        {isMine && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete post"
            className="rounded-sm p-1.5 text-paper/30 hover:bg-asphalt-800 hover:text-flag-red disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
            </svg>
          </button>
        )}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-paper/90">
        {post.content}
      </p>

      <div className="mt-3 flex items-start gap-4 border-t border-asphalt-800 pt-2">
        <LikeButton postId={post.id} userId={currentUserId} />
        <div className="flex-1">
          <CommentSection postId={post.id} userId={currentUserId} />
        </div>
      </div>
    </article>
  );
}
