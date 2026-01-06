import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type JwtPayload = {
  user_type?: string
  [key: string]: unknown
} | null

function decodePayload(token: string): JwtPayload {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(base64, 'base64').toString('utf8')
    return JSON.parse(json) as { user_type?: string; [key: string]: unknown }
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Allow public paths
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('vs_token')?.value
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const payload = decodePayload(token)
  if (!payload || payload.user_type !== 'admin') {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|icons|images).*)'],
}
