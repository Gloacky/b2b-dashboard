"use server";

import {prisma} from "@/lib/db/prisma";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import { redirect } from "next/navigation";

export async function acceptInviteAction(formData:FormData){
    const token = formData.get("token") as string;
    const user = await getCurrentAppUser();

    if(!user){
        redirect(`/auth/sign-in?next=/invite/${token}`);
    }

    const invite = await prisma.invite.findUnique({
        where:{token},
        include:{organization:true},
    });

    if(!invite || invite.expireAt < new Date()){
        throw new Error("Invalid or expired invite");
    }

    if (invite.email !== user.email){
        throw new Error("This is invite is not for you");
    }

    await prisma.$transaction(async (tx) => {
        const existingMembership = await tx.membership.findFirst({
            where: {
                userId: user.id,
                organizationId: invite.organizationId,
            },
        });

        if (existingMembership) {
            if (existingMembership.role !== "OWNER") {
                await tx.membership.update({
                    where: { id: existingMembership.id },
                    data: { role: invite.role },
                });
            }
        } else {
            await tx.membership.create({
                data: {
                    userId: user.id,
                    organizationId: invite.organizationId,
                    role: invite.role,
                },
            });
        }

        await tx.invite.update({
            where: { id: invite.id },
            data: {
                status: "ACCEPTED",
                acceptedAt: new Date(),
            },
        });
    });
    redirect("/");
}