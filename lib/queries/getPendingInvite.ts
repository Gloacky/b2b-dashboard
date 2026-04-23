import "server-only";
import {prisma} from "@/lib/db/prisma";


export async function GetPendingInvite(userEmail:string){
    const invite = await prisma.invite.findFirst({
        where:{
            email:userEmail,
            expireAt:{
                gte:new Date(),
            },
            status:"PENDING"
        },
        select:{
            token:true,
            status:true,
        },
    });

    if(invite){
        return {invite};
    }
}