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
    setDraft("");
    await supabase.from("chat_messages").insert({
      race_event_id: raceEventId,
      author_id: currentUserId,
      content: text,
    });
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-sm border border-asphalt-700 bg-asphalt-900">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.author_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
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
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-asphalt-700 p-3">
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
  );
}
