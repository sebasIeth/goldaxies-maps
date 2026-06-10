import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo proteger /admin
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("goldaxis-session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    if (!payload.twoFactorVerified) {
      return NextResponse.redirect(new URL("/login?step=2fa", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
