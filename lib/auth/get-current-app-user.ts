import { cache } from "react";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/server";

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
 */
export const getCurrentAppUser = cache(async () => {
    
    const { data: session } = await auth.getSession();
    const sessionUser = session?.user;

    if (!sessionUser) {
        return null;
    }

    const normalizedName = normalizeNullableName(sessionUser.name);

    
    const existingUser = await prisma.user.findUnique({
        where: { authUserId: sessionUser.id },
        select: currentUserSelect,
    });

    if (!existingUser) {
        return prisma.user.create({
            data: {
                authUserId: sessionUser.id,
                email: sessionUser.email,
                name: normalizedName,
            },
            select: currentUserSelect,
        });
    }

    /**
     * Sync auth-profile data if it changed.
     */
    if (
        existingUser.email !== sessionUser.email ||
        existingUser.name !== normalizedName
    ) {
        return prisma.user.update({
            where: { id: existingUser.id },
            data: {
                email: sessionUser.email,
                name: normalizedName,
            },
            select: currentUserSelect,
        });
    }

    return existingUser;
});
