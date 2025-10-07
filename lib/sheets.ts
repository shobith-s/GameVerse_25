import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY || '';
  // Turn escaped "\n" into real newlines:
  key = key.replace(/\\n/g, '\n');

  return new google.auth.JWT(
    email,
    undefined,
    key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
}

export const getGoogleSheetsClient = () => google.sheets({ version: 'v4', auth: getAuth() });

export const readSheet = async (range: string) => {
  const sheets = getGoogleSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return res.data.values || [];
};

export const appendRow = async (range: string, values: any[]) => {
  const sheets = getGoogleSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
};
