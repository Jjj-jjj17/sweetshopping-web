import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16/17 Proxy Convention
 * Centralizes request handling/routing logic.
 */
import { auth } from "@/auth";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Identity Lock: Protect Admin Routes
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const session = await auth();
        if (!session?.user) {
            const url = req.nextUrl.clone();
            url.pathname = "/api/auth/signin";
            url.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(url);
        }
        // Note: Role check is best done in Layout or Page for granular control.
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
