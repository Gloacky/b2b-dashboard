"use server";

import "server-only";

import {after} from "next/server";
import {redirect} from "next/navigation";
import {z} from "zod";

import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import {prisma} from "@/lib/db/prisma";
import { saveCsvUpload } from "@/lib/storage/csv-files";
import { UploadCsvState } from "@/lib/forms/upload-csv-state";
import { processCsvSyncJob } from "@/jobs/process-csv-async-job";

const UploadCsvSchema = z.object({
    orgSlug:z.string().trim().min(1),
    sourceName:z.string().trim().min(2).max(80),
});

const ALLOWED_IMPORT_ROLES = new Set(["OWNER","ADMIN","ANALYST"]);
const MAX_CSV_FILE_SIZE_BYTES=10*1024*1024;

export async function uploadCsvDataSourceAction(_prevState:UploadCsvState,formData:FormData):Promise<UploadCsvState>{
    const user = await getCurrentAppUser();

    if(!user){
        return{
            error:"Your session expired. Plea sign in again",
        };
    }

    const parsed = UploadCsvSchema.safeParse({
        orgSlug: formData.get("orgSlug"),
        sourceName: formData.get("sourceName"),
    });

    if(!parsed.success){
        return{
            error:"Please provide a valid source name.",
        };
    }

    const membership = user.memberships.find(
        (item) => item.organization.slug === parsed.data.orgSlug
    );

    if(!membership){
        return{
            error:"You no longer have access to this workspace",
        };
    }

    if(!ALLOWED_IMPORT_ROLES.has(membership.role)){
        return {
            error:"You do not have permission to import data into this workspace.",
        };
    }

    const file = formData.get("file");

    if(!(file instanceof File)){
        return{
            error:"Please choose a CSV file to upload.",
        };
    }

    if(!file.name.toLowerCase().endsWith(".csv")){
        return{
            error:"Only .csv fils are supported.",
        };
    }

    if(file.size>MAX_CSV_FILE_SIZE_BYTES){
        return{
            error:"CSV files must be 10 MB or smaller for this upload flow.",
        };
    }

    const storedFile = await saveCsvUpload({
        file,
        organizationId:membership.organizationId,
    });

    const created =  await prisma.$transaction(async (tx)=>{
        const dataSource = await tx.dataSource.create({
            data:{
                organizationId:membership.organizationId,
                provider:"CSV",
                name:parsed.data.sourceName,
                status:"CONNECTED",
                credentials:{
                    type:"csv-upload",
                    fileKey:storedFile.fileKey,
                    originalFileName:storedFile.originalFileName,
                    sizeInBtytes:storedFile.sizeInBytes,
                    uploadedAt: new Date().toISOString(),
                    format:"strict-v1",
                },
            },
            select:{
                id:true,
            },
        });

        const syncJob = await tx.syncJob.create({
            data:{
                organizationId: membership.organizationId,
                dataSourceId:dataSource.id,
                status:"PENDING",
                progress:0,
                message:"Queued for CSV import",
            },
            select:{
                id:true,
            },
        });
        return{
            dataSourceId:dataSource.id,
            jobId:syncJob.id,
        };
    });

    after(async()=>{
        await processCsvSyncJob(created.jobId);
    });
    redirect(`/${parsed.data.orgSlug}/data-source?queued=1`);
}