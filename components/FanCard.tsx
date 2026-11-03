import Avatar from "@/components/Avatar";
import { circuitFlag } from "@/lib/circuits";
import { formatFanNumber, levelFor, type FanCardData } from "@/lib/fanCard";

// The Collector Card: a gold-edged trading-card style fan card.
// The frame colour follows the fan's level (Rookie → Racer → Podium → Legend).
export default function FanCard({ card }: { card: FanCardData }) {
  const { level, next } = levelFor(card.points);
  const [a, b, c] = level.frame;
  const progress = next
    ? Math.min(100, Math.round(((card.points - level.min) / (next.min - level.min)) * 100))
    : 100;

  const shown = card.tracks.slice(0, 8);
  const more = card.tracks.length - shown.length;

  return (
    <div
      className={
        "mx-auto w-full max-w-[340px] rounded-[18px] p-[3px] shadow-xl shadow-black/40" +
        (level.name === "Legend" ? " fan-card-legend" : "")
      }
      style={{ background: `linear-gradient(140deg, ${a}, ${b} 35%, ${c} 70%, ${a})` }}
    >
      <div
        className="relative overflow-hidden rounded-[16px] px-5 pb-4 pt-5"
        style={{ background: "radial-gradient(circle at 25% 0%, #3A4250, #12161B 62%)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-5xl font-700 leading-none text-paper">
              {card.points.toLocaleString("en-US")}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-paper/50">
              points
            </div>
            <div
              className="mt-2 inline-block rounded-sm px-2 py-0.5 font-display text-sm font-700 uppercase tracking-wide text-asphalt-950"
              style={{ background: a === "#8A94A3" ? "#E6E9EE" : a }}
            >
              {level.name}
            </div>
          </div>
          <div className="rounded-full p-[3px]" style={{ background: a }}>
            <Avatar url={card.avatarUrl} name={card.username} size={104} />
          </div>
        </div>

        <h3 className="mt-4 truncate border-b border-paper/15 pb-2 text-center font-display text-3xl font-700 text-paper">
          {card.username}
        </h3>

        <dl className="mt-3 grid grid-cols-3 text-center">
          <Stat label="Races" value={String(card.tracks.length)} />
          <Stat label="Age" value={card.age ? String(card.age) : "—"} />
          <Stat label="Posts" value={String(card.breakdown.posts)} />
        </dl>

        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Small label="Country" value={card.country} />
          <Small label="Team" value={card.team} />
          <Small label="Driver" value={card.driver} />
        </dl>

        <div className="mt-3 min-h-[28px] text-center text-xl leading-7 tracking-[0.2em]">
          {shown.length > 0 ? (
            <>
              {shown.map((t) => (
                <span key={t} title={t}>
                  {circuitFlag(t)}
                </span>
              ))}
              {more > 0 && (
                <span className="ml-1 align-middle font-mono text-xs tracking-normal text-paper/50">
                  +{more}
                </span>
              )}
            </>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-widest text-paper/30">
              No races yet
            </span>
          )}
        </div>

        {next && (
          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-asphalt-700">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: a }} />
            </div>
            <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-wider text-paper/40">
              {(next.min - card.points).toLocaleString("en-US")} pts to {next.name}
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-paper/60">
          <span>Fan {formatFanNumber(card.fanNumber)}</span>
          <span>lightsngo.com</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-display text-2xl font-700 leading-none text-paper">{value}</dd>
      <dt className="mt-1 font-mono text-[10px] uppercase tracking-widest text-paper/45">{label}</dt>
    </div>
  );
}

function Small({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[9px] uppercase tracking-widest text-paper/40">{label}</dt>
      <dd className={"truncate text-xs " + (value ? "text-paper/90" : "text-paper/30")}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
