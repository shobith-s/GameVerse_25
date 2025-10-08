"use server";

import { ensureSheet, appendRow } from "@/lib/sheets";
import { TEAMS_TAB } from "@/lib/constants";

export async function registerTeam(form: FormData) {
  const teamName = String(form.get("teamName") || "").trim();
  const game = String(form.get("game") || "").trim(); // "BGMI" | "Free Fire" | "Clash Royale"
  const captainName = String(form.get("captainName") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const email = String(form.get("email") || "").trim();
  const college = String(form.get("college") || "").trim();
  const players = JSON.parse(String(form.get("players") || "[]") || "[]");

  if (!teamName || !game || !captainName) {
    throw new Error("Missing required fields");
  }

  // Make sure the tab exists (first run on a new sheet)
  await ensureSheet(TEAMS_TAB, [
    "timestamp", "teamName", "game", "captainName",
    "phone", "email", "status", "playersJson",
    "college", "notes", "seed", "meta"
  ]);

  await appendRow(`${TEAMS_TAB}!A:L`, [
    new Date().toISOString(),
    teamName,
    game,
    captainName,
    phone,
    email,
    "active",
    JSON.stringify(players),
    college,
    "", // notes
    "", // seed
    "", // meta
  ]);

  return { ok: true };
}
