import "server-only";

import { chromium } from "playwright";

import {prisma} from "@/lib/db/prisma";
import { savePdfReport } from "@/lib/storage/pdf-files";

async function updateReport(
    reportId: string,
    data: {
        status?: "DRAFT" | "QUEUED" | "READY" | "FAILED";
        fileUrl?: string | null;
        message?: string;
    }
) {
    await prisma.report.update({
        where: { id: reportId },
        data,
    });
}

export async function generateReportPdf(reportId:string){
    const report = await prisma.report.findUnique({
        where:{id:reportId},
        select:{
            id:true,
            name:true,
            status:true,
            organization:{
                select:{
                    id:true,
                    slug:true,
                },
            },
        },
    });

    if (!report){
        console.error(`[generateReportPdf] report ${reportId} not found`);
        return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const printToken = process.env.REPORT_PRINT_TOKEN;

    if(!printToken){
        await updateReport(reportId,{status:"FAILED"});

        console.error("[generateReportPdf] REPORT_PRINT_TOKEN is not set");
        return;
    }

    let browser;

    try{
        await updateReport(reportId,{status:"QUEUED"});

        browser = await chromium.launch({args: ["--no-sandbox","--disable-setuid-sandbox"],});

        const page = await browser.newPage({viewport:{width:1280,height:900},});

        const printUrl = `${appUrl}/print/${report.organization.slug}/reports/${report.id}?token=${printToken}`;

        console.log(`[generateReportPdf] rendering ${printUrl}`);

        await page.goto(printUrl,{waitUntil:"networkidle",timeout:30000,});

        await page.waitForTimeout(1000);

        const pdfBuffer = await page.pdf({
            format:"A4",
            printBackground: true,
            margin:{
                top:"0px",
                right:"0px",
                bottom:"0px",
                left:"0px",
            },
        });

        const {fileKey} = await savePdfReport({
            buffer:Buffer.from(pdfBuffer),
            organizationId:report.organization.id,
            reportId:report.id,
        });

        await updateReport(reportId,{status:"READY",fileUrl:fileKey,});

        console.log(`[generateReportPdf] report ${reportId} ready`);
    }catch(error){
        console.error("[generateReportPdf] failed",error);

        await updateReport(reportId,{status:"FAILED",});
    }finally{
        if(browser){
            await browser.close();
        }
    }
}