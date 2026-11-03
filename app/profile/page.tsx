import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import BlockedUsersList from "@/components/BlockedUsersList";
import FanCard from "@/components/FanCard";
import ShareFanCardButton from "@/components/ShareFanCardButton";
import { POINTS, getFanCardData } from "@/lib/fanCard";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  async function signOut() {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-paper/60">
        Setting up your profile — refresh in a moment.
      </div>
    );
  }

  const card = await getFanCardData(supabase, profile);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-700 text-paper">
          Your profile
        </h1>
        <form action={signOut}>
          <button className="text-sm text-paper/50 hover:text-paper">
            Log out
          </button>
        </form>
      </div>

      <p className="mt-3 rounded-sm border border-asphalt-700 bg-asphalt-900 px-3 py-2 text-sm text-paper/70">
        Everything on your profile is visible to other LightsNGo members.
        Your email address is never shown.{" "}
        <Link href="/privacy" className="underline hover:text-paper">
          Privacy Policy
        </Link>
      </p>

      <section className="mt-6">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-paper/50">
          Your fan card
        </h2>
        <FanCard card={card} />
        <div className="mt-4">
          <ShareFanCardButton userId={profile.id} username={profile.username} />
        </div>
        <details className="mt-4 rounded-sm border border-asphalt-700 bg-asphalt-900 px-3 py-2 text-sm text-paper/70">
          <summary className="cursor-pointer text-paper/85">How to earn points</summary>
          <ul className="mt-2 space-y-1">
            <li>🏁 Race you&rsquo;ve been to: +{POINTS.raceAttended}</li>
            <li>🗺️ Tip in a city guide: +{POINTS.guideTip}</li>
            <li>📝 Post on the feed: +{POINTS.post}</li>
            <li>❤️ Like from another fan: +{POINTS.likeReceived}</li>
            <li>✅ Complete profile (photo, country, birth year, team, driver): +{POINTS.completeProfile}</li>
          </ul>
          <p className="mt-2 text-paper/50">
            Levels: Rookie → Racer (250) → Podium (1,000) → Legend (3,000).
            New card designs unlock with your level soon.
          </p>
        </details>
        <p className="mt-3 rounded-sm border border-dashed border-flag-amber/40 px-3 py-2 text-sm text-paper/70">
          <span className="font-medium text-flag-amber">Coming soon:</span>{" "}
          your fan card printed as a real card or sticker, with a QR code to
          your profile. It will be available later for a small fee.
        </p>
      </section>

      <div className="mt-8">
        <ProfileForm profile={profile} />
      </div>

      <BlockedUsersList />

      <DeleteAccountButton username={profile.username} />
    </div>
  );
}
