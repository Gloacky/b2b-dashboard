import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const neonAuthMiddleware = auth.middleware({
    loginUrl: "/auth/sign-in",
});

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public/auth/static routes should pass through untouched.
    if (
        pathname.startsWith("/auth") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico"
        
    ) {
        return NextResponse.next();
    }

    if (
        pathname.startsWith("/api/realtime") ||
        pathname.startsWith("/api/jobs") ||
        pathname.startsWith("/api/reports") ||
        pathname.startsWith("/print")
    ) {
        return NextResponse.next();
    }

    /**
     * Critical:
     * Next.js server actions send an internal POST request with the `next-action` header.
     *
     * If middleware rewrites/redirects/modifies that response, the client throws:
     * "An unexpected response was received from the server."
     *
     * We bypass auth middleware here because the server action itself already
     * checks the authenticated user on the server.
     */
    if (request.method === "POST" && request.headers.has("next-action")) {
        return NextResponse.next();
    }

    return neonAuthMiddleware(request);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};