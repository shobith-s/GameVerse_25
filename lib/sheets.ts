// lib/sheets.ts
// Supports your env names:
//   - GOOGLE_SHEETS_SPREADSHEET_ID
//   - GOOGLE_SERVICE_ACCOUNT_EMAIL
//   - GOOGLE_PRIVATE_KEY  (or GOOGLE_PRIVATE_KEY_BASE64)
// Also supports common aliases for flexibility.

import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]; // read+write

// Server-only guard
if (typeof window !== "undefined") {
  throw new Error("lib/sheets.ts must not be imported on the client");
}

/** Return the first non-empty env var among candidates */
function firstEnv(cands: string[]): { name: string | null; value: string } {
  for (const n of cands) {
    const v = process.env[n];
    if (typeof v === "string" && v.length > 0) return { name: n, value: v };
  }
  return { name: null, value: "" };
}

/** Get private key from env (plain or base64), handling \n escaping */
function materializeKey(): string {
  // Prefer plain text first
  const keyPlain = firstEnv([
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_SERVICE_KEY",
  ]).value;

  let key = keyPlain;

  // Fallback to base64 variants
  if (!key) {
    const b64 = firstEnv([
      "GOOGLE_PRIVATE_KEY_BASE64",
      "GOOGLE_SERVICE_KEY_BASE64",
    ]).value;
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

function getCreds() {
  const email = firstEnv([
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_SERVICE_EMAIL",
    "GOOGLE_CLIENT_EMAIL",
  ]).value;

  const key = materializeKey();

  return { email, key };
}

function sheetsClient() {
  const { email, key } = getCreds();

  if (!email || !key) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[sheets] Missing Google creds", {
        cwd: process.cwd(),
        emailVar: ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_EMAIL", "GOOGLE_CLIENT_EMAIL"].find(
          (n) => !!process.env[n]
        ),
        keyVar:
          ["GOOGLE_PRIVATE_KEY", "GOOGLE_SERVICE_KEY"].find((n) => !!process.env[n]) ||
          ["GOOGLE_PRIVATE_KEY_BASE64", "GOOGLE_SERVICE_KEY_BASE64"].find((n) => !!process.env[n]),
        hasSheetId: !!firstEnv([
          "GOOGLE_SHEETS_SPREADSHEET_ID",
          "GOOGLE_SHEETS_ID",
          "SHEETS_ID",
          "GOOGLE_SPREADSHEET_ID",
        ]).value,
      });
    }
    throw new Error("Missing Google service account envs");
  }

  const auth = new google.auth.JWT({ email, key, scopes: SCOPES });
  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = firstEnv([
    "GOOGLE_SHEETS_SPREADSHEET_ID",
    "GOOGLE_SHEETS_ID",
    "SHEETS_ID",
    "GOOGLE_SPREADSHEET_ID",
  ]).value;

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID (or GOOGLE_SHEETS_ID / SHEETS_ID)");
  }

  return { sheets, spreadsheetId };
}

/** Append a single row to a range (USER_ENTERED) */
export async function appendRow(range: string, values: any[]) {
  const { sheets, spreadsheetId } = sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

/** Read a range and return rows as string[][] */
export async function getRange(range: string): Promise<string[][]> {
  const { sheets, spreadsheetId } = sheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return (res.data.values || []) as string[][];
}

export async function setRange(range: string, values: any[][]) {
  const { sheets, spreadsheetId } = sheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}
/** Aliases for compatibility with existing code */
export const readSheet = getRange;    // <- fixes your import in app/actions/leaderboard.ts
export const writeSheet = appendRow;
