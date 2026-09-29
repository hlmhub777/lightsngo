"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PostComposer({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  async function handlePost() {
    if (!content.trim()) return;
    setPosting(true);
    const { error } = await supabase
      .from("posts")
      .insert({ author_id: userId, content: content.trim() });
    setPosting(false);
    if (!error) {
      setContent("");
      router.refresh();
    }
  }

  return (
    <div className="rounded-sm border border-asphalt-700 bg-asphalt-900 p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening in the paddock?"
        rows={3}
        className="w-full resize-none bg-transparent text-paper placeholder:text-paper/40 outline-none"
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={handlePost}
          disabled={posting || !content.trim()}
          className="rounded-sm bg-flag-red px-4 py-1.5 text-sm font-medium text-paper hover:bg-flag-red/90 disabled:opacity-50"
        >
          {posting ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}
