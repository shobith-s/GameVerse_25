// app/api/sheets-check/route.ts
import { NextResponse } from "next/server";
import { readSheet, ensureSheet } from "@/lib/sheets";
import { TEAMS_TAB } from "@/lib/constants";

export async function GET() {
  try {
    await ensureSheet(TEAMS_TAB); // no header change, just ensure exists
    const header = await readSheet(`${TEAMS_TAB}!1:1`);
    return NextResponse.json({ ok: true, tab: TEAMS_TAB, header: header[0] || [] });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
