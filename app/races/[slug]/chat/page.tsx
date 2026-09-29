import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ChatWindow from "@/components/ChatWindow";

export default async function RaceChatPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: race } = await supabase
    .from("race_events")
    .select("id, slug, name, city")
    .eq("slug", params.slug)
    .single();

  if (!race) notFound();

  const { data: rawMessages } = await supabase
    .from("chat_messages")
    .select("id, content, created_at, author_id, author:profiles(username)")
    .eq("race_event_id", race.id)
    .order("created_at", { ascending: true })
    .limit(200);

  const initialMessages = (rawMessages ?? []).map((m: any) => ({
    id: m.id,
    content: m.content,
    created_at: m.created_at,
    author_id: m.author_id,
    author_username: m.author?.username,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/races/${race.slug}`}
        className="text-sm text-paper/60 hover:text-paper"
      >
        ← {race.name}
      </Link>
      <h1 className="mt-1 font-display text-2xl font-700 text-paper">
        {race.city} race weekend chat
      </h1>

      <div className="mt-4">
        <ChatWindow
          raceEventId={race.id}
          currentUserId={user.id}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}
