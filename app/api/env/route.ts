export async function GET() {
const sheetId = firstEnv(["GOOGLE_SHEETS_ID", "SHEETS_ID"]);
const email = firstEnv(["GOOGLE_SERVICE_EMAIL", "GOOGLE_CLIENT_EMAIL"]);
const keyPlain = firstEnv(["GOOGLE_SERVICE_KEY", "GOOGLE_PRIVATE_KEY"]);
const keyB64 = firstEnv(["GOOGLE_SERVICE_KEY_BASE64", "GOOGLE_PRIVATE_KEY_BASE64"]);


// materialize the key length w/ \n replacement if present
let keyLen = 0;
if (keyPlain.value) keyLen = keyPlain.value.replace(/\\n/g, "\n").length;
else if (keyB64.value) {
try { keyLen = Buffer.from(keyB64.value, "base64").toString("utf8").length; } catch {}
}


return new Response(
JSON.stringify(
{
cwd: process.cwd(),
sheetIdVar: sheetId.name,
hasSheetId: !!sheetId.value,
emailVar: email.name,
hasEmail: !!email.value,
keyVar: keyPlain.name || keyB64.name,
usingBase64: !!keyB64.value,
keyLen,
},
null,
2
),
{ headers: { "content-type": "application/json" } }
);
}