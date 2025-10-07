// app/actions/results.ts
"use server";

import { appendRow, getRange, setRange } from "@/lib/sheets";
import { scoreForResult, type Game } from "@/lib/scoring";

const TEAMS_RANGE   = "Teams!A2:J";     // read
const POINTS_RANGE  = "Teams!H2:J";     // write back (H..J)
const RESULTS_RANGE = "Results!A2:H";   // read/append

type BRInput = {
  matchId: string;
  teamId: string;
  game: "BGMI" | "Free Fire";
  placement: number;
  kills: number;
};

type CRInput = {
  matchId: string;
  game: "Clash Royale";
  winnerTeamId: string;
  loserTeamId: string;
};

export async function submitBattleRoyaleResult(input: BRInput) {
  const { points, wins, matches } = scoreForResult(input.game, {
    placement: input.placement,
    kills: input.kills,
  });

  const row = [
    input.matchId,
    input.teamId,
    input.game,
    String(input.placement),
    String(input.kills),
    "FALSE",                    // did_win
    String(points),
    new Date().toISOString(),
  ];
  await appendRow("Results!A2:H", row);

  // Optionally recompute immediately:
  await recomputeStandings();
}

export async function submitClashRoyaleResult(input: CRInput) {
  // Write two rows: winner and loser
  const winScore = scoreForResult("Clash Royale", { didWin: true });
  const loseScore = scoreForResult("Clash Royale", { didWin: false });

  const now = new Date().toISOString();
  await appendRow("Results!A2:H", [
    input.matchId,
    input.winnerTeamId,
    input.game,
    "", "", "TRUE",
    String(winScore.points),
    now,
  ]);
  await appendRow("Results!A2:H", [
    input.matchId,
    input.loserTeamId,
    input.game,
    "", "", "FALSE",
    String(loseScore.points),
    now,
  ]);

  await recomputeStandings();
}

/** Read all results, recompute totals per team, and write back to Teams!H:J */
export async function recomputeStandings(gameFilter?: Game) {
  // 1) Load teams (to keep row order for writing back)
  const teamRows = await getRange(TEAMS_RANGE);
  // Map teamId -> index in Teams (to update correct row)
  const idxById = new Map<string, number>();
  const teamInfo = teamRows.map((r, i) => {
    const id = r[0] || "";
    const game = (r[2] || "") as Game;
    idxById.set(id, i);
    return { id, game, status: (r[6] || "").toLowerCase() };
  });

  // 2) Load all results
  const results = await getRange(RESULTS_RANGE);

  // 3) Accumulate
  const totals: Record<string, { points: number; matches: number; wins: number }> = {};
  for (const r of results) {
    const teamId = r[1] || "";
    const game = (r[2] || "") as Game;
    if (gameFilter && game !== gameFilter) continue;

    const teamIdx = idxById.get(teamId);
    if (teamIdx === undefined) continue;

    const didWin = (r[5] || "").toUpperCase() === "TRUE";
    const placement = Number(r[3] || 0);
    const kills = Number(r[4] || 0);
    // points can be trusted from column G, but we can also recompute:
    const { points, matches, wins } = scoreForResult(game, { placement, kills, didWin });

    const t = (totals[teamId] ||= { points: 0, matches: 0, wins: 0 });
    t.points += points;
    t.matches += matches;
    t.wins += wins;
  }

  // 4) Build the write-back block in Teams row order (H..J)
  const values: (string | number)[][] = teamRows.map((r) => {
    const teamId = r[0] || "";
    const t = totals[teamId] || { points: 0, matches: 0, wins: 0 };
    return [t.points, t.matches, t.wins];
  });

  // 5) Write the block (one request)
  if (values.length > 0) {
    await setRange(POINTS_RANGE, values);
  }
}

/** Optional: who is the current winner per game (top row) */
export async function getWinners() {
  const teams = await getRange(TEAMS_RANGE);
  // Reduce to per-game top team by points, then wins
  const headerless = teams.map((r) => ({
    id: r[0], name: r[1], game: r[2] as Game,
    points: Number(r[7] || 0), matches: Number(r[8] || 0), wins: Number(r[9] || 0),
    status: (r[6] || "").toLowerCase(),
  })).filter(t => t.status !== "archived");

  const winners = new Map<Game, any>();
  for (const t of headerless) {
    const prev = winners.get(t.game);
    if (!prev) winners.set(t.game, t);
    else {
      if (
        t.points > prev.points ||
        (t.points === prev.points && t.wins > prev.wins) ||
        (t.points === prev.points && t.wins === prev.wins && t.name.localeCompare(prev.name) < 0)
      ) winners.set(t.game, t);
    }
  }
  return winners;
}
