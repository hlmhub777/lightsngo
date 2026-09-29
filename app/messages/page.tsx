import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddContactSearch from "@/components/AddContactSearch";
import AcceptContactButton from "@/components/AcceptContactButton";

export default async function MessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("contacts")
    .select(
      "id, status, requester_id, recipient_id, requester:profiles!contacts_requester_id_fkey(id, username), recipient:profiles!contacts_recipient_id_fkey(id, username)"
    )
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

  const accepted =
    rows?.filter((r: any) => r.status === "accepted").map((r: any) => {
      const other = r.requester_id === user.id ? r.recipient : r.requester;
      return other;
    }) ?? [];

  const incomingRequests =
    rows?.filter((r: any) => r.status === "pending" && r.recipient_id === user.id) ??
    [];

  const outgoingRequests =
    rows?.filter((r: any) => r.status === "pending" && r.requester_id === user.id) ??
    [];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl font-700 text-paper">Messages</h1>
      <p className="mt-1 text-sm text-paper/60">
        Your contact list — add fans you meet in a race chat or on the feed.
      </p>

      <div className="mt-6">
        <AddContactSearch userId={user.id} />
      </div>

      {incomingRequests.length > 0 && (
        <div className="mt-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-paper/50">
            Requests
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {incomingRequests.map((r: any) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-sm border border-asphalt-700 bg-asphalt-900 px-3 py-2"
              >
                <span className="text-sm text-paper">
                  {r.requester.username}
                </span>
                <AcceptContactButton contactRowId={r.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-paper/50">
          Contacts — {accepted.length} online in your paddock
        </h2>
        <div className="mt-2 flex flex-col gap-1">
          {accepted.length > 0 ? (
            accepted.map((c: any) => (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="flex items-center gap-3 rounded-sm px-3 py-2 hover:bg-asphalt-900"
              >
                <span className="h-2 w-2 rounded-full bg-signal-green" />
                <span className="text-sm text-paper">{c.username}</span>
              </Link>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-paper/40">
              No contacts yet — search above or meet someone in a race chat
              room.
            </p>
          )}
        </div>
      </div>

      {outgoingRequests.length > 0 && (
        <div className="mt-6">
          <h2 className="font-mono text-xs uppercase tracking-widest text-paper/50">
            Pending
          </h2>
          <div className="mt-2 flex flex-col gap-1">
            {outgoingRequests.map((r: any) => (
              <p key={r.id} className="px-3 py-2 text-sm text-paper/40">
                {r.recipient.username} — waiting for them to accept
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
