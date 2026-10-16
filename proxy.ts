import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const MENU_HOST = process.env.NEXT_PUBLIC_MENU_HOST ?? "menu.localhost";
const SESSION_COOKIE = "wm_admin_session";

function getHostname(request: NextRequest): string {
  return request.headers.get("host")?.split(":")[0] ?? "";
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hostname = getHostname(request);
  const isMenuHost = hostname.startsWith("menu.") || hostname === MENU_HOST;

  if (isMenuHost) {
    if (pathname === "/menu" || pathname.startsWith("/menu/")) {
      return NextResponse.next();
    }
    const target = pathname === "/" ? "/menu" : `/menu${pathname}`;
    return NextResponse.rewrite(new URL(target, request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Optimistic guard: the real authorization happens in the Data Access Layer.
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !request.cookies.has(SESSION_COOKIE)
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
