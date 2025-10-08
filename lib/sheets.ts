// lib/sheets.ts
// Env keys supported:
//   GOOGLE_SHEETS_SPREADSHEET_ID
//   GOOGLE_SERVICE_ACCOUNT_EMAIL  (or GOOGLE_SERVICE_EMAIL / GOOGLE_CLIENT_EMAIL)
//   GOOGLE_PRIVATE_KEY            (or GOOGLE_PRIVATE_KEY_BASE64 / GOOGLE_SERVICE_KEY / GOOGLE_SERVICE_KEY_BASE64)

import { google, sheets_v4 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

if (typeof window !== "undefined") {
  throw new Error("lib/sheets.ts must not run on the client");
}

// ---------- env helpers ----------
function firstEnv(names: string[]): { name: string | null; value: string } {
  for (const n of names) {
    const v = process.env[n];
    if (typeof v === "string" && v.length > 0) return { name: n, value: v };
  }
  return { name: null, value: "" };
}

function materializeKey(): string {
  let key = firstEnv(["GOOGLE_PRIVATE_KEY", "GOOGLE_SERVICE_KEY"]).value;
  if (!key) {
    const b64 = firstEnv(["GOOGLE_PRIVATE_KEY_BASE64", "GOOGLE_SERVICE_KEY_BASE64"]).value;
    if (b64) {
      try { key = Buffer.from(b64, "base64").toString("utf8"); } catch {}
    }
  }
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
  return key;
}

function getSpreadsheetId(): string {
  return firstEnv([
    "GOOGLE_SHEETS_SPREADSHEET_ID",
    "GOOGLE_SHEETS_ID",
    "SHEETS_ID",
    "GOOGLE_SPREADSHEET_ID",
  ]).value;
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

function makeClient(): { api: sheets_v4.Sheets; spreadsheetId: string } {
  const spreadsheetId = getSpreadsheetId();
  const { email, key } = getCreds();

  if (!spreadsheetId || !email || !key) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[sheets] Missing creds or sheet id", {
        spreadsheetId: !!spreadsheetId,
        emailVar: ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_EMAIL", "GOOGLE_CLIENT_EMAIL"].find(n => !!process.env[n]),
        keyVar:
          ["GOOGLE_PRIVATE_KEY", "GOOGLE_SERVICE_KEY"].find(n => !!process.env[n]) ||
          ["GOOGLE_PRIVATE_KEY_BASE64", "GOOGLE_SERVICE_KEY_BASE64"].find(n => !!process.env[n]),
      });
    }
    throw new Error("Missing Google service account envs or sheet id");
  }

  const auth = new google.auth.JWT({ email, key, scopes: SCOPES });
  const api = google.sheets({ version: "v4", auth });
  return { api, spreadsheetId };
}

// ---------- utilities ----------
function sheetTitleFromRange(range: string): string | null {
  // Supports: Sheet!A:Z or 'Sheet With Spaces'!A:Z
  const m = range.match(/^'([^']+)'!/); // quoted
  if (m) return m[1];
  const u = range.match(/^([^!'"]+)!/); // unquoted
  if (u) return u[1];
  return null;
}

// ---------- public API ----------
export type Cell = string | number | boolean | null;
export type Row = Cell[];
export type Grid = Row[];

export async function listSheets(): Promise<string[]> {
  const { api, spreadsheetId } = makeClient();
  const meta = await api.spreadsheets.get({ spreadsheetId });
  return (meta.data.sheets || [])
    .map(s => s.properties?.title)
    .filter((t): t is string => !!t);
}

/** Ensure a tab exists; optionally seed header row if empty. */
export async function ensureSheet(title: string, header?: string[]): Promise<void> {
  const { api, spreadsheetId } = makeClient();
  const titles = await listSheets();
  if (!titles.includes(title)) {
    await api.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    });
    if (header?.length) {
      await api.spreadsheets.values.update({
        spreadsheetId,
        range: `${title}!A1:${String.fromCharCode(64 + header.length)}1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [header] },
      });
    }
    return;
  }

  // If header provided and first row is empty, seed header.
  if (header?.length) {
    const cur = await api.spreadsheets.values.get({
      spreadsheetId,
      range: `${title}!1:1`,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    const row0 = (cur.data.values?.[0] as string[] | undefined) ?? [];
    const empty = row0.length === 0 || row0.every(c => c === "" || c == null);
    if (empty) {
      await api.spreadsheets.values.update({
        spreadsheetId,
        range: `${title}!A1:${String.fromCharCode(64 + header.length)}1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [header] },
      });
    }
  }
}

/** Read a range; safe-return [] on 404 to avoid crashing builds. */
export async function readSheet(range: string): Promise<string[][]> {
  let client;
  try { client = makeClient(); }
  catch { return []; }

  try {
    const res = await client.api.spreadsheets.values.get({
      spreadsheetId: client.spreadsheetId,
      range,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    return (res.data.values as string[][]) ?? [];
  } catch (err: any) {
    if (err?.code === 404 || err?.response?.status === 404) {
      console.warn("[sheets.readSheet] 404 for range:", range);
      return [];
    }
    throw err;
  }
}

/** Append but auto-create the tab if the API says “not found”, then retry once. */
export async function appendRow(range: string, values: Row): Promise<void> {
  const { api, spreadsheetId } = makeClient();
  try {
    await api.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    });
    return;
  } catch (err: any) {
    const title = sheetTitleFromRange(range);
    const notFound = err?.code === 404 || err?.response?.status === 404;
    if (notFound && title) {
      // ensure and retry once
      await ensureSheet(title);
      await api.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [values] },
      });
      return;
    }
    throw err;
  }
}

/** Update a rectangular grid. */
export async function setRange(range: string, values: Grid): Promise<void> {
  const { api, spreadsheetId } = makeClient();
  await api.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

// Back-compat aliases
export const getRange = readSheet;
export const writeSheet = appendRow;
