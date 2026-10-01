"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";

type BlockedRow = {
  blocked_id: string;
  blocked: { username: string; avatar_url: string | null } | null;
};

export default function BlockedUsersList() {
  const supabase = createClient();
  const router = useRouter();
  const [rows, setRows] = useState<BlockedRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error: loadError } = await supabase
        .from("blocks")
        .select("blocked_id, blocked:profiles!blocked_id(username, avatar_url)")
        .order("created_at", { ascending: false });
      if (loadError) {
        setError("Couldn't load your blocked users.");
        setRows([]);
        return;
      }
      setRows((data as unknown as BlockedRow[]) ?? []);
    })();
  }, [supabase]);

  async function unblock(id: string, username?: string) {
    const ok = window.confirm(
      `Unblock ${username ?? "this user"}? You'll see their content again. They won't be added back to your contacts automatically.`
    );
    if (!ok) return;
    setError(null);
    const { error: rpcError } = await supabase.rpc("unblock_user", {
      other_id: id,
    });
    if (rpcError) {
      setError("Couldn't unblock this user. Please try again.");
      return;
    }
    setRows((prev) => (prev ?? []).filter((r) => r.blocked_id !== id));
    router.refresh();
  }

  return (
    <div className="mt-10 border-t border-asphalt-800 pt-6">
      <h2 className="font-display text-sm font-600 text-paper/60">
        Blocked users
      </h2>

      {rows === null ? (
        <p className="mt-2 text-sm text-paper/40">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-2 text-sm text-paper/40">
          You haven&rsquo;t blocked anyone.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-1">
          {rows.map((r) => (
            <div
              key={r.blocked_id}
              className="flex items-center justify-between rounded-sm px-2 py-1.5"
            >
              <span className="inline-flex items-center gap-3 text-sm text-paper/80">
                <Avatar
                  url={r.blocked?.avatar_url}
                  name={r.blocked?.username ?? "?"}
                  size={28}
                />
                {r.blocked?.username ?? "Deleted user"}
              </span>
              <button
                type="button"
                onClick={() => unblock(r.blocked_id, r.blocked?.username)}
                className="rounded-sm border border-asphalt-600 px-3 py-1 text-xs text-paper/70 hover:border-paper/50 hover:text-paper"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-flag-red">{error}</p>}
    </div>
  );
}
