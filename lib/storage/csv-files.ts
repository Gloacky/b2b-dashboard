import "server-only";

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
    await writeFile(absolutePath,buffer);

    return {
        fileKey: path.relative(UPLOADS_ROOT, absolutePath).replace(/\\/g, "/"),
        originalFileName:file.name,
        sizeInBytes:buffer.byteLength,
    };
}

export function resolveCsvUploadPath(fileKey:string){
    const absolutePath = path.resolve(UPLOADS_ROOT,fileKey);

    if(!absolutePath.startsWith(path.resolve(UPLOADS_ROOT))) {
        throw new Error("Invalid file path");
    }
    return absolutePath;
}