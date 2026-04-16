"use client";

import { useEffect, useState } from "react";

type JobProgress = {
    id: string;
    status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
    progress: number;
    message?: string | null;
    createdAt?: string;
    finishedAt?: string | null;
};

export function useJobProgress(jobId?: string) {
    const [job, setJob] = useState<JobProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!jobId) {
            setJob(null);
            return;
        }

        let retryCount = 0;
        const MAX_RETRIES = 3;
        let events: EventSource | null = null;
        let closed = false;

        function connect() {
            if (closed) return;

            events = new EventSource(`/api/realtime/jobs/${jobId}`);

            events.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data) as JobProgress;
                    setJob(data);
                    setError(null);

                    /**
                     * Once we receive a terminal state, we can stop.
                     * The server will close the stream, but we close our
                     * side too for safety.
                     */
                    if (data.status === "SUCCESS" || data.status === "FAILED") {
                        events?.close();
                        closed = true;
                    }
                } catch {
                    setError("Failed to parse job update");
                }
            };

            events.onerror = () => {
                events?.close();

                if (closed) return;

                /**
                 * Retry a few times before showing "Connection lost".
                 * This handles the case where the server closes the stream
                 * right after sending the final state and the browser
                 * briefly sees it as an error.
                 */
                if (retryCount < MAX_RETRIES) {
                    retryCount += 1;
                    setTimeout(connect, 1000 * retryCount);
                } else {
                    setError("Connection lost");
                }
            };
        }

        connect();

        return () => {
            closed = true;
            events?.close();
        };
    }, [jobId]);

    return { job, error };
}