import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import {prisma} from "@/lib/db/prisma";

export default async function AcceptInvitePage({params}:{params:Promise<{token:string}>}){
    const {token} = await params;
    const user = await getCurrentAppUser();

    if(!user){
        redirect(`/auth/sign-in?next=/invite/${token}`);
    }

    const invite = await prisma.invite.findUnique({
        where:{token},
        include:{organization:true},
    });

    if(!invite){
        return(
            <main className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                    <h1 className="text-lg font-semibold text-red-800">Invalid invite</h1>
                    <p className="mt-2 text-sm text-red-700">
                        This invite link is invalid or expired.
                    </p>
                </div>
            </main>
        );
    }

    if (invite.expireAt < new Date()) {
        return (
            <main className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                    <h1 className="text-lg font-semibold text-red-800">Invite expired</h1>
                    <p className="mt-2 text-sm text-red-700">
                        This invite link has expired. Please request a new one.
                    </p>
                </div>
            </main>
        );
    }

    const existingMembership = await prisma.membership.findFirst({
        where:{
            userId:user.id,
            organizationId:invite.organizationId,
        },
    });

    if(existingMembership){
        redirect (`/${invite.organization.slug}/dashboard`);
    }

    await prisma.$transaction(async (tx)=>{
        await tx.membership.create({
            data:{
                userId:user.id,
                organizationId:invite.organizationId,
                role:invite.role,
            },
        });

        await tx.invite.delete({
            where: {id:invite.id},
        });
    });
    redirect(`/${invite.organization.slug}/dashboard`);
}