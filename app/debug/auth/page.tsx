import { cookies, headers } from "next/headers";

import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import { getSessionUser } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

/**
 * Temporary debug page.
 *
 * This lets us inspect:
 * 1. whether the server can see the auth session
 * 2. whether the app-level Prisma user sync is working
 * 3. which cookies are present on the request
 *
 * Delete this page after debugging.
 */
export default async function DebugAuthPage() {
    const cookieStore = await cookies();
    const headerStore = await headers();

    let sessionUser: unknown;
    let appUser: unknown;

    try {
        sessionUser = await getSessionUser();
    } catch (error) {
        sessionUser = {
            error: error instanceof Error ? error.message : "Unknown session error",
        };
    }

    try {
        appUser = await getCurrentAppUser();
    } catch (error) {
        appUser = {
            error: error instanceof Error ? error.message : "Unknown app user error",
        };
    }

    return (
        <main className="p-6">
            <pre className="overflow-x-auto rounded-xl border bg-black p-4 text-sm">
                {JSON.stringify(
                    {
                        host: headerStore.get("host"),
                        origin: headerStore.get("origin"),
                        referer: headerStore.get("referer"),
                        cookieNames: cookieStore.getAll().map((cookie) => cookie.name),
                        sessionUser,
                        appUser,
                    },
                    null,
                    2
                )}
            </pre>
        </main>
    );
}