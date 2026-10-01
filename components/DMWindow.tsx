"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  content: string | null;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  attachment_path?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
};

const MAX_BYTES = 5 * 1024 * 1024; // 5MB, matches the bucket's limit
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

function formatSize(bytes?: number | null) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

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
  const [uploading, setUploading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder shared by exactly these two people — matches the storage RLS
  // policy, which checks that the caller's id is one of the two folder
  // segments in the path.
  const conversationFolder = [currentUserId, otherUserId].sort().join("/");

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

  // Fetch a short-lived signed URL for any attachment we haven't resolved yet
  // (the bucket is private, so there's no public URL to just use directly).
  useEffect(() => {
    const pending = messages.filter(
      (m) => m.attachment_path && !signedUrls[m.attachment_path]
    );
    if (pending.length === 0) return;

    (async () => {
      const updates: Record<string, string> = {};
      for (const m of pending) {
        if (!m.attachment_path) continue;
        const { data } = await supabase.storage
          .from("dm-attachments")
          .createSignedUrl(m.attachment_path, 3600);
        if (data?.signedUrl) updates[m.attachment_path] = data.signedUrl;
      }
      if (Object.keys(updates).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...updates }));
      }
    })();
  }, [messages, signedUrls, supabase]);

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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // allow picking the same file again later
    setError(null);

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("You can only send images or PDFs.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is too large — max 5MB.");
      return;
    }

    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${conversationFolder}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("dm-attachments")
      .upload(path, file);

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase.from("direct_messages").insert({
      sender_id: currentUserId,
      recipient_id: otherUserId,
      attachment_path: path,
      attachment_name: file.name,
      attachment_type: file.type,
      attachment_size: file.size,
    });

    setUploading(false);
    if (insertError) setError(insertError.message);
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
          const url = m.attachment_path ? signedUrls[m.attachment_path] : null;
          const isImage = m.attachment_type?.startsWith("image/");

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
                {m.attachment_path ? (
                  url ? (
                    isImage ? (
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={m.attachment_name ?? "attachment"}
                          className="max-h-60 rounded-sm"
                        />
                      </a>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 underline"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                        </svg>
                        <span>
                          {m.attachment_name} ({formatSize(m.attachment_size)})
                        </span>
                      </a>
                    )
                  ) : (
                    <span className="text-xs opacity-60">Loading attachment…</span>
                  )
                ) : (
                  <p>{m.content}</p>
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
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Attach a file"
            className="rounded-sm p-2 text-paper/50 hover:bg-asphalt-800 hover:text-paper disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05 12.25 20.24a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.2 9.19a1.5 1.5 0 0 1-2.12-2.12l8.49-8.48" />
            </svg>
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={uploading ? "Uploading…" : `Message ${otherUsername}…`}
            disabled={uploading}
            className="flex-1 rounded-sm border border-asphalt-600 bg-asphalt-950 px-3 py-2 text-sm text-paper outline-none focus:border-flag-red disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={uploading}
            className="rounded-sm bg-flag-red px-4 py-2 text-sm font-medium text-paper hover:bg-flag-red/90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
