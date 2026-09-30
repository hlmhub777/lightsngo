import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";

export default async function FeedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, content, created_at, author_id, author:profiles(username, avatar_url), race_event:race_events(slug, name, city)"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-700 text-paper">Feed</h1>
      <p className="mt-1 text-sm text-paper/60">
        What the paddock is talking about right now.
      </p>

      <div className="mt-6">
        <PostComposer userId={user.id} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {posts && posts.length > 0 ? (
          posts.map((post: any) => (
            <PostCard key={post.id} post={post} currentUserId={user.id} />
          ))
        ) : (
          <p className="rounded-sm border border-dashed border-asphalt-600 p-6 text-center text-sm text-paper/50">
            No posts yet — be the first to say something.
          </p>
        )}
      </div>
    </div>
  );
}
