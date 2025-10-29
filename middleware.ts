// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // IF DOESN'T LOGIN AND WANT TO GO ON DASHBOARD
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // IF LOGIN AND AGAIN WANT TO GO ON LOGIN PAGE -> REDIRECT TO DASHBOARD
  if (token && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// All Routes Where Middle-ware Will Apply.
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
