// app/api/sheets-check/route.ts
import { NextResponse } from "next/server";
import { ensureSheet, readSheet } from "@/lib/sheets";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const op = searchParams.get("op") || "ping";

  try {
    if (op === "ping") return NextResponse.json({ ok: true });

    if (op === "info") {
      return NextResponse.json({
        ok: true,
        spreadsheetIdConfigured: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        serviceEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SERVICE_EMAIL || process.env.GOOGLE_CLIENT_EMAIL || null,
      });
    }

    if (op === "ensure") {
      const title = searchParams.get("title") || "Teams";
      const header = searchParams.getAll("h");
      await ensureSheet(title, header.length ? header : undefined);
      return NextResponse.json({ ok: true, ensured: title });
    }

    if (op === "read") {
      const range = searchParams.get("range") || "Teams!A:Z";
      const values = await readSheet(range);
      return NextResponse.json({ ok: true, values });
    }

    return NextResponse.json({ ok: false, error: "unknown op" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}
