import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DMWindow from "@/components/DMWindow";

export default async function DMThreadPage({
  params,
}: {
  params: { contactId: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Confirm the two of you are actually accepted contacts before opening the thread.
  const { data: contactRow } = await supabase
    .from("contacts")
    .select("status, requester_id, recipient_id")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.eq.${params.contactId}),and(requester_id.eq.${params.contactId},recipient_id.eq.${user.id})`
    )
    .eq("status", "accepted")
    .maybeSingle();

  if (!contactRow) notFound();

  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", params.contactId)
    .single();

  if (!otherProfile) notFound();

  const { data: rawMessages } = await supabase
    .from("direct_messages")
    .select(
      "id, content, created_at, sender_id, recipient_id, attachment_path, attachment_name, attachment_type, attachment_size"
    )
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${params.contactId}),and(sender_id.eq.${params.contactId},recipient_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/messages" className="text-sm text-paper/60 hover:text-paper">
        ← Contacts
      </Link>
      <div className="mt-3">
        <DMWindow
          currentUserId={user.id}
          otherUserId={params.contactId}
          otherUsername={otherProfile.username}
          otherAvatarUrl={otherProfile.avatar_url}
          initialMessages={rawMessages ?? []}
        />
      </div>
    </div>
  );
}