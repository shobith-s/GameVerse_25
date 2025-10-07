// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const isAdminArea =
    pathname.startsWith("/dashboard/results") || pathname.startsWith("/admin");

  if (!isAdminArea) return NextResponse.next();

  // allow reaching login + logout APIs/pages without cookie
  const passThrough =
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/logout");
  if (passThrough) return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;
  if (token && token === process.env.ADMIN_TOKEN) return NextResponse.next();

  // otherwise redirect to login, preserving the target path
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname + (searchParams ? `?${searchParams}` : ""));
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/results/:path*", "/admin/:path*"],
};
