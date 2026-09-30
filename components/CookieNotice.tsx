"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "lightsngo-cookie-notice-dismissed";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    } catch {
      // localStorage unavailable — fail quietly, just don't show the banner
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — worst case it shows again next visit
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-asphalt-700 bg-asphalt-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-4 text-sm text-paper/80 sm:flex-row sm:justify-between">
        <p className="text-center sm:text-left">
          We use only essential cookies to keep you logged in — no tracking
          or advertising cookies. See our{" "}
          <Link href="/privacy" className="text-flag-amber hover:underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-sm bg-flag-red px-4 py-1.5 text-sm font-medium text-paper hover:bg-flag-red/90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
