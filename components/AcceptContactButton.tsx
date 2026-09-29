"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AcceptContactButton({
  contactRowId,
}: {
  contactRowId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  async function accept() {
    await supabase
      .from("contacts")
      .update({ status: "accepted" })
      .eq("id", contactRowId);
    router.refresh();
  }

  return (
    <button
      onClick={accept}
      className="rounded-sm bg-signal-green px-3 py-1 text-xs font-medium text-asphalt-950 hover:opacity-90"
    >
      Accept
    </button>
  );
}
