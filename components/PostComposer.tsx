"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB, matches the post-media bucket limit
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm";

type RaceOption = { id: string; name: string; season_year: number };

export default function PostComposer({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [races, setRaces] = useState<RaceOption[]>([]);
  const [raceId, setRaceId] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("race_events")
      .select("id, name, season_year")
      .order("season_year", { ascending: false })
      .order("race_date", { ascending: true })
      .then(({ data }) => setRaces((data as RaceOption[]) ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pickFile(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!ACCEPT.split(",").includes(f.type)) {
      setError("Please choose a photo (JPG, PNG, WEBP, GIF) or a video (MP4, MOV, WEBM).");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("That file is over 50 MB. Please trim the video or pick a smaller one.");
      return;
    }
    setFile(f);
  }

  const isVideo = file?.type.startsWith("video/");

  async function handlePost() {
    if (!content.trim() && !file) return;
    setPosting(true);
    setError(null);

    let image_url: string | null = null;
    let video_url: string | null = null;

    if (file) {
      const ext = (file.name.split(".").pop() || (isVideo ? "mp4" : "jpg")).toLowerCase();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("post-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        setPosting(false);
        setError("Upload failed. Please check your connection and try again.");
        return;
      }
      const { data } = supabase.storage.from("post-media").getPublicUrl(path);
      if (isVideo) video_url = data.publicUrl;
      else image_url = data.publicUrl;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      author_id: userId,
      content: content.trim(),
      image_url,
      video_url,
      race_event_id: raceId || null,
    });
    setPosting(false);
    if (!insertError) {
      setContent("");
      setFile(null);
      setRaceId("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } else {
      setError("Your post couldn't be published. Please try again.");
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

      {preview && (
        <div className="relative mt-2 overflow-hidden rounded-sm border border-asphalt-700">
          {isVideo ? (
            <video src={preview} controls playsInline className="max-h-96 w-full bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="max-h-96 w-full object-contain bg-black" />
          )}
          <button
            type="button"
            onClick={() => {
              setFile(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="absolute right-2 top-2 rounded-sm bg-asphalt-900/80 px-2 py-1 text-xs text-paper hover:text-flag-red"
          >
            Remove
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-flag-red">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-sm border border-asphalt-600 px-3 py-1.5 text-sm text-paper/80 hover:border-flag-amber hover:text-flag-amber"
        >
          📷 Photo / video
        </button>
        <select
          value={raceId}
          onChange={(e) => setRaceId(e.target.value)}
          className="rounded-sm border border-asphalt-600 bg-asphalt-900 px-2 py-1.5 text-sm text-paper/80 outline-none focus:border-flag-red"
        >
          <option value="">Tag a race (optional)</option>
          {races.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <button
          onClick={handlePost}
          disabled={posting || (!content.trim() && !file)}
          className="ml-auto rounded-sm bg-flag-red px-4 py-1.5 text-sm font-medium text-paper hover:bg-flag-red/90 disabled:opacity-50"
        >
          {posting ? (file ? "Uploading…" : "Posting…") : "Post"}
        </button>
      </div>
    </div>
  );
}
