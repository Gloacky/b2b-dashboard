import "server-only";

import {prisma} from "@/lib/db/prisma";
import { runReportScheduleNow } from "./run-report-schedule";

export async function runDueReportSchedules(){
    const now = new Date();

    const dueSchedules = await prisma.reportSchedule.findMany({
        where:{
            active:true,
            nextRunAt:{lte:now},
        },
        select:{
            id:true
        },
    });

    for (const schedule of dueSchedules){
        await runReportScheduleNow(schedule.id);
    }
    return dueSchedules.length;
}