import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { apiLimiter } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login"];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // Rate limit every API route. Fails open if Redis is unreachable.
  if (pathname.startsWith("/api/")) {
    if (apiLimiter) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
      try {
        const { success, limit, remaining, reset } = await apiLimiter.limit(ip);
        if (!success) {
          const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
          return NextResponse.json(
            { error: "rate_limited", message: "Too many requests. Try again shortly." },
            {
              status: 429,
              headers: {
                "Retry-After": String(retryAfter),
                "X-RateLimit-Limit": String(limit),
                "X-RateLimit-Remaining": String(remaining),
              },
            },
          );
        }
      } catch (error) {
        console.error("Rate limiter unavailable:", error);
      }
    }
    return NextResponse.next();
  }

  const isLoggedIn = Boolean(req.auth?.user);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isLoggedIn && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};