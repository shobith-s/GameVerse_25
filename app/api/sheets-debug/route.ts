// app/api/sheets-debug/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { readSheet, listSheets } from "@/lib/sheets";

function mask(s: string, keep = 4) {
  if (!s) return s;
  if (s.length <= keep * 2) return s;
  return `${s.slice(0, keep)}…${s.slice(-keep)}`;
}

function getEnv(name: string): string {
  return process.env[name] || "";
}

function getServiceEmail(): string {
  return (
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    process.env.GOOGLE_SERVICE_EMAIL ||
    process.env.GOOGLE_CLIENT_EMAIL ||
    ""
  );
}

function materializeKey(): string {
  let key =
    process.env.GOOGLE_PRIVATE_KEY ||
    process.env.GOOGLE_SERVICE_KEY ||
    "";
  if (!key) {
    const b64 =
      process.env.GOOGLE_PRIVATE_KEY_BASE64 ||
      process.env.GOOGLE_SERVICE_KEY_BASE64 ||
      "";
    if (b64) {
      try {
        key = Buffer.from(b64, "base64").toString("utf8");
      } catch {
        // ignore; validated below
      }
    }
  }
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  return key;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const op = url.searchParams.get("op") || "probe";

  const spreadsheetId =
    getEnv("GOOGLE_SHEETS_SPREADSHEET_ID") ||
    getEnv("GOOGLE_SHEETS_ID") ||
    getEnv("SHEETS_ID") ||
    getEnv("GOOGLE_SPREADSHEET_ID");

  if (op === "info") {
    return NextResponse.json({
      ok: true,
      spreadsheetIdPresent: !!spreadsheetId,
      spreadsheetIdMasked: mask(spreadsheetId || ""),
      serviceEmail: getServiceEmail(), // <-- now defined
      hasKey:
        !!process.env.GOOGLE_PRIVATE_KEY ||
        !!process.env.GOOGLE_SERVICE_KEY ||
        !!process.env.GOOGLE_PRIVATE_KEY_BASE64 ||
        !!process.env.GOOGLE_SERVICE_KEY_BASE64,
    });
  }

  if (op === "probe") {
    try {
      const email = getServiceEmail();
      const key = materializeKey();
      if (!spreadsheetId || !email || !key) {
        return NextResponse.json(
          {
            ok: false,
            error: "Missing envs",
            spreadsheetId: !!spreadsheetId,
            email: !!email,
            key: !!key,
          },
          { status: 400 }
        );
      }

      const auth = new google.auth.JWT({
        email,
        key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      const api = google.sheets({ version: "v4", auth });

      // 1) metadata
      let metaOK = false;
      let metaErr: unknown = null;
      try {
        await api.spreadsheets.get({ spreadsheetId });
        metaOK = true;
      } catch (e) {
        metaErr = e;
      }

      // 2) values
      let valuesOK = false;
      let valuesErr: unknown = null;
      try {
        await api.spreadsheets.values.get({
          spreadsheetId,
          range: "Teams!A1:Z1",
        });
        valuesOK = true;
      } catch (e) {
        valuesErr = e;
      }

      return NextResponse.json({
        ok: metaOK && valuesOK,
        spreadsheetIdMasked: mask(spreadsheetId || ""),
        serviceEmail: email,
        metaOK,
        metaErr:
          metaErr &&
          (metaErr as any)?.response?.status &&
          ((metaErr as any)?.message || String(metaErr)),
        valuesOK,
        valuesErr:
          valuesErr &&
          (valuesErr as any)?.response?.status &&
          ((valuesErr as any)?.message || String(valuesErr)),
        hint:
          "If either metaOK or valuesOK is false with 404, the spreadsheet ID is wrong or the service account lacks access.",
      });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: (e as Error).message },
        { status: 500 }
      );
    }
  }

  if (op === "list") {
    try {
      const titles = await listSheets();
      return NextResponse.json({ ok: true, titles });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: (e as Error).message },
        { status: 500 }
      );
    }
  }

  if (op === "read") {
    const range = url.searchParams.get("range") || "Teams!A1:Z1";
    const values = await readSheet(range);
    return NextResponse.json({ ok: true, values });
  }

  return NextResponse.json({ ok: false, error: "unknown op" }, { status: 400 });
}
