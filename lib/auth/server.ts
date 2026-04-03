import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    },
});

export type SessionUser = {
    id: string;
    email: string;
    name: string | null;
};

/**
 * This is the bridge helper that the rest of your app uses.
 *
 * It reads the Neon Auth session and returns a simple typed user object,
 * or null if not authenticated.
 *
 * This abstraction keeps the rest of your app from needing to know
 * the exact shape of Neon's session response.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
    const { data: session } = await auth.getSession();

    if (!session?.user) {
        return null;
    }

    return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
    };
}