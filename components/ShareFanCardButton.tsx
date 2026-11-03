"use client";

import { useState } from "react";

// Makes the fan card image and opens the phone's share sheet
// (Instagram story, WhatsApp…). On desktop it downloads the PNG instead.
export default function ShareFanCardButton({
  userId,
  username,
  label = "Share my fan card",
}: {
  userId: string;
  username: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function share() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/fan-card/${userId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const file = new File([blob], `lightsngo-fan-card-${username}.png`, {
        type: "image/png",
      });
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: "My F1 fan card",
            text: "My F1 fan card — get yours on lightsngo.com 🏁",
          });
        } catch {
          // Closing the share sheet isn't an error.
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch {
      setError("Couldn't make the card image. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={share}
        disabled={busy}
        className="rounded-sm bg-flag-red px-4 py-2 text-sm font-medium text-paper hover:bg-flag-red/90 disabled:opacity-60"
      >
        {busy ? "Making your card…" : label}
      </button>
      {error && <p className="text-xs text-flag-red">{error}</p>}
    </div>
  );
}
