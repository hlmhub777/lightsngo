import type { SupabaseClient } from "@supabase/supabase-js";

// Fan card levels. A fan's level comes from points earned on LightsNGo.
// Later phases will unlock a different card style per level.
export type Level = {
  name: "Rookie" | "Racer" | "Podium" | "Legend";
  min: number;
  // Frame colours for the Collector Card (gradient stops).
  frame: [string, string, string];
};

export const LEVELS: Level[] = [
  { name: "Rookie", min: 0, frame: ["#8A94A3", "#E6E9EE", "#8A94A3"] },
  { name: "Racer", min: 250, frame: ["#E10600", "#FF6A3D", "#E10600"] },
  { name: "Podium", min: 1000, frame: ["#F5A623", "#FFF3C4", "#E10600"] },
  { name: "Legend", min: 3000, frame: ["#F5A623", "#FFFFFF", "#F5A623"] },
];

// How points are earned. Shown to fans on their own profile.
export const POINTS = {
  raceAttended: 100,
  guideTip: 25,
  post: 10,
  likeReceived: 2,
  completeProfile: 50,
} as const;

export function levelFor(points: number) {
  let index = 0;
  LEVELS.forEach((l, i) => {
    if (points >= l.min) index = i;
  });
  const level = LEVELS[index];
  const next = LEVELS[index + 1] ?? null;
  return { level, index, next };
}

export type FanCardData = {
  id: string;
  username: string;
  avatarUrl: string | null;
  country: string | null;
  team: string | null;
  driver: string | null;
  age: number | null;
  tracks: string[];
  points: number;
  fanNumber: number;
  breakdown: {
    races: number;
    tips: number;
    posts: number;
    likes: number;
    complete: boolean;
  };
};

type ProfileRow = {
  id: string;
  username: string;
  avatar_url: string | null;
  country: string | null;
  birth_year: number | null;
  favorite_team: string | null;
  favorite_driver: string | null;
  tracks_visited: string[] | null;
  created_at: string;
};

export const FAN_CARD_PROFILE_FIELDS =
  "id, username, avatar_url, country, birth_year, favorite_team, favorite_driver, tracks_visited, created_at";

// Counts a fan's activity and turns it into points. Runs on the server with
// the signed-in visitor's session (all counted tables are readable by members).
export async function getFanCardData(
  supabase: SupabaseClient,
  profile: ProfileRow
): Promise<FanCardData> {
  const [posts, tips, likes, earlier] = await Promise.all([
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", profile.id),
    supabase
      .from("guide_entries")
      .select("id", { count: "exact", head: true })
      .eq("author_id", profile.id),
    supabase
      .from("post_likes")
      .select("id, posts!inner(author_id)", { count: "exact", head: true })
      .eq("posts.author_id", profile.id)
      .neq("user_id", profile.id),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .lte("created_at", profile.created_at),
  ]);

  const tracks = profile.tracks_visited ?? [];
  const complete = Boolean(
    profile.avatar_url &&
      profile.country &&
      profile.birth_year &&
      profile.favorite_team &&
      profile.favorite_driver
  );
  const breakdown = {
    races: tracks.length,
    tips: tips.count ?? 0,
    posts: posts.count ?? 0,
    likes: likes.count ?? 0,
    complete,
  };
  const points =
    breakdown.races * POINTS.raceAttended +
    breakdown.tips * POINTS.guideTip +
    breakdown.posts * POINTS.post +
    breakdown.likes * POINTS.likeReceived +
    (complete ? POINTS.completeProfile : 0);

  return {
    id: profile.id,
    username: profile.username,
    avatarUrl: profile.avatar_url,
    country: profile.country,
    team: profile.favorite_team,
    driver: profile.favorite_driver,
    age: profile.birth_year ? new Date().getFullYear() - profile.birth_year : null,
    tracks,
    points,
    fanNumber: Math.max(1, earlier.count ?? 1),
    breakdown,
  };
}

export function formatFanNumber(n: number) {
  return "#" + String(n).padStart(5, "0");
}
