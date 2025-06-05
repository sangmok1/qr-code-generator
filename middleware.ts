import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // 인증이 필요하지 않은 경로들
  const publicPaths = ["/", "/login", "/api/auth", "/_next", "/favicon.ico"]

  // 현재 경로가 public 경로인지 확인
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // public 경로면 그대로 진행
  if (isPublicPath) {
    return NextResponse.next()
  }

  // NextAuth 세션 토큰 확인
  const token =
    request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token")

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - / (home page)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|$).*)",
  ],
}
