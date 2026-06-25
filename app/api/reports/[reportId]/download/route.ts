import { NextRequest } from "next/server";
import {prisma} from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/require-authenticated-user";

export async function GET(request: NextRequest,{ params }: { params: Promise<{ reportId: string }> }){
    const {reportId} = await params;

    const user = await requireAuthenticatedUser();

    const report = await prisma.report.findUnique({
        where:{id:reportId},
        select:{
            id:true,
            name:true,
            status:true,
            fileUrl:true,
            organization:{
                select:{
                    membership:{
                        where:{userId:user.id},
                        select:{role:true},
                    },
                },
            },
        },
    });

    if(!report){
        return new Response("Not found",{status:404});
    }

    if(report.organization.membership.length===0){
        return new Response("Forbidden",{status:403});
    }

    if(report.status !== "READY" || !report.fileUrl){
        return new Response("Report is not ready yet.",{status:409});
    }

    try{
        const response = await fetch(report.fileUrl);

        if(!response.ok || !response.body){
            return new Response("File not found",{
                status:404,
            });
        }

        const safeName = report.name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").toLowerCase();

        return new Response(response.body,{
            headers:{
                "Content-Type":"application/pdf",
                "Content-Disposition":`attachment; filename=${safeName}.pdf`,
                "Cache-Control":"private, no-cache",
            },
        });
    }catch(error){
        console.error("[/api/reports/download]",error);
        return new Response ("File not found",{status:404,});
    }
}