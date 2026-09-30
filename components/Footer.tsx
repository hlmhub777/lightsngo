import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-asphalt-800 py-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 text-xs text-paper/40">
        <span>© {new Date().getFullYear()} LightsNGo</span>
        <Link href="/terms" className="hover:text-paper/70">
          Terms and Conditions
        </Link>
        <Link href="/privacy" className="hover:text-paper/70">
          Privacy Policy
        </Link>
      </div>
      <p className="mx-auto mt-2 max-w-5xl px-4 text-center text-[11px] leading-relaxed text-paper/30">
        LightsNGo is an independent fan community. It is not affiliated
        with, endorsed by, or sponsored by Formula 1, FIA, Liberty Media, or
        any F1 team.
      </p>
    </footer>
  );
}
