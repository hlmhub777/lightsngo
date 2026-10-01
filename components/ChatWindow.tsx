"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_username?: string;
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

  useEffect(() => {
    const channel = supabase
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
          // Look up the author's username for display.
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", row.author_id)
            .single();
          setMessages((prev) => [
            ...prev,
            { ...row, author_username: profile?.username },
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [raceEventId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    setError(null);
    setDraft("");
    const { error: insertError } = await supabase.from("chat_messages").insert({
      race_event_id: raceEventId,
      author_id: currentUserId,
      content: text,
    });
    if (insertError) {
      setDraft(text);
      setError("Couldn't send your message. Please try again.");
    }
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
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 text-sm ${
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
                <button
                  type="button"
                  onClick={() => blockAuthor(m.author_id, m.author_username)}
                  className="mt-0.5 text-[11px] text-paper/30 hover:text-flag-red"
                >
                  Block
                </button>
              )}
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
