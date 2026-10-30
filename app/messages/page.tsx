import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddContactSearch from "@/components/AddContactSearch";
import AcceptContactButton from "@/components/AcceptContactButton";
import Avatar from "@/components/Avatar";

export default async function MessagesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("contacts")
    .select(
      "id, status, requester_id, recipient_id, note, requester:profiles!contacts_requester_id_fkey(id, username, avatar_url), recipient:profiles!contacts_recipient_id_fkey(id, username, avatar_url)"
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
                className="rounded-sm border border-asphalt-700 bg-asphalt-900 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/users/${r.requester.id}`}
                    className="inline-flex items-center gap-3 text-sm text-paper hover:text-flag-amber"
                  >
                    <Avatar
                      url={r.requester.avatar_url}
                      name={r.requester.username}
                      size={32}
                    />
                    {r.requester.username}
                  </Link>
                  <AcceptContactButton contactRowId={r.id} />
                </div>
                {r.note && (
                  <p className="mt-2 whitespace-pre-wrap pl-11 text-sm italic text-paper/80">
                    &ldquo;{r.note}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-paper/50">
          Contacts — {accepted.length} in your paddock
        </h2>
        <div className="mt-2 flex flex-col gap-1">
          {accepted.length > 0 ? (
            accepted.map((c: any) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-sm px-3 py-2 hover:bg-asphalt-900"
              >
                <Link
                  href={`/users/${c.id}`}
                  title={`View ${c.username}'s profile`}
                  className="flex min-w-0 items-center gap-3 hover:text-flag-amber"
                >
                  <Avatar url={c.avatar_url} name={c.username} size={36} />
                  <span className="truncate text-sm text-paper hover:text-flag-amber">
                    {c.username}
                  </span>
                </Link>
                <Link
                  href={`/messages/${c.id}`}
                  className="shrink-0 rounded-sm bg-flag-red px-3 py-1.5 text-xs font-medium text-paper hover:bg-flag-red/90"
                >
                  Message
                </Link>
              </div>
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
              <Link
                key={r.id}
                href={`/users/${r.recipient.id}`}
                className="flex items-center gap-3 px-3 py-2 text-sm text-paper/40 hover:text-paper/70"
              >
                <span className="opacity-60">
                  <Avatar
                    url={r.recipient.avatar_url}
                    name={r.recipient.username}
                    size={28}
                  />
                </span>
                {r.recipient.username} — waiting for them to accept
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
