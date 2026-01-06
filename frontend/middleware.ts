import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/generate", "/history", "/plans", "/wallet", "/video-studio", "/app-loader"];
const BOOT_COOKIE = "valueai_boot";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("valueai_token")?.value;
  if (token && pathname.startsWith("/dashboard") && req.cookies.get(BOOT_COOKIE)?.value === "1") {
    const url = req.nextUrl.clone();
    url.pathname = "/app-loader";
    const res = NextResponse.redirect(url);
    res.cookies.set(BOOT_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }
  if (token) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/generate/:path*", "/history/:path*", "/plans/:path*", "/wallet/:path*", "/video-studio/:path*", "/app-loader"],
};
