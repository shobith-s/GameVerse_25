"use server";

/**
 * Server actions for entering match results and recomputing standings.
 *
 * Depends on:
 *  - lib/sheets.ts exporting: appendRow, getRange, setRange
 *  - lib/scoring.ts exporting: scoreForResult, type Game
 *
 * Sheets layout (adjust ranges only if your headers differ):
 *  - Teams:   A:id, B:name, C:game, D:college, E:captain, F:email, G:status, H:points, I:matches, J:wins
 *  - Results: A:match_id, B:team_id, C:game, D:placement, E:kills, F:did_win, G:points, H:created_at
 */

import { appendRow, getRange, setRange } from "@/lib/sheets";
import { scoreForResult, type Game } from "@/lib/scoring";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const TEAMS_RANGE = "Teams!A2:J"; // read
const RESULTS_RANGE = "Results!A2:H"; // read/append
const POINTS_RANGE = "Teams!H2:J"; // write back (points, matches, wins)

// For bulk intake from the manual grid / CSV upload
export type BRRow = { teamName: string; placement: number; kills: number };

/** Simple auth gate for mutating actions (paired with middleware). */
function assertAdmin() {
  const token = cookies().get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    throw new Error("Unauthorized");
  }
}

/** Build a per-game map of normalized team name -> { id, name } from Teams sheet */
async function getTeamNameMap() {
  const rows = await getRange(TEAMS_RANGE);
  const norm = (s: string) => s.trim().toLowerCase();

  const byGame: Record<Game, Map<string, { id: string; name: string }>> = {
    BGMI: new Map(),
    "Free Fire": new Map(),
    "Clash Royale": new Map(),
  } as any;

  for (const r of rows) {
    const id = r[0]?.toString() || "";
    const name = r[1]?.toString() || "";
    const game = (r[2]?.toString() || "") as Game;
    const status = (r[6]?.toString() || "").toLowerCase(); // "active" / "archived"
    if (!id || !name || !game || status === "archived") continue;
    byGame[game].set(norm(name), { id, name });
  }

  return byGame;
}

/** For client-side datalists: list of team names by game */
export async function getTeamNamesByGame() {
  const maps = await getTeamNameMap();
  return {
    BGMI: Array.from(maps["BGMI"].values()).map((t) => t.name).sort(),
    "Free Fire": Array.from(maps["Free Fire"].values()).map((t) => t.name).sort(),
    "Clash Royale": Array.from(maps["Clash Royale"].values()).map((t) => t.name).sort(),
  } as Record<Game, string[]>;
}

/** Append a single BR (BGMI / Free Fire) result row to Results */
export async function submitBattleRoyaleResult(input: {
  matchId: string;
  teamId: string;
  game: Exclude<Game, "Clash Royale">;
  placement: number;
  kills: number;
}) {
  assertAdmin();

  const { points } = scoreForResult(input.game, {
    placement: input.placement,
    kills: input.kills,
  });

  const row = [
    input.matchId,
    input.teamId,
    input.game,
    String(input.placement),
    String(input.kills),
    "FALSE", // did_win
    String(points),
    new Date().toISOString(),
  ];

  await appendRow(RESULTS_RANGE, row);
  await recomputeStandings();
}

/**
 * Bulk submit 25-row BR results for a match.
 * - Resolves team names to team ids (case-insensitive)
 * - Computes points per row using scoreForResult
 * - Appends rows to Results and recomputes standings
 */
export async function submitBRBatch(params: {
  matchId: string;
  game: Exclude<Game, "Clash Royale">;
  entries: BRRow[];
}) {
  assertAdmin();

  const maps = await getTeamNameMap();
  const map = maps[params.game];
  const norm = (s: string) => s.trim().toLowerCase();

  const unknown: string[] = [];
  const rowsToAppend: any[][] = [];

  for (const e of params.entries) {
    if (!e.teamName) continue; // skip blank rows
    const found = map.get(norm(e.teamName));
    if (!found) {
      unknown.push(e.teamName);
      continue;
    }

    const { points } = scoreForResult(params.game, {
      placement: Number(e.placement || 0),
      kills: Number(e.kills || 0),
    });

    rowsToAppend.push([
      params.matchId,
      found.id,
      params.game,
      String(e.placement || 0),
      String(e.kills || 0),
      "FALSE",
      String(points),
      new Date().toISOString(),
    ]);
  }

  // Append rows (25 is small; simple loop is fine)
  for (const r of rowsToAppend) {
    await appendRow(RESULTS_RANGE, r);
  }

  await recomputeStandings();
  return { appended: rowsToAppend.length, unknown };
}

/** Clash Royale: record winner/loser for a match and recompute only CR */
export async function submitClashRoyaleResult(params: {
  matchId: string;
  winnerTeamId: string;
  loserTeamId: string;
}) {
  assertAdmin();

  const now = new Date().toISOString();

  // Winner row (3 points)
  await appendRow(RESULTS_RANGE, [
    params.matchId,
    params.winnerTeamId,
    "Clash Royale",
    "", // placement
    "", // kills
    "TRUE", // did_win
    "3", // points
    now,
  ]);

  // Loser row (0 points)
  await appendRow(RESULTS_RANGE, [
    params.matchId,
    params.loserTeamId,
    "Clash Royale",
    "",
    "",
    "FALSE",
    "0",
    now,
  ]);

  await recomputeStandings("Clash Royale");
}

/**
 * Recompute totals by reading all Results and updating Teams!H:J
 * - Uses scoreForResult to aggregate points/matches/wins
 * - Optional gameFilter to recompute only one game
 */
export async function recomputeStandings(gameFilter?: Game) {
  const teamRows = await getRange(TEAMS_RANGE);

  // 1) index by team id (keep row order for writeback)
  const idxById = new Map<string, number>();
  teamRows.forEach((r, i) => idxById.set(r[0]?.toString() || "", i));

  // 2) load results
  const results = await getRange(RESULTS_RANGE);

  // 3) accumulate (points, matches, wins)
  const totals: Record<string, { points: number; matches: number; wins: number }> = {};
  for (const r of results) {
    const teamId = r[1]?.toString() || "";
    const game = (r[2]?.toString() || "") as Game;
    if (!teamId || !game) continue;
    if (gameFilter && game !== gameFilter) continue;

    const didWin = (r[5]?.toString() || "").toUpperCase() === "TRUE";
    const placement = Number(r[3] || 0);
    const kills = Number(r[4] || 0);

    const { points, matches, wins } = scoreForResult(game, { placement, kills, didWin });
    const t = (totals[teamId] ||= { points: 0, matches: 0, wins: 0 });
    t.points += points;
    t.matches += matches;
    t.wins += wins;
  }

  // 4) build H..J block aligned to Teams row order
  const values = teamRows.map((r) => {
    const teamId = r[0]?.toString() || "";
    const t = totals[teamId] || { points: 0, matches: 0, wins: 0 };
    return [t.points, t.matches, t.wins];
  });

  if (values.length > 0) await setRange(POINTS_RANGE, values);

  // Revalidate pages that show these stats
  try {
    revalidatePath("/");
    revalidatePath("/leaderboard");
  } catch {}
}

/** Optional helper: current leader per game (useful for a “Champions” section) */
export async function getWinners() {
  const rows = await getRange(TEAMS_RANGE);
  type Row = {
    id: string; name: string; game: Game; status: string;
    points: number; matches: number; wins: number;
  };

  const teams: Row[] = rows
    .map((r) => ({
      id: r[0]?.toString() || "",
      name: r[1]?.toString() || "",
      game: (r[2]?.toString() || "") as Game,
      status: (r[6]?.toString() || "").toLowerCase(),
      points: Number(r[7] || 0),
      matches: Number(r[8] || 0),
      wins: Number(r[9] || 0),
    }))
    .filter((t) => t.id && t.name && t.status !== "archived");

  const winners = new Map<Game, Row>();
  for (const t of teams) {
    const prev = winners.get(t.game);
    if (!prev) {
      winners.set(t.game, t);
      continue;
    }
    if (
      t.points > prev.points ||
      (t.points === prev.points && t.wins > prev.wins) ||
      (t.points === prev.points && t.wins === prev.wins && t.name.localeCompare(prev.name) < 0)
    ) {
      winners.set(t.game, t);
    }
  }
  return winners;
}
