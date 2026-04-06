import "server-only";

import { createReadStream } from "fs";
import readline from "node:readline";

import {parse} from "csv-parse";
import {z} from "zod";

import {prisma} from "@/lib/db/prisma";
import { normalizeMetricCsvHeaders, normalizeMetricCsvRecord } from "@/lib/csv/metrics-csv";
import { resolveCsvUploadPath } from "@/lib/storage/csv-files";

const StoredCsvCredentialsSchema = z.object({
    type: z.literal("csv-upload"),
    fileKey:z.string().min(1),
    originalFileName:z.string().min(1),
    sizeInBytes:z.number().int().nonnegative(),
    uploadedAt:z.string().min(1),
    format: z.literal("strict-v1"),
});

async function countCsvDataRows(filePath:string){
    const stream = createReadStream(filePath);
    const reader = readline.createInterface({
        input:stream,
        crlfDelay:Infinity,
    });

    let nonEmptyLineCount = 0;

    for await(const line of reader){
        if(line.trim()!==""){
            nonEmptyLineCount +=1;
        }
    }
    return Math.max(0,nonEmptyLineCount-1);
}

async function updateJob(
    jobId: string,
    data: {
        status?: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
        progress?: number;
        message?: string | null;
        startedAt?: Date;
        finishedAt?: Date;
    }
) {
    await prisma.syncJob.update({
        where: { id: jobId },
        data,
    });
}

export async function processCsvSyncJob(jobId:string){
    const job = await prisma.syncJob.findUnique({
        where:{id:jobId},
        select:{
            id:true,
            organizationId:true,
            dataSourceId:true,
            status:true,
            dataSource:{
                select:{
                    id:true,
                    status:true,
                    credentials:true,
                    organizationId:true,
                }
            }
        }
    });

    if(!job){
        return;
    }

    const dataSourceId = job.dataSourceId;

    try{
        if(job.status==='SUCCESS'){
            return;
        }
        await updateJob(jobId,{
            status:"RUNNING",
            progress:5,
            startedAt:new Date(),
            message:"Preparing CSV import",
        });

        const parsedCredentials = StoredCsvCredentialsSchema.safeParse(job.dataSource.credentials);

        if(!parsedCredentials.success){
            throw new Error("CSV file metadata is missing or invalid");
        }

        const filePath = resolveCsvUploadPath(parsedCredentials.data.fileKey);

        await prisma.dataSource.update({
            where: {id:dataSourceId},
            data: {status:"CONNECTED",},
        });

        await updateJob(jobId,{progress:12,message:"Counting rows",});

        const totalRows = await countCsvDataRows(filePath);

        if (totalRows === 0){
            throw new Error("CSV file has no data rows");
        }

        await updateJob(jobId,{
            progress:18,
            message:`Found ${totalRows.toLocaleString()} rows`,
        });

        await prisma.metricsDaily.deleteMany({
            where:{
                dataSourceId,
            },
        });

        await updateJob(jobId,{progress:25,message:"Importing metrics",});

        const parser = createReadStream(filePath).pipe(
            parse({
                bom:true,
                columns:normalizeMetricCsvHeaders,
                skip_empty_lines:true,
                trim:true,
            })
        );

        const batchSize = 1000;
        let batch: Array<{
            organizationId:string;
            dataSourceId: string;
            date: Date;
            channel: string | null;
            campaign: string | null;
            sessions: number;
            impressions: number;
            clicks: number;
            conversions: number;
            spend: string;
            revenue: string;
        }>=[];

        let importedRows = 0;

        for await (const record of parser){
            const rowNumber = importedRows + batch.length + 2;

            batch.push(
                normalizeMetricCsvRecord({
                    record,
                    organizationId:job.organizationId,
                    dataSourceId,
                    rowNumber,
                })
            );

            if (batch.length>=batchSize){
                await prisma.metricsDaily.createMany({
                    data:batch,
                });

                importedRows += batch.length;
                batch = [];

                const progress = totalRows>0
                    ? Math.min(95,25+Math.round((importedRows/totalRows)*65))
                    : 90;

                await updateJob(jobId,{progress,message:`Imported ${importedRows.toLocaleString()} of ${totalRows.toLocaleString()} rows`,});
            }
        }

        if (batch.length > 0){
            await prisma.metricsDaily.createMany({data:batch});
            importedRows += batch.length;
        }

        await prisma.dataSource.update({
            where:{id:dataSourceId},
            data:{
                status: "CONNECTED",
                lastSyncedAt: new Date(),
            },
        });

        await updateJob(jobId,{
            status:"SUCCESS",
            progress:100,
            finishedAt:new Date(),
            message: `Imported ${importedRows.toLocaleString()} rows successfully`,
        });
    }catch(error){
        const message = error instanceof Error
            ? error.message.slice(0,300)
            : "CSV import failed";

        await prisma.dataSource.update({
            where:{id:dataSourceId},
            data:{
                status:"ERROR",
            },
        }).catch(()=>null);

        await updateJob(jobId,{
            status:"FAILED",
            progress:100,
            finishedAt:new Date(),
            message,
        });

        console.error("[processCsvSyncJob] failed",error);
    }
}