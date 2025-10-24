import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value; // token login Supabase
  const path = req.nextUrl.pathname;

  // Jika user belum login dan mencoba masuk ke dashboard → redirect ke home
  if (!token && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Jika sudah login dan mencoba ke /login atau /register → redirect ke dashboard
  if (token && (path.startsWith("/login") || path.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next(); // lanjut ke halaman berikutnya
}

// Tentukan route mana saja yang akan dilindungi
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
