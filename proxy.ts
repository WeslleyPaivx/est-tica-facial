import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { buildCsp } from "@/lib/security/csp";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/auth/confirm", "/auth/error"];

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, {
    dev: process.env.NODE_ENV !== "production",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const { response, authenticated } = await updateSession(request, requestHeaders);
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  let result: NextResponse = response;
  if (!authenticated && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    result = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => result.cookies.set(c));
  }
  result.headers.set("Content-Security-Policy", csp);
  // páginas autenticadas nunca devem ir para cache compartilhado (isolamento entre tenants)
  result.headers.set("Cache-Control", "private, no-store");
  return result;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
