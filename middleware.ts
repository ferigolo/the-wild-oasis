import { MiddlewareConfig, NextResponse } from "next/server";

export function middleware(request: Request) {
  return NextResponse.redirect(new URL("/about", request.url));
}

export const config: MiddlewareConfig = { matcher: ["/account"] };
