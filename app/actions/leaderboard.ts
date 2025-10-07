"use server";


import { getLeaderboardByGame } from "@/lib/teams";


export type Game = "BGMI" | "Free Fire" | "Clash Royale";


export async function getLeaderboard(game: Game) {
return getLeaderboardByGame(game);
}