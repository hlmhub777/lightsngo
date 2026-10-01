"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
};

export default function DMWindow({
  currentUserId,
  otherUserId,
  otherUsername,
  initialMessages,
}: {
  currentUserId: string;
  otherUserId: string;
  otherUsername: string;
  initialMessages: Message[];
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`dm:${[currentUserId, otherUserId].sort().join("-")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const row = payload.new as Message;
          const involvesUs =
            (row.sender_id === currentUserId && row.recipient_id === otherUserId) ||
            (row.sender_id === otherUserId && row.recipient_id === currentUserId);
          if (involvesUs) {
            setMessages((prev) => [...prev, row]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    setError(null);
    setDraft("");
    const { error: insertError } = await supabase.from("direct_messages").insert({
      sender_id: currentUserId,
      recipient_id: otherUserId,
      content: text,
    });
    if (insertError) {
      setDraft(text);
      setError(insertError.message);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-sm border border-asphalt-700 bg-asphalt-900">
      <div className="border-b border-asphalt-700 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-sm text-paper">
          <span className="h-2 w-2 rounded-full bg-signal-green" />
          {otherUsername}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
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
                {m.content}
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
            placeholder={`Message ${otherUsername}…`}
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
