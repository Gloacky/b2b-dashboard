"use server";

import "server-only";

import {after} from "next/server";
import {redirect} from "next/navigation";
import {z} from "zod";

import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import {prisma} from "@/lib/db/prisma";
import { generateReportPdf } from "@/jobs/generate-report-pdf";
import type { CreateReportState } from "@/lib/forms/create-report-state";

const CreateReportSchema = z.object({
    orgSlug: z.string().trim().min(1),
    name: z.string().trim().min(2).max(120),
    dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
    dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
});

const ALLOWED_REPORT_ROLES = new Set(["OWNER","ADMIN","ANALYST"]);

export async function createReportAction(_prevState:CreateReportState,formData:FormData):Promise<CreateReportState> {
    const user = await getCurrentAppUser();

    if(!user){
        return {error:"Your session expired. Please sign in again"};
    }

    const parsed = CreateReportSchema.safeParse({
        orgSlug:formData.get("orgSlug"),
        name:formData.get("name"),
        dateFrom:formData.get("dateFrom"),
        dateTo:formData.get("dateTo"),
    });

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Invalid form data.",
        };
    }

    const membership = user.memberships.find(
        (item) => item.organization.slug === parsed.data.orgSlug
    );

    if(!membership){
        return {error:"You no longer have access to this workspace."};
    }

    if(!ALLOWED_REPORT_ROLES.has(membership.role)){
        return {error:"You do not have permission to generate reports."};
    }

    const dateFrom = new Date(`${parsed.data.dateFrom}T00:00:00.000Z`);
    const dateTo = new Date(`${parsed.data.dateTo}T23:59:59.999Z`);

    if(dateFrom > dateTo){
        return {error:"Invalid Date."};
    }

    const report = await prisma.report.create({
        data:{
            organizationId:membership.organizationId,
            name:parsed.data.name,
            status:"QUEUED",
            dateFrom,
            dateTo,
        },
        select:{id:true},
    });

    after(async () =>{
        await generateReportPdf(report.id);
    });
    redirect(`/${parsed.data.orgSlug}/reports?generated=1`);
}