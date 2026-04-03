"use server";

import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import { prisma } from "@/lib/db/prisma";
import { slugifyOrganizationName } from "@/lib/utils/slug";
import type { CreateOrganizationState } from "@/lib/forms/create-organization-state";

const CreateOrganizationSchema = z.object({
    name: z.string().trim().min(2).max(80),
});

export async function createOrganizationAction(
    _prevState: CreateOrganizationState,
    formData: FormData
): Promise<CreateOrganizationState> {
    const user = await getCurrentAppUser();

    /**
     * In a server action, returning an error state is safer than redirecting to sign-in.
     * Redirect responses during action POSTs can produce confusing client errors.
     */
    if (!user) {
        return {
            error: "Your session expired. Please sign in again.",
        };
    }

    const parsed = CreateOrganizationSchema.safeParse({
        name: formData.get("name"),
    });

    if (!parsed.success) {
        return {
            error: "Organization name must be between 2 and 80 characters.",
        };
    }

    const baseSlug = slugifyOrganizationName(parsed.data.name);

    let createdSlug: string | null = null;

    for (let attempt = 0; attempt < 8; attempt += 1) {
        const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

        try {
            const organization = await prisma.$transaction(async (tx) => {
                const createdOrganization = await tx.organization.create({
                    data: {
                        name: parsed.data.name,
                        slug,
                    },
                    select: {
                        id: true,
                        slug: true,
                    },
                });

                await tx.membership.create({
                    data: {
                        userId: user.id,
                        organizationId: createdOrganization.id,
                        role: "OWNER",
                    },
                });

                return createdOrganization;
            });

            createdSlug = organization.slug;
            break;
        } catch (error) {
            /**
             * Slug collision:
             * try the next slug variant instead of failing immediately.
             */
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                continue;
            }

            console.error("[createOrganizationAction] failed to create organization", error);

            return {
                error: "Something went wrong while creating the workspace.",
            };
        }
    }

    if (!createdSlug) {
        return {
            error: "Could not generate a unique workspace URL. Please try again.",
        };
    }

    /**
     * Important:
     * redirect is outside the try/catch so Next can handle it correctly.
     */
    redirect(`/${createdSlug}/dashboard`);
}