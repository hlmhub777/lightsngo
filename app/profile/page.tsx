import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import BlockedUsersList from "@/components/BlockedUsersList";

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

      <div className="mt-6">
        <ProfileForm profile={profile} />
      </div>

      <BlockedUsersList />

      <DeleteAccountButton username={profile.username} />
    </div>
  );
}
