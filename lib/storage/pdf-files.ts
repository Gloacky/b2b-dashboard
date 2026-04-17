import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";

const PDF_ROOT = path.join(process.cwd(),".data","reports");

function getOrganizationReportDir(organizationId:string){
    return path.join(PDF_ROOT,organizationId);
}

export async function savePdfReport(args:{buffer:Buffer;organizationId:string;reportId:string;}){
    const {buffer,organizationId,reportId} = args;

    const orgDir = getOrganizationReportDir(organizationId);
    await mkdir(orgDir, { recursive: true });

    const fileName = `${reportId}.pdf`;
    const absolutePath = path.join(orgDir,fileName);

    await writeFile(absolutePath,buffer);

    return {
        fileKey: path.relative(PDF_ROOT, absolutePath).replace(/\\/g, "/"),
    };
}

export function resolvePdfReportPath(fileKey:string){
    const absolutePath = path.resolve(PDF_ROOT,fileKey);

    if(!absolutePath.startsWith(path.resolve(PDF_ROOT))){
        throw new Error("Invalid file Path");
    }
    return absolutePath;
}

export function streamPdfReport(fileKey:string){
    const absolutePath=resolvePdfReportPath(fileKey);
    return createReadStream(absolutePath);
}