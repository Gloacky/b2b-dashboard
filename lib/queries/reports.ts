import "server-only";

import {prisma} from "@/lib/db/prisma";

export async function getReportsPageData(organizationId:string){
    const reports = await prisma.report.findMany({
        where:{organizationId},
        orderBy:{createdAt:"desc"},
        select:{
            id:true,
            name:true,
            status:true,
            fileUrl:true,
            createdAt:true,
            updatedAt:true,
            dateFrom:true,
            dateTo:true,
        },
    });

    const hasActiveReports = reports.some(
        (r) => r.status === "QUEUED"
    );

    return{reports,hasActiveReports};
}