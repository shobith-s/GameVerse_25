import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }
  cookies().set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return NextResponse.json({ ok: true });
}
