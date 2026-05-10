import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 中间件 - 认证保护
 * 保护需要登录的页面
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路径（不需要认证）
  const publicPaths = [
    "/",
    "/auth/login",
    "/auth/register",
    "/api/stocks",
    "/api/funds",
    "/api/scraper",
    "/api/cron",
  ];

  // 检查是否为公开路径
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith("/api/")
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 检查认证token（简化版，实际应使用Supabase Auth）
  const token = request.cookies.get("sb-access-token")?.value;

  if (!token) {
    // 未登录，重定向到登录页
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portfolio/:path*",
    "/alerts/:path*",
    "/stocks/:path*",
    "/funds/:path*",
  ],
};
