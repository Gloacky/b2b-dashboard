import "server-only";

import { prisma } from "@/lib/db/prisma";
import { getNextRunAt, getReportWindow } from "@/lib/reports/schedule";
import { generateReportPdf } from "@/jobs/generate-report-pdf";
import { sendReportsReadyEmail } from "@/lib/email/send-report-email";

export async function get(request:Request) {
    const authHeader = request.headers.get("authorization");
    const expected = process.env.CRON_SECRET;

    if(!expected || authHeader !== `Bearer ${expected}`){
        return Response.json({error:"Unauthorized"},{status:401});
    }

    const now = new Date();

    const dueSchedules = await prisma.reportSchedule.findMany({
        where:{
            active:true,
            nextRunAt:{
                lte:now,
            },
        },
        include:{
            organization:{
                select:{
                    id:true,
                    slug:true,
                    name:true,
                },
            },
        },
    });

    for (const schedule of dueSchedules){
        const window = getReportWindow({now,frequency:schedule.frequency});

        const report = await prisma.report.create({
            data:{
                organizationId:schedule.organizationId,
                name:`${schedule.name} - ${new Intl.DateTimeFormat("en-US",{
                    dateStyle:"medium",
                }).format(now)}`,
                status:"QUEUED",
                dateFrom:window.from,
                dateTo:window.to,
            },
            select:{id:true},
        });

        await generateReportPdf(report.id);

        const readyReport = await prisma.report.findUnique({
            where:{id:report.id},
            select:{
                id:true,
                name:true,
                status:true,
                fileUrl:true,
            },
        });

        if (readyReport?.status === "READY"){
            await sendReportsReadyEmail({
                to:schedule.recipientEmail,
                organizationName:schedule.organization.name,
                reportName:readyReport.name,
                downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/reports/${readyReport.id}/download`
            });
        }

        await prisma.reportSchedule.update({
            where:{id:schedule.id},
            data:{
                lastRunAt:now,
                nextRunAt:getNextRunAt({
                    from:now,
                    frequency:schedule.frequency,
                }),
            },
        });
    }

    return Response.json({
        ok: true,
        processed: dueSchedules.length,
    });
}