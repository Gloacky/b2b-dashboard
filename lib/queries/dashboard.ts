import "server-only";

import { prisma } from "@/lib/db/prisma";
import { reverse } from "dns";

export type DateRange={
    from: Date;
    to: Date;
};

function getDefaultDateRange(): DateRange{
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);

    return {from,to};
}

export function parseDateRangeFormParams(params:{from?:string;to?:string}): DateRange{
    const defaultRange = getDefaultDateRange();

    let from = defaultRange.from;
    let to = defaultRange.to;

    if(params.from){
        const parsed = new Date(params.from);
        if(!isNaN(parsed.getTime())){
            from = parsed;
        }
    }

    if (params.to){
        const parsed = new Date(params.to);
        if(!isNaN(parsed.getTime())){
            to = parsed;
        }
    }

    if(from > to ){
        [from,to]=[to,from];
    }

    return {from,to};
}

export async function getDashboardOverview(organizationId:string,dateRange:DateRange) {
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

    const where = {
        organizationId,
        date:{
            gte:dateRange.from,
            lte:dateRange.to,
        },
    };

    const [totals,byDay,byChannel,topCampaigns] = await Promise.all([
        prisma.metricsDaily.aggregate({
            where,
            _sum:{
                sessions:true,
                impressions:true,
                clicks:true,
                conversions:true,
                spend:true,
                revenue:true,
            },
        }),

        prisma.metricsDaily.groupBy({
            by:["date"],
            where,
            _sum:{
                revenue:true,
                spend:true,
                sessions:true,
                conversions:true,
            },
            orderBy:{
                date:"asc",
            },
        }),

        prisma.metricsDaily.groupBy({
            by:["channel"],
            where,
            _sum:{
                revenue:true,
                spend:true,
                sessions:true,
                clicks:true,
                conversions:true,
            },
            orderBy:{
                _sum:{
                    revenue:"desc",
                },
            },
        }),

        prisma.metricsDaily.groupBy({
            by:["campaign","channel"],
            where,
            _sum:{
                revenue:true,
                spend:true,
                clicks:true,
                conversions:true,
            },
            orderBy:{
                _sum:{
                    revenue:"desc",
                },
            },
            take:10,
        }),

    ]);

    

    return{
        memberCount, dataSourceCount, reportCount, latestSyncJob, latestMetricDate: latestMetric?.date ?? null, 
        totals: {
            sessions: totals._sum.sessions ?? 0,
            impressions: totals._sum.impressions ?? 0,
            clicks: totals._sum.clicks ?? 0,
            conversions: totals._sum.conversions ?? 0,
            spend: Number(totals._sum.spend ?? 0),
            revenue: Number(totals._sum.revenue ?? 0),
        },
        byDay: byDay.map((row) => ({
            date: row.date.toISOString().split("T")[0],
            revenue: Number(row._sum.revenue ?? 0),
            spend: Number(row._sum.spend ?? 0),
            sessions: row._sum.sessions ?? 0,
            conversions: row._sum.conversions ?? 0,
        })),
        byChannel: byChannel.map((row) => ({
            channel: row.channel ?? "Direct",
            revenue: Number(row._sum.revenue ?? 0),
            spend: Number(row._sum.spend ?? 0),
            sessions: row._sum.sessions ?? 0,
            clicks: row._sum.clicks ?? 0,
            conversions: row._sum.conversions ?? 0,
        })),
        topCampaigns: topCampaigns.map((row) => ({
            campaign: row.campaign ?? "No campaign",
            channel: row.channel ?? "Direct",
            revenue: Number(row._sum.revenue ?? 0),
            spend: Number(row._sum.spend ?? 0),
            clicks: row._sum.clicks ?? 0,
            conversions: row._sum.conversions ?? 0,
        })),
    };
}