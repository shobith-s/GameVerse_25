// lib/sheets.ts
// Supports envs:
//   GOOGLE_SHEETS_SPREADSHEET_ID
//   GOOGLE_SERVICE_ACCOUNT_EMAIL
//   GOOGLE_PRIVATE_KEY (or GOOGLE_PRIVATE_KEY_BASE64)
// Also accepts these aliases: GOOGLE_SERVICE_EMAIL, GOOGLE_CLIENT_EMAIL,
// GOOGLE_SERVICE_KEY, GOOGLE_SERVICE_KEY_BASE64, GOOGLE_SHEETS_ID, SHEETS_ID, GOOGLE_SPREADSHEET_ID

import { google, sheets_v4 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]; // read + write

// ---- Server-only guard ----
if (typeof window !== "undefined") {
  throw new Error("lib/sheets.ts must not be imported on the client");
}

// ---- Small helpers ----
function firstEnv(names: string[]): { name: string | null; value: string } {
  for (const n of names) {
    const v = process.env[n];
    if (typeof v === "string" && v.length > 0) return { name: n, value: v };
  }
  return { name: null, value: "" };
}

function materializeKey(): string {
  // Prefer plain text
  let key = firstEnv(["GOOGLE_PRIVATE_KEY", "GOOGLE_SERVICE_KEY"]).value;

  // Fallback to base64
  if (!key) {
    const b64 = firstEnv([
      "GOOGLE_PRIVATE_KEY_BASE64",
      "GOOGLE_SERVICE_KEY_BASE64",
    ]).value;
    if (b64) {
      try {
        key = Buffer.from(b64, "base64").toString("utf8");
      } catch {
        // ignore, validated below
      }
    }
  }

  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  return key;
}

function getCreds(): { email: string; key: string } {
  const email = firstEnv([
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_SERVICE_EMAIL",
    "GOOGLE_CLIENT_EMAIL",
  ]).value;

  const key = materializeKey();
  return { email, key };
}

function getSpreadsheetId(): string {
  return firstEnv([
    "GOOGLE_SHEETS_SPREADSHEET_ID",
    "GOOGLE_SHEETS_ID",
    "SHEETS_ID",
    "GOOGLE_SPREADSHEET_ID",
  ]).value;
}

function makeClient(): { api: sheets_v4.Sheets; spreadsheetId: string } {
  const { email, key } = getCreds();
  const spreadsheetId = getSpreadsheetId();

  if (!email || !key || !spreadsheetId) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[sheets] Missing Google creds or sheet id", {
        cwd: process.cwd(),
        emailVar: ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_EMAIL", "GOOGLE_CLIENT_EMAIL"].find(
          (n) => !!process.env[n]
        ),
        keyVar:
          ["GOOGLE_PRIVATE_KEY", "GOOGLE_SERVICE_KEY"].find((n) => !!process.env[n]) ||
          ["GOOGLE_PRIVATE_KEY_BASE64", "GOOGLE_SERVICE_KEY_BASE64"].find((n) => !!process.env[n]),
        hasSheetId: !!getSpreadsheetId(),
      });
    }
    throw new Error("Missing Google service account envs or sheet id");
  }

  const auth = new google.auth.JWT({ email, key, scopes: SCOPES });
  const api = google.sheets({ version: "v4", auth });
  return { api, spreadsheetId };
}

// ---- Public API ----

/** Read a range; fails safe (returns []) if 404 or creds missing. */
export async function readSheet(range: string): Promise<string[][]> {
  let client: { api: sheets_v4.Sheets; spreadsheetId: string };
  try {
    client = makeClient();
  } catch (err) {
    // No creds / sheet id during build or local env — do not crash
    console.warn("[sheets.readSheet] missing creds or sheet id; returning []");
    return [];
  }

  try {
    const res = await client.api.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    return (res.data.values as string[][]) ?? [];
  } catch (err: unknown) {
    const e = err as { code?: number; response?: { status?: number }; errors?: unknown };
    if (e?.code === 404 || e?.response?.status === 404) {
      console.warn("[sheets.readSheet] 404 for range", range);
      return [];
    }
    console.error("[sheets.readSheet] error", {
      code: e?.code,
      status: e?.response?.status,
      errors: e?.errors,
    });
    throw err;
  }
}

/** Append a single row (throws on failure — used for admin writes). */
export type Cell = string | number | boolean | null;
export type Row = Cell[];
export type Grid = Row[];

export async function appendRow(range: string, values: Row): Promise<void> {
  const { api, spreadsheetId } = makeClient();
  await api.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

/** Set a range with a 2D grid (throws on failure). */
export async function setRange(range: string, values: Grid): Promise<void> {
  const { api, spreadsheetId } = makeClient();
  await api.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

// ---- Backward-compatibility aliases ----
export const getRange = readSheet;   // old code calling getRange() will keep working
export const writeSheet = appendRow; // old code calling writeSheet() will keep working
