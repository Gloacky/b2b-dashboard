"use client";

import { useEffect, useState } from "react";

type JobProgress = {
    id:string;
    status:"PENDING"|"RUNNING"|"SUCCESS"|"FAILED";
    progress:number;
    message?:string;
    createdAt:string;
    finishedAt:string;
};

export function useJobProgress(jobId?:string){
    const [job,setJob] = useState<JobProgress | null>(null);
    const [error,setError] = useState<string | null>(null);

    useEffect(()=>{
        if(!jobId){
            setJob(null);
            return;
        }

        const events = new EventSource(`/api/realtime/jobs/${jobId}`);

        events.onmessage = (event) => {
            try{
                const data = JSON.parse(event.data) as JobProgress;
                setJob(data);
                setError(null);
            }catch{
                setError("Failed to parse job update");
            }
        };

        events.onerror = () => {
            setError("Connection lost");
            events.close();
        };

        return () => {
            events.close();
        };
    },[jobId]);

    return {job,error};
}