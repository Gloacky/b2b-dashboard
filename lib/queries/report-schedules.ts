import "server-only";

import {prisma} from "@/lib/db/prisma";

export async function getReportSchedules(organizationId:string){
    return prisma.reportSchedule.findMany({
        where:{organizationId},
        orderBy:{createdAt:"desc"},
        select:{
            id:true,
            name:true,
            recipientEmail:true,
            frequency:true,
            active:true,
            lastRunAt:true,
            nextRunAt:true,
            createdAt:true,
        },
    });
}