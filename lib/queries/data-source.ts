import "server-only";

import {prisma} from "@/lib/db/prisma";

export async function getDataSourcePageData(organizationId:string){

    const[dataSource,recentJobs]=await Promise.all([
        prisma.dataSource.findMany({
            where:{
                organizationId,
            },
            orderBy:{
                createdAt:"desc",
            },
            select:{
                id: true,
                name: true,
                provider: true,
                status: true,
                lastSyncedAt: true,
                createdAt: true,
                credentials: true,
                _count:{
                    select:{
                        metrics:true,
                        syncJobs:true,
                    },
                },
                syncJobs:{
                    orderBy:{
                        createdAt:"desc",
                    },
                    take:1,
                    select:{
                        id: true,
                        status: true,
                        progress: true,
                        message: true,
                        createdAt: true,
                        finishedAt: true,
                    },
                },
            },
        }),
        prisma.syncJob.findMany({
            where:{
                organizationId,
            },
            orderBy:{
                createdAt:"desc",
            },
            take:10,
            select:{
                id: true,
                status: true,
                progress: true,
                message: true,
                createdAt: true,
                finishedAt: true,
                dataSource:{
                    select:{
                        name:true,
                    },
                },
            },
        }),
    ]);

    const hasActiveJobs = recentJobs.some(
        (job) => job.status === "PENDING" || job.status === "RUNNING"
    );
    return{
        dataSource,
        recentJobs,
        hasActiveJobs,
    };
}