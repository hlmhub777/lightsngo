"use client";

/**
 * The five-light F1 start sequence: lights come on one at a time
 * left to right, hold together, then go out all at once
 * ("lights out and away we go"). Used as the logo mark and as a
 * hero / loading animation.
 */
export default function StartLights({
  size = "sm",
  loop = true,
}: {
  size?: "sm" | "lg";
  loop?: boolean;
}) {
  const dot = size === "lg" ? "h-5 w-5 sm:h-6 sm:w-6" : "h-2.5 w-2.5";
  const gap = size === "lg" ? "gap-2 sm:gap-3" : "gap-1";
  const pad = size === "lg" ? "p-3 sm:p-4" : "p-1.5";

  // Each light turns on at a staggered percentage of the cycle,
  // but every light turns off together at OFF_PERCENT.
  const ON_PERCENTS = [12, 22, 32, 42, 52];
  const OFF_PERCENT = 65;

  return (
    <div className={`inline-flex ${gap} rounded-sm bg-asphalt-800 ${pad}`}>
      {ON_PERCENTS.map((onPct, i) => (
        <span
          key={i}
          className={`rounded-full ${dot} bg-asphalt-600`}
          style={
            loop
              ? { animation: `lightseq-${i} 4s infinite` }
              : { backgroundColor: "#e10600", boxShadow: "0 0 8px rgba(225,6,0,0.7)" }
          }
        />
      ))}

      {loop && (
        <style jsx>{`
          ${ON_PERCENTS.map(
            (onPct, i) => `
            @keyframes lightseq-${i} {
              0%, ${onPct - 1}% {
                background-color: #3a4250;
                box-shadow: none;
              }
              ${onPct}%, ${OFF_PERCENT - 1}% {
                background-color: #e10600;
                box-shadow: 0 0 8px rgba(225, 6, 0, 0.7);
              }
              ${OFF_PERCENT}%, 100% {
                background-color: #3a4250;
                box-shadow: none;
              }
            }
          `
          ).join("\n")}
        `}</style>
      )}
    </div>
  );
}
