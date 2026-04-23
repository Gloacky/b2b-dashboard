"use server";

import {prisma} from "@/lib/db/prisma";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import {redirect} from "next/navigation";

export async function declineInviteAction(formData:FormData){
    const token = formData.get("token") as string;
    const user = await getCurrentAppUser();

    if (!user) {
        redirect(`/auth/sign-in?next=/invite/${token}`);
    }

    const invite = await prisma.invite.findUnique({
        where: { token },
        include: { organization: true },
    });

    if (!invite || invite.expireAt < new Date()) {
        throw new Error("Invalid or expired invite");
    }

    if (invite.email !== user.email) {
        throw new Error("This is invite is not for you");
    }

    await prisma.$transaction(async (tx)=>{
        await tx.invite.update({
            where:{id:invite.id},
            data:{
                status:"DECLINED",
                acceptedAt:null,
            },
        });
    });

    redirect("/");

}