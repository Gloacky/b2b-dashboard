"use server";

import "server-only";

import {z} from "zod";
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import {prisma} from "@/lib/db/prisma";
import { slugifyOrganizationName } from "@/lib/utils/slug";
import { Ewert } from "next/font/google";

const InviteSchema = z.object({
    orgSlug: z.string().min(1),
    email:z.email(),
    role: z.enum(["ADMIN","ANALYST","CLIENT"]),
});

export type InviteState={
    error:string | null;
    success?:string;
};

export async function createInviteAction(_prevState:InviteState,formData:FormData):Promise<InviteState>{
    const user = await getCurrentAppUser();

    if(!user) {
        return {error:"Your session expired. Please log in again."};
    }

    const parsed = InviteSchema.safeParse({
        orgSlug:formData.get("orgSlug"),
        email:formData.get("email"),
        role:formData.get("role"),
    });

    if(!parsed.success){
        return {error:"Invalid form data."};
    }

    const membership = user.memberships.find(
        (m) => m.organization.slug === parsed.data.orgSlug
    );

    if(!membership){
        return {error:"You no longer have access to this workspace."};
    }

    if(!["OWNER","ADMIN"].includes(membership.role)){
        return {error:"Only owners and admins can invite team members."};
    }

    if(parsed.data.email.toLowerCase()===user.email.toLowerCase()){
        return {error:"You are already a member of this workspace."};
    }

    const existingInvite = await prisma.invite.findFirst({
        where:{
            organizationId:membership.organizationId,
            email:parsed.data.email.toLowerCase(),
        },
    });

    if(existingInvite){
        return {error:"An invite already exists for this email."};
    }

    const existingMember = await prisma.user.findFirst({
        where:{
            email:parsed.data.email.toLowerCase(),
            memberships:{
                some:{organizationId:membership.organizationId},
            },
        },
    });

    if(existingMember){
        return {error:"This user is already a member of this workspace."};
    }

    const token = require("crypto").randomBytes(32).toString("hex");

    await prisma.invite.create({
        data:{
            email:parsed.data.email.toLowerCase(),
            organizationId:membership.organizationId,
            role:parsed.data.role,
            token,
            expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    // TODO: send email with invite link

    const inviteLink = `${process.env.NEON_AUTH_BASE_URL}/invites/${token}`;
    console.log(`[invite] ${parsed.data.email} -> ${inviteLink}`);

    return{
        success:`Invite sent to ${parsed.data.email}.`,
        error:null,
    };
}