import { NextRequest } from "next/server";
import {prisma} from "@/lib/db/prisma";
import { requireAuthenticatedUser } from "@/lib/auth/require-authenticated-user";

export async function GET(request:NextRequest,{params}:{params: Promise<{jobId:string}>}){
    const {jobId} = await params;

    const user = await requireAuthenticatedUser();

    const job = await prisma.syncJob.findUnique({
        where:{id:jobId},
        select:{
            id:true,
            organizationId:true,
            status:true,
            progress:true,
            message:true,
            createdAt:true,
            finishedAt:true,
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

    if(!job){
        return new Response("Not found",{status:404});
    }

    if(job.organization.membership.length === 0){
        return new Response("Forbidden",{status:403});
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller){
            let previousPayload = "";

            const sendUpdate = async () => {
                const updated = await prisma.syncJob.findUnique({
                    where:{id:jobId},
                    select:{
                        id:true,
                        status:true,
                        progress:true,
                        message:true,
                        createdAt:true,
                        finishedAt:true,
                    },
                });

                if(!updated){
                    controller.close();
                    return;
                }

                const payload = JSON.stringify(updated);

                if(payload !== previousPayload){
                    controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
                    previousPayload = payload;
                }

                if (updated.status === "SUCCESS" || updated.status==="FAILED"){
                    controller.close();
                    return;
                }
            };

            sendUpdate();

            const interval = setInterval(sendUpdate,1500);

            request.signal.addEventListener("abort",() => {
                clearInterval(interval);
                controller.close();
            });
        },
    });

    return new Response(stream,{
        headers:{
            "Content-Type":"text/event-stream",
            "Cache-Control":"no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}