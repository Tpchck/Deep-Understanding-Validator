import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getTrustedOrigins(): string[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const origins = ['http://localhost:3000'];
  if (siteUrl) origins.push(siteUrl.replace(/\/$/, ''));
  return origins;
}

export async function proxy(request: NextRequest) {
  const trustedOrigins = getTrustedOrigins();

  // 1. CORS check
  const origin = request.headers.get('origin');
  if (origin && !trustedOrigins.includes(origin)) {
    return new NextResponse('CORS Forbidden', { status: 403 });
  }

  // 2. CSRF (Referer check for mutating methods)
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const referer = request.headers.get('referer');
    if (referer && !trustedOrigins.some(o => referer.startsWith(o))) {
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

  // not logged in -> send to login (except public pages)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/register") &&
    !request.nextUrl.pathname.startsWith("/api/auth") &&
    request.nextUrl.pathname !== "/"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // already logged in but trying access auth pages -> go to dashboard
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname);
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
