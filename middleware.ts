import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const BILL_ADMIN_EMAIL = "wjluyk@gmail.com";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const email = data.user?.email?.trim().toLowerCase();
  const isAdmin = email === BILL_ADMIN_EMAIL;

  if (pathname.startsWith("/admin") && !isAdmin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "Administrator access required");

    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/score") && !data.user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "Score entry access required");

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/score/:path*", "/admin/:path*"],
};
