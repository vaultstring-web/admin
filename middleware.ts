import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// no-op middleware for now

export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|icons|images).*)'],
}
