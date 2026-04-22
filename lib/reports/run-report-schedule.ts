import "server-only";

import {prisma} from "@/lib/db/prisma";
import { getNextRunAt, getReportWindow } from "./schedule";
import { generateReportPdf } from "@/jobs/generate-report-pdf";
import { sendReportsReadyEmail } from "../email/send-report-email";

export async function runReportScheduleNow(scheduleId:string){
    const schedule = await prisma.reportSchedule.findUnique({
        where:{id:scheduleId},
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

    if(!schedule){
        throw new Error("Schedule not found");
    }

    const now = new Date();

    const window = getReportWindow({
        now,frequency:schedule.frequency
    });

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
        select:{
            id:true
        },
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

    if (readyReport?.status === "READY") {
        await sendReportsReadyEmail({
            to: schedule.recipientEmail,
            organizationName: schedule.organization.name,
            reportName: readyReport.name,
            downloadUrl: `localhost:3000/api/reports/${readyReport.id}/download`,
        });
    }

    await prisma.reportSchedule.update({
        where:{id:schedule.id},
        data:{
            lastRunAt:now,
            nextRunAt:getNextRunAt({from:now,frequency:schedule.frequency}),
        },
    });

    return report.id;
}