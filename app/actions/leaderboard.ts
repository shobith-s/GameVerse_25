"use server";

import { readSheet } from "@/lib/sheets";
import { TEAMS_TAB } from "@/lib/constants";
import type { Game } from "@/lib/types";

export async function getLeaderboard(game: Game) {
  const rows = await readSheet(`${TEAMS_TAB}!A:L`);
  if (rows.length <= 1) return [] as any[];
  const body = rows.slice(1);
  const byGame = body.filter((r) => r[2] === game && r[6] === "active");

  return byGame.map((r, idx) => ({
    rank: idx + 1,
    team: r[1] || "",
    points: Number(r[10] || 0) || 0,
    matches: Number(r[11] || 0) || 0,
    wins: Number(r[12] || 0) || 0,
    winRate: 0,
  }));
}
