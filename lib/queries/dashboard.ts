import { prisma } from "@/lib/db/prisma";

export async function getDashboardOverview(organizationId:string) {
    const [memberCount,dataSourceCount,reportCount,latestSyncJob,latestMetric] = await Promise.all([
        prisma.membership.count({where:{organizationId},}),
        prisma.dataSource.count({ where: { organizationId }, }),
        prisma.report.count({where:{organizationId}}),
        prisma.syncJob.findFirst({
            where:{organizationId},
            orderBy:{createdAt:"desc"},
            select:{
                status:true,
                createdAt:true,
                message:true,
            },
        }),

        prisma.metricsDaily.findFirst({
            where:{organizationId},
            orderBy: {date:"desc"},
            select:{date:true},
        }),
    ]);

    return{
        memberCount,dataSourceCount,reportCount,latestSyncJob,latestMetricDate: latestMetric?.date ?? null,
    };
}