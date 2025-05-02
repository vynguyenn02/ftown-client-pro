import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/product', '/cart']; 

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log('🛠 [MW] path=', pathname);
  console.log('🛠 [MW] cookies=', req.cookies.getAll());

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    console.log('🟢 [MW] public, skip auth');
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  console.log('🔒 [MW] protecting, token=', token);

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    console.log('➡️ [MW] redirect to login');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
