import { NextResponse } from "next/server";
import { ensureSheet, listSheets, readSheet, appendRow } from "@/lib/sheets";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const op = searchParams.get("op") || "info";
  try {
    if (op === "info") {
      return NextResponse.json({
        ok: true,
        spreadsheetIdPresent: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        serviceEmailPresent:
          !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
          !!process.env.GOOGLE_SERVICE_EMAIL ||
          !!process.env.GOOGLE_CLIENT_EMAIL,
        keyPresent:
          !!process.env.GOOGLE_PRIVATE_KEY ||
          !!process.env.GOOGLE_PRIVATE_KEY_BASE64 ||
          !!process.env.GOOGLE_SERVICE_KEY ||
          !!process.env.GOOGLE_SERVICE_KEY_BASE64,
      });
    }
    if (op === "list") {
      const titles = await listSheets();
      return NextResponse.json({ ok: true, titles });
    }
    if (op === "ensure") {
      const title = searchParams.get("title") || "Teams";
      await ensureSheet(title);
      return NextResponse.json({ ok: true, ensured: title });
    }
    if (op === "read") {
      const range = searchParams.get("range") || "Teams!A1:Z1";
      const values = await readSheet(range);
      return NextResponse.json({ ok: true, values });
    }
    if (op === "appendTest") {
      await appendRow("Teams!A:K", [new Date().toISOString(), "TEST", "BGMI"]);
      return NextResponse.json({ ok: true, appended: true });
    }
    return NextResponse.json({ ok: false, error: "unknown op" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
