import "server-only";
import { put } from "@vercel/blob";

import { randomUUID } from "node:crypto";
import { mkdir,writeFile } from "node:fs/promises";
import path from "node:path";


const UPLOADS_ROOT = path.join(process.cwd(),".data","uploads");

function sanitizeFileName(fileName:string){
    return fileName.replace(/[^w.-]+/g,"-").toLowerCase();
}

function getOrganizationUploadDir(organizationId:string){
    return path.join(UPLOADS_ROOT,organizationId);
}

export async function saveCsvUpload(args:{file:File;organizationId:string;}){
    const {file,organizationId}=args;

    const organizationDir = getOrganizationUploadDir(organizationId);
    await mkdir(organizationDir,{recursive:true});

    const extension = path.extname(file.name).toLocaleLowerCase() || ".csv";

    const storedName = `${Date.now()}-${randomUUID()}-${sanitizeFileName(path.basename(file.name,extension))}${extension}`;

    const absolutePath = path.join(organizationDir,storedName);

    const buffer = Buffer.from(await file.arrayBuffer());

    
    const blob = await put(storedName,file,{
        access:"private"
    });

    return {
        blobUrl:blob.url,
        pathname:blob.pathname,
        originalFileName:file.name,
        sizeInBytes:buffer.byteLength,
    };
}