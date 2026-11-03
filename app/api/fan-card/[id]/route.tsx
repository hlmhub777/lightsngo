import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { circuitFlag } from "@/lib/circuits";
import {
  FAN_CARD_PROFILE_FIELDS,
  formatFanNumber,
  getFanCardData,
  levelFor,
} from "@/lib/fanCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Loads a Google font as TTF (ImageResponse can't read woff2).
async function loadFont(family: string, weight: number) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; LightsNGo)" } }
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

// GET /api/fan-card/<id> → a 1080x1920 PNG of the fan card, sized for
// Instagram / TikTok stories. Members only, like profiles themselves.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Sign in to see fan cards.", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select(FAN_CARD_PROFILE_FIELDS)
    .eq("id", params.id)
    .maybeSingle();
  if (!profile) return new Response("Fan not found.", { status: 404 });

  const card = await getFanCardData(supabase, profile as any);
  const { level, next } = levelFor(card.points);
  const [a, b, c] = level.frame;
  const tag = a === "#8A94A3" ? "#E6E9EE" : a;
  const flags = card.tracks.slice(0, 8).map((t) => circuitFlag(t)).join(" ");

  const [raj, rajMed] = await Promise.all([loadFont("Rajdhani", 700), loadFont("Rajdhani", 500)]);
  const fonts = [
    raj && { name: "Rajdhani", data: raj, weight: 700 as const, style: "normal" as const },
    rajMed && { name: "Rajdhani", data: rajMed, weight: 500 as const, style: "normal" as const },
  ].filter(Boolean) as any[];

  const stat = (label: string, value: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 220 }}>
      <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 30, letterSpacing: 6, color: "rgba(243,241,236,0.5)", marginTop: 8 }}>
        {label}
      </div>
    </div>
  );
  const small = (label: string, value: string | null) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 250 }}>
      <div style={{ fontSize: 26, letterSpacing: 5, color: "rgba(243,241,236,0.45)" }}>{label}</div>
      <div style={{ fontSize: 40, fontWeight: 700, color: value ? "#F3F1EC" : "rgba(243,241,236,0.3)" }}>
        {(value ?? "—").slice(0, 16)}
      </div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0E11",
          color: "#F3F1EC",
          fontFamily: "Rajdhani",
        }}
      >
        <div style={{ fontSize: 44, letterSpacing: 10, color: "rgba(243,241,236,0.6)", marginBottom: 40 }}>
          MY F1 FAN CARD
        </div>
        <div
          style={{
            display: "flex",
            width: 860,
            height: 1320,
            borderRadius: 48,
            padding: 10,
            backgroundImage: `linear-gradient(140deg, ${a}, ${b} 35%, ${c} 70%, ${a})`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              borderRadius: 40,
              padding: "56px 60px 44px",
              backgroundImage: "radial-gradient(circle at 25% 0%, #3A4250, #12161B 62%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 150, fontWeight: 700, lineHeight: 0.9 }}>
                  {card.points.toLocaleString("en-US")}
                </div>
                <div style={{ fontSize: 30, letterSpacing: 8, color: "rgba(243,241,236,0.5)" }}>POINTS</div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 18,
                    background: tag,
                    color: "#0B0E11",
                    fontSize: 44,
                    fontWeight: 700,
                    padding: "2px 22px",
                    borderRadius: 8,
                    alignSelf: "flex-start",
                  }}
                >
                  {level.name.toUpperCase()}
                </div>
              </div>
              <div style={{ display: "flex", padding: 8, borderRadius: 999, background: a }}>
                {card.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.avatarUrl}
                    width={290}
                    height={290}
                    style={{ borderRadius: 999, objectFit: "cover" }}
                    alt=""
                  />
                ) : (
                  <div
                    style={{
                      width: 290,
                      height: 290,
                      borderRadius: 999,
                      background: "#262C35",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 140,
                      fontWeight: 700,
                    }}
                  >
                    {card.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 50,
                paddingBottom: 18,
                borderBottom: "2px solid rgba(243,241,236,0.15)",
                fontSize: 96,
                fontWeight: 700,
              }}
            >
              {card.username.slice(0, 18)}
            </div>

            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 40 }}>
              {stat("RACES", String(card.tracks.length))}
              {stat("AGE", card.age ? String(card.age) : "—")}
              {stat("POSTS", String(card.breakdown.posts))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 44 }}>
              {small("COUNTRY", card.country)}
              {small("TEAM", card.team)}
              {small("DRIVER", card.driver)}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 44, fontSize: 64, minHeight: 80 }}>
              {flags || " "}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "auto",
                fontSize: 32,
                letterSpacing: 6,
                color: "rgba(243,241,236,0.65)",
              }}
            >
              <span>FAN {formatFanNumber(card.fanNumber)}</span>
              <span>LIGHTSNGO.COM</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 40, marginTop: 44, color: "rgba(243,241,236,0.7)", fontWeight: 500 }}>
          {next ? `Next level: ${next.name}` : "Top level reached"} · get yours on lightsngo.com
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: fonts.length ? fonts : undefined,
      emoji: "twemoji",
      headers: { "Cache-Control": "private, no-store" },
    }
  );
}
