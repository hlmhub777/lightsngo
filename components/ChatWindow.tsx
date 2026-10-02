"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ReportButton from "@/components/ReportButton";
import Avatar from "@/components/Avatar";

type Message = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_username?: string;
  author_avatar_url?: string | null;
};

export default function ChatWindow({
  raceEventId,
  currentUserId,
  initialMessages,
}: {
  raceEventId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<Message[]>(initialMessages);
  messagesRef.current = messages;

  // Adds messages we haven't shown yet (from live updates or the backup check).
  async function addIncoming(rows: Message[]) {
    const fresh = rows.filter((r) => r.author_id !== currentUserId);
    if (fresh.length === 0) return;
    setMessages((prev) => {
      const known = new Set(prev.map((m) => m.id));
      const toAdd = fresh.filter((r) => !known.has(r.id));
      return toAdd.length ? [...prev, ...toAdd] : prev;
    });
  }

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      // Make sure live updates run as the signed-in user, otherwise the
      // database's "members only" rule hides every new message.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
      if (cancelled) return;

      channel = supabase
        .channel(`room:${raceEventId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `race_event_id=eq.${raceEventId}`,
          },
          async (payload) => {
            const row = payload.new as Message;
            if (row.author_id === currentUserId) return;
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", row.author_id)
              .single();
            addIncoming([
              {
                ...row,
                author_username: profile?.username,
                author_avatar_url: profile?.avatar_url ?? null,
              },
            ]);
          }
        )
        .on(
          "postgres_changes",
          // Delete events can't be filtered by room, so we just drop the
          // message by id if it's in this room's list.
          { event: "DELETE", schema: "public", table: "chat_messages" },
          (payload) => {
            const deletedId = (payload.old as { id?: string })?.id;
            if (!deletedId) return;
            setMessages((prev) => prev.filter((m) => m.id !== deletedId));
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceEventId, currentUserId, supabase]);

  // Backup: every few seconds, fetch anything new in case a live update
  // was missed (weak connection, phone waking up, etc.).
  useEffect(() => {
    const interval = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const last = messagesRef.current[messagesRef.current.length - 1];
      let query = supabase
        .from("chat_messages")
        .select(
          "id, content, created_at, author_id, author:profiles(username, avatar_url)"
        )
        .eq("race_event_id", raceEventId)
        .order("created_at", { ascending: true })
        .limit(50);
      if (last) query = query.gt("created_at", last.created_at);
      const { data } = await query;
      if (!data || data.length === 0) return;
      addIncoming(
        data.map((m: any) => ({
          id: m.id,
          content: m.content,
          created_at: m.created_at,
          author_id: m.author_id,
          author_username: m.author?.username,
          author_avatar_url: m.author?.avatar_url ?? null,
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceEventId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    setError(null);
    setDraft("");
    const { data: inserted, error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        race_event_id: raceEventId,
        author_id: currentUserId,
        content: text,
      })
      .select("id, content, created_at, author_id")
      .single();
    if (insertError || !inserted) {
      setDraft(text);
      setError(
        insertError
          ? `Couldn't send your message (${insertError.message}).`
          : "Couldn't send your message. Please try again."
      );
      return;
    }
    // Show our own message right away, without waiting for live updates.
    setMessages((prev) =>
      prev.some((m) => m.id === inserted.id)
        ? prev
        : [...prev, inserted as Message]
    );
  }

  async function deleteMessage(id: string) {
    const ok = window.confirm(
      "Delete this message? It will be removed for everyone in the room."
    );
    if (!ok) return;
    setError(null);
    const { data, error: deleteError } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", id)
      .select("id");
    if (deleteError || !data || data.length === 0) {
      setError("Couldn't delete that message. Please try again.");
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  async function blockAuthor(authorId: string, username?: string) {
    const name = username ?? "this user";
    const ok = window.confirm(
      `Block ${name}? You won't see their messages, posts or tips anymore, and they won't be able to message you. They won't be notified. You can unblock them later from your profile.`
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
    setMessages((prev) => prev.filter((m) => m.author_id !== authorId));
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-sm border border-asphalt-700 bg-asphalt-900">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.author_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine && (
                <div className="pt-1">
                  <Avatar
                    url={m.author_avatar_url}
                    name={m.author_username ?? "?"}
                    size={28}
                  />
                </div>
              )}
              <div
                className={`flex max-w-[75%] flex-col ${
                  mine ? "items-end" : "items-start"
                }`}
              >
              <div
                className={`px-3 py-2 text-sm ${
                  mine ? "bubble-mine" : "bubble-theirs"
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 font-mono text-[11px] opacity-60">
                    {m.author_username ?? "fan"}
                  </p>
                )}
                <p>{m.content}</p>
              </div>
              {mine ? (
                <button
                  type="button"
                  onClick={() => deleteMessage(m.id)}
                  className="mt-0.5 text-[11px] text-paper/30 hover:text-flag-red"
                >
                  Delete
                </button>
              ) : (
                <div className="mt-0.5 flex gap-3">
                  <ReportButton
                    contentType="chat_message"
                    contentId={m.id}
                    reportedUserId={m.author_id}
                    reportedUsername={m.author_username}
                    snapshot={m.content}
                  />
                  <button
                    type="button"
                    onClick={() => blockAuthor(m.author_id, m.author_username)}
                    className="text-[11px] text-paper/30 hover:text-flag-red"
                  >
                    Block
                  </button>
                </div>
              )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-asphalt-700 p-3">
        {error && <p className="mb-2 text-sm text-flag-red">{error}</p>}
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Say something to the room…"
            className="flex-1 rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red"
          />
          <button
            onClick={sendMessage}
            className="rounded-sm bg-flag-red px-4 py-2 text-sm font-medium text-paper hover:bg-flag-red/90"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
