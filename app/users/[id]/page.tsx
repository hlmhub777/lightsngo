import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Avatar from "@/components/Avatar";
import AddContactButton from "@/components/AddContactButton";
import AcceptContactButton from "@/components/AcceptContactButton";
import ReportButton from "@/components/ReportButton";

export const metadata = {
  title: "Fan profile — LightsNGo",
};

export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (params.id === user.id) redirect("/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, username, avatar_url, country, favorite_team, favorite_driver, tracks_visited, bio, created_at"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!profile) notFound();

  const [{ data: contactRow }, { data: blockRow }] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, status, requester_id")
      .or(
        `and(requester_id.eq.${user.id},recipient_id.eq.${profile.id}),and(requester_id.eq.${profile.id},recipient_id.eq.${user.id})`
      )
      .maybeSingle(),
    supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocked_id", profile.id)
      .maybeSingle(),
  ]);

  const tracks: string[] = profile.tracks_visited ?? [];
  const memberSince = new Date(profile.created_at).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const details = [
    { label: "Country", value: profile.country },
    { label: "Favourite team", value: profile.favorite_team },
    { label: "Favourite driver", value: profile.favorite_driver },
  ].filter((d) => d.value);

  let action: React.ReactNode;
  if (blockRow) {
    action = (
      <p className="text-sm text-paper/60">
        You blocked this fan. You can unblock them from{" "}
        <Link href="/profile" className="text-flag-amber hover:underline">
          your profile
        </Link>
        .
      </p>
    );
  } else if (contactRow?.status === "accepted") {
    action = (
      <Link
        href={`/messages/${profile.id}`}
        className="rounded-sm bg-flag-red px-4 py-2 text-sm font-medium text-paper hover:bg-flag-red/90"
      >
        Message
      </Link>
    );
  } else if (contactRow && contactRow.requester_id === user.id) {
    action = (
      <span className="rounded-sm border border-asphalt-600 px-4 py-2 text-sm text-paper/60">
        Request sent
      </span>
    );
  } else if (contactRow) {
    action = (
      <div className="flex items-center gap-3">
        <span className="text-sm text-paper/70">
          {profile.username} wants to connect.
        </span>
        <AcceptContactButton contactRowId={contactRow.id} />
      </div>
    );
  } else {
    action = <AddContactButton userId={user.id} otherId={profile.id} />;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/feed" className="text-sm text-paper/50 hover:text-paper">
        ← Feed
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <Avatar url={profile.avatar_url} name={profile.username} size={72} />
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-700 text-paper">
            {profile.username}
          </h1>
          <p className="text-sm text-paper/50">Member since {memberSince}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        {action}
        <ReportButton
          contentType="user"
          reportedUserId={profile.id}
          reportedUsername={profile.username}
          className="text-xs text-paper/40 hover:text-flag-amber"
        />
      </div>

      {details.length > 0 && (
        <dl className="mt-6 grid grid-cols-1 gap-3 rounded-sm border border-asphalt-700 bg-asphalt-900 p-4 sm:grid-cols-3">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-paper/40">
                {d.label}
              </dt>
              <dd className="mt-0.5 text-sm text-paper">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {profile.bio && (
        <p className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-paper/85">
          {profile.bio}
        </p>
      )}

      {tracks.length > 0 && (
        <div className="mt-6">
          <h2 className="font-mono text-[11px] uppercase tracking-wider text-paper/40">
            Tracks visited
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {tracks.map((t) => (
              <span
                key={t}
                className="rounded-sm border border-asphalt-600 px-2 py-1 text-xs text-paper/80"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
