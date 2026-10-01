"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB, matches the bucket's limit
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export default function AvatarUpload({
  userId,
  username,
  currentAvatarUrl,
}: {
  userId: string;
  username: string;
  currentAvatarUrl: string | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      setError("Please choose a JPG, PNG, GIF, or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is too large — max 2MB.");
      return;
    }

    // Instant local preview while the real upload happens in the background.
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    const path = `${userId}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the new photo shows immediately everywhere, not a
    // stale cached copy at the same URL.
    const freshUrl = `${data.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: freshUrl })
      .eq("id", userId);

    setUploading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPreview(freshUrl);
    router.refresh();
  }

  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-asphalt-700">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={username}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-sm text-paper/80">
            {initials}
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-sm border border-asphalt-600 px-3 py-1.5 text-sm text-paper/80 hover:border-paper/50 disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Change photo"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="mt-1 text-xs text-paper/40">JPG, PNG, GIF or WEBP — max 2MB.</p>
        {error && <p className="mt-1 text-xs text-flag-red">{error}</p>}
      </div>
    </div>
  );
}
