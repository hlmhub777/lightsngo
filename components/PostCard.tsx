import Link from "next/link";

type Post = {
  id: string;
  content: string;
  created_at: string;
  author: { username: string; avatar_url: string | null } | null;
  race_event: { slug: string; name: string; city: string } | null;
};

export default function PostCard({ post }: { post: Post }) {
  const initials = (post.author?.username ?? "?").slice(0, 2).toUpperCase();

  return (
    <article className="rounded-sm border border-asphalt-700 bg-asphalt-900 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-asphalt-700 font-mono text-xs text-paper/80">
          {initials}
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
      </div>
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-paper/90">
        {post.content}
      </p>
    </article>
  );
}
