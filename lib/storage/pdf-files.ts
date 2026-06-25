import "server-only";

import { put } from "@vercel/blob";
import path from "node:path";

const PDF_ROOT = path.join(process.cwd(),".data","reports");

function getOrganizationReportDir(organizationId:string){
    return path.join(PDF_ROOT,organizationId);
}

export async function savePdfReport(args:{buffer:Buffer;organizationId:string;reportId:string;}){
    const {buffer,organizationId,reportId} = args;

    const blob = await put(
        `${organizationId}/${reportId}.pdf`,
        buffer,
        {
            access:"public",
            contentType:"application/pdf",
        }
    );

    return {
        url:blob.url,
        pathName:blob.pathname,
    };
}