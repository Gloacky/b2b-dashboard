"use client";

import { JobStatusBadge } from "@/components/data-source/job-status-badge";
import { useJobProgress } from "@/lib/realtime/use-job-progress";

type SyncJobRow = {
    id: string;
    status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
    progress: number;
    message?: string | null;
    createdAt: string;
    finishedAt?: string | null;
    dataSource: {
        name: string;
    };
};

function formatDateTime(value: string | null | undefined) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function LiveSyncJobRow({ job }: { job: SyncJobRow }) {
    const { job: liveJob, error } = useJobProgress(
        job.status === "SUCCESS" || job.status === "FAILED" ? undefined : job.id
    );

    const display = liveJob ?? job;

    return (
        <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="font-medium text-zinc-950">{job.dataSource.name}</p>
                    <p className="text-xs text-zinc-500">
                        {formatDateTime(display.createdAt)}
                    </p>
                </div>

                <JobStatusBadge status={display.status} />
            </div>

            <p className="mt-3 text-sm leading-6 text-zinc-700">
                {display.message ?? "No message"}
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
                <div
                    className="h-full rounded-full bg-zinc-950 transition-all"
                    style={{ width: `${display.progress}%` }}
                />
            </div>

            {display.finishedAt ? (
                <p className="mt-2 text-xs text-zinc-500">
                    Finished: {formatDateTime(display.finishedAt)}
                </p>
            ) : null}

            {error ? (
                <p className="mt-2 text-xs text-red-600">{error}</p>
            ) : null}
        </article>
    );
}