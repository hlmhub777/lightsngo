// Circuits fans can pick as "races attended" on their profile.
// Stored in profiles.tracks_visited as plain names (old free-text values still show).
export type Circuit = { name: string; place: string; flag: string };

export const CIRCUITS: Circuit[] = [
  { name: "Albert Park", place: "Melbourne", flag: "🇦🇺" },
  { name: "Shanghai", place: "China", flag: "🇨🇳" },
  { name: "Suzuka", place: "Japan", flag: "🇯🇵" },
  { name: "Bahrain", place: "Sakhir", flag: "🇧🇭" },
  { name: "Jeddah", place: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Miami", place: "USA", flag: "🇺🇸" },
  { name: "Imola", place: "Italy", flag: "🇮🇹" },
  { name: "Monaco", place: "Monte Carlo", flag: "🇲🇨" },
  { name: "Barcelona", place: "Spain", flag: "🇪🇸" },
  { name: "Madrid", place: "Spain", flag: "🇪🇸" },
  { name: "Montreal", place: "Canada", flag: "🇨🇦" },
  { name: "Red Bull Ring", place: "Austria", flag: "🇦🇹" },
  { name: "Silverstone", place: "Great Britain", flag: "🇬🇧" },
  { name: "Spa-Francorchamps", place: "Belgium", flag: "🇧🇪" },
  { name: "Hungaroring", place: "Budapest", flag: "🇭🇺" },
  { name: "Zandvoort", place: "Netherlands", flag: "🇳🇱" },
  { name: "Monza", place: "Italy", flag: "🇮🇹" },
  { name: "Baku", place: "Azerbaijan", flag: "🇦🇿" },
  { name: "Marina Bay", place: "Singapore", flag: "🇸🇬" },
  { name: "COTA", place: "Austin, USA", flag: "🇺🇸" },
  { name: "Mexico City", place: "Mexico", flag: "🇲🇽" },
  { name: "Interlagos", place: "São Paulo", flag: "🇧🇷" },
  { name: "Las Vegas", place: "USA", flag: "🇺🇸" },
  { name: "Lusail", place: "Qatar", flag: "🇶🇦" },
  { name: "Yas Marina", place: "Abu Dhabi", flag: "🇦🇪" },
];

export function circuitFlag(name: string): string {
  const c = CIRCUITS.find((x) => x.name.toLowerCase() === name.trim().toLowerCase());
  return c?.flag ?? "🏁";
}

export function ageFromBirthYear(year: number | null | undefined): number | null {
  if (!year) return null;
  return new Date().getFullYear() - year;
}
