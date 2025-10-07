// lib/teams.ts
// Helpers to read team data from Google Sheets and shape it for the app.
// Requires lib/sheets.ts (with getRange) to be configured and env vars set.

import { getRange } from "@/lib/sheets"; // If you don't use the @ alias, change to: ../lib/sheets

export type Team = {
  id: string;
  name: string;
  game: "BGMI" | "Free Fire" | "Clash Royale" | string;
  college: string;
  captainName: string;
  captainEmail: string;
  status: string; // e.g. "active"
  points: number; // column H (index 7)
  matches: number; // column I (index 8)
  wins: number; // column J (index 9)
};

export type LeaderboardRow = Team & { rank: number; winRate: string };

// Matches the row shape written by app/actions/teams.ts
// [id, team_name, game, college, captain_name, captain_email, status, points, matches, wins, phone, p2, p3, p4, p5]
const TEAMS_RANGE = "Teams!A2:O"; // skip the header

export async function getTeams(): Promise<Team[]> {
  const rows = await getRange(TEAMS_RANGE);
  return (rows || [])
    .filter((r) => (r?.[0] ?? "").trim() !== "")
    .map((r) => ({
      id: r[0] || "",
      name: r[1] || "",
      game: (r[2] || "") as Team["game"],
      college: r[3] || "",
      captainName: r[4] || "",
      captainEmail: r[5] || "",
      status: r[6] || "",
      points: Number(r[7] || 0),
      matches: Number(r[8] || 0),
      wins: Number(r[9] || 0),
    }));
}

export async function getCounts() {
  const teams = await getTeams();
  const teamsCount = teams.length;
  const gameSet = new Set(teams.map((t) => t.game).filter(Boolean));
  const gamesCount = gameSet.size;
  const matchesCount = teams.reduce((sum, t) => sum + (Number.isFinite(t.matches) ? t.matches : 0), 0);
  return { teams: teamsCount, matches: matchesCount, games: gamesCount };
}

export async function getLeaderboardByGame(game: Team["game"]): Promise<LeaderboardRow[]> {
  const teams = await getTeams();
  const filtered = teams.filter(
    (t) => t.game === game && (t.status || "").toLowerCase() !== "archived"
  );
  filtered.sort((a, b) => b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name));
  return filtered.map((t, i) => ({
    ...t,
    rank: i + 1,
    winRate: t.matches > 0 ? Math.round((t.wins / t.matches) * 100) + "%" : "0%",
  }));
}

// Optional: explicit re-exports (helps avoid tree-shaking edge cases)
export { getCounts as counts, getTeams as teams, getLeaderboardByGame as leaderboard };