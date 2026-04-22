"use server";

import "server-only";

import {z} from "zod";
import { revalidatePath } from "next/cache";


import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import {prisma} from "@/lib/db/prisma";
import { getNextRunAt,type ScheduleFrequency } from "@/lib/reports/schedule";
import {type CreateReportScheduleState } from "@/lib/forms/create-report-schedule-state";
import { runReportScheduleNow } from "@/lib/reports/run-report-schedule";

const CreateScheduleSchema = z.object({
    orgSlug: z.string().trim().min(1),
    name:z.string().trim().min(2).max(120),
    recipientEmail:z.email(),
    frequency:z.enum(["WEEKLY","MONTHLY"]),
});

const ScheduleActionSchema = z.object({
    orgSlug: z.string().trim().min(1),
    scheduleId: z.string().trim().min(1),
});

function canManageSchedules(role: string) {
    return ["OWNER", "ADMIN", "ANALYST"].includes(role);
}

export async function createReportScheduleAction(_prevState:CreateReportScheduleState,formData:FormData):Promise<CreateReportScheduleState>{
    const user = await getCurrentAppUser();

    if(!user){
        return {
            error:"Your session expired. Please sign in again",
            success:null
        };
    }

    const parsed = CreateScheduleSchema.safeParse({
        orgSlug: formData.get("orgSlug"),
        name: formData.get("name"),
        recipientEmail: formData.get("recipientEmail"),
        frequency: formData.get("frequency"),
    });

    if(!parsed.success){
        return{
            error: parsed.error.issues[0]?.message ?? "invalid form data.",
            success:null,
        };
    }

    const membership = user.memberships.find(
        (item) => item.organization.slug === parsed.data.orgSlug
    );

    if (!membership) {
        return {
            error: "You no longer have access to this workspace.",
            success: null,
        };
    }

    if (!["OWNER", "ADMIN", "ANALYST"].includes(membership.role)) {
        return {
            error: "You do not have permission to schedule reports.",
            success: null,
        };
    }

    await prisma.reportSchedule.create({
        data:{
            organizationId:membership.organizationId,
            name:parsed.data.name,
            recipientEmail:parsed.data.recipientEmail.toLowerCase(),
            frequency: parsed.data.frequency as ScheduleFrequency,
            nextRunAt: getNextRunAt({
                from:new Date(),
                frequency: parsed.data.frequency as ScheduleFrequency,
            }),
        },
    });

    return{
        error:null,
        success:"Report schedule created successfuly",
    };
}

export async function toggleReportScheduleAction(formData:FormData){
    const user = await getCurrentAppUser();

    if(!user){
        throw new Error("Unauthorized");
    }

    const parsed = ScheduleActionSchema.safeParse({
        orgSlug:formData.get("orgSlug"),
        schedule:formData.get("scheduleId"),
    });

    if(!parsed.success){
        throw new Error("Invalid schedule action");
    }

    const membership = user.memberships.find(
        (item) => item.organization.slug === parsed.data.orgSlug
    );

    if (!membership || !canManageSchedules(membership.role)) {
        throw new Error("Forbidden");
    }

    const schedule = await prisma.reportSchedule.findFirst({
        where: {
            id: parsed.data.scheduleId,
            organizationId: membership.organizationId,
        },
        select: {
            id: true,
            active: true,
        },
    });

    if (!schedule) {
        throw new Error("Schedule not found");
    }

    await prisma.reportSchedule.update({
        where: { id: schedule.id },
        data: {
            active: !schedule.active,
        },
    });

    revalidatePath(`/${parsed.data.orgSlug}/reports`); 
}

export async function deleteReportScheduleAction(formData: FormData) {
    const user = await getCurrentAppUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const parsed = ScheduleActionSchema.safeParse({
        orgSlug: formData.get("orgSlug"),
        scheduleId: formData.get("scheduleId"),
    });

    if (!parsed.success) {
        throw new Error("Invalid schedule action");
    }

    const membership = user.memberships.find(
        (item) => item.organization.slug === parsed.data.orgSlug
    );

    if (!membership || !canManageSchedules(membership.role)) {
        throw new Error("Forbidden");
    }

    await prisma.reportSchedule.deleteMany({
        where: {
            id: parsed.data.scheduleId,
            organizationId: membership.organizationId,
        },
    });

    revalidatePath(`/${parsed.data.orgSlug}/reports`);
}

export async function runReportScheduleNowAction(formData: FormData) {
    const user = await getCurrentAppUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const parsed = ScheduleActionSchema.safeParse({
        orgSlug: formData.get("orgSlug"),
        scheduleId: formData.get("scheduleId"),
    });

    if (!parsed.success) {
        throw new Error("Invalid schedule action");
    }

    const membership = user.memberships.find(
        (item) => item.organization.slug === parsed.data.orgSlug
    );

    if (!membership || !canManageSchedules(membership.role)) {
        throw new Error("Forbidden");
    }

    const schedule = await prisma.reportSchedule.findFirst({
        where: {
            id: parsed.data.scheduleId,
            organizationId: membership.organizationId,
        },
        select: {
            id: true,
        },
    });

    if (!schedule) {
        throw new Error("Schedule not found");
    }

    /**
     * This lets you demo and test scheduled delivery from inside the app
     * without waiting for cron.
     */
    await runReportScheduleNow(schedule.id);

    revalidatePath(`/${parsed.data.orgSlug}/reports`);
}