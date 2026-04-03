import { cache } from "react";
import { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/server";

const currentUserSelect = {
    id: true,
    authUserId: true,
    email: true,
    name: true,
    createdAt: true,
    memberships: {
        orderBy: { createdAt: "asc" },
        select: {
            role: true,
            organizationId: true,
            createdAt: true,
            organization: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    createdAt: true,
                },
            },
        },
    },
} satisfies Prisma.UserSelect;

function normalizeNullableName(name: string | null | undefined) {
    const trimmed = name?.trim();
    return trimmed ? trimmed : null;
}

/**
 * cache() prevents duplicate DB work inside a single request tree.
 *
 * This helper:
 * 1. Reads the Neon Auth session
 * 2. Syncs/creates the local Prisma User row
 * 3. Returns the app user with memberships
 */
export const getCurrentAppUser = cache(async () => {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
        return null;
    }

    const normalizedName = normalizeNullableName(sessionUser.name);

    /**
     * upsert is cleaner and safer than separate find/create/update.
     *
     * It guarantees:
     * - a local User row exists for every authenticated session
     * - profile changes from auth sync to the app DB
     * - no race conditions on first login
     */
    return prisma.user.upsert({
        where: {
            authUserId: sessionUser.id,
        },
        create: {
            authUserId: sessionUser.id,
            email: sessionUser.email,
            name: normalizedName,
        },
        update: {
            email: sessionUser.email,
            name: normalizedName,
        },
        select: currentUserSelect,
    });
});