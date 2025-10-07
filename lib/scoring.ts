// lib/scoring.ts
export type Game = "BGMI" | "Free Fire" | "Clash Royale";

// Placement points (1-indexed): 1st=10, 2nd=6, 3rd=5, 4th=4, 5th=3, 6th=2, 7-10th=1
const placementPoints = [0, 10, 6, 5, 4, 3, 2, 1, 1, 1];

export function scoreForResult(
  game: Game,
  opts: { placement?: number; kills?: number; didWin?: boolean }
) {
  if (game === "Clash Royale") {
    const wins = opts.didWin ? 1 : 0;
    return { points: wins * 3, wins, matches: 1 };
  }

  const p = opts.placement ?? 0;
  const base = placementPoints[p] ?? 0;
  const killPts = (opts.kills ?? 0) * 1;
  return { points: base + killPts, wins: 0, matches: 1 };
}
