import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const TRUSTED_ORIGINS = [
  'https://yourdomain.com',
  'http://localhost:3000',
];

export async function middleware(request: NextRequest) {
  // 1. CORS check
  const origin = request.headers.get('origin');
  if (origin && !TRUSTED_ORIGINS.includes(origin)) {
    return new NextResponse('CORS Forbidden', { status: 403 });
  }

  // 2. CSRF (Origin/Referer check for mutating methods)
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const referer = request.headers.get('referer');
    if (origin && !TRUSTED_ORIGINS.includes(origin)) {
      return new NextResponse('CSRF Forbidden', { status: 403 });
    }
    if (referer && !TRUSTED_ORIGINS.some(o => referer.startsWith(o))) {
      return new NextResponse('CSRF Forbidden', { status: 403 });
    }
  }

  // 3. Supabase Auth and Session Management
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refresh session — important for SSR
  const { data: { user } } = await supabase.auth.getUser();

  // not logged in -> send to login (except auth pages themselves)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/register") &&
    !request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // already logged in but trying to access auth pages -> go home
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
