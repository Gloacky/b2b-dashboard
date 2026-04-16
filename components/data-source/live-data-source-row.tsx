"use client";

import { useJobProgress } from "@/lib/realtime/use-job-progress";
import { JobStatusBadge } from "./job-status-badge";

type DataSourceRow = {
    id:string;
    name:string;
    provider:string;
    status:string;
    lastSyncedAt:string | null;
    createdAt: string;
    originalFileName: string | null;
    sizeInBytes: number | null;
    metricCount: number;
    latestJob: {
        id: string;
        status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
        progress: number;
        message: string | null;
        createdAt: string;
        finishedAt: string | null;
    } | null;
};

function formatBytes(bytes: number | null | undefined) {
    if (!bytes || bytes <= 0) return "—";

    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDateTime(value: string | null | undefined) {
    if (!value) return "Never";
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function LiveDataSourceRow({source}:{source:DataSourceRow}){
    const activeJobId = source.latestJob && source.latestJob.status !== "SUCCESS" && source.latestJob.status !== "FAILED"
        ? source.latestJob.id
        : undefined;

    const {job:liveJob} = useJobProgress(activeJobId);

    const displayJob = liveJob ?? source.latestJob;

    const isLiveSuccess = liveJob?.status === "SUCCESS" && source.latestJob?.status !== "SUCCESS";

    return (
        <tr className="border-b border-zinc-100 align-top last:border-b-0">
            <td className="py-4 pr-4">
                <div className="min-h-w-[180px]">
                    <p className="font-medium text-zinc-950">{source.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{source.provider} • {source.status}</p>
                </div>
            </td>

            <td className="py-4 pr-4">
                <div className="min-w-[180px]">
                    <p className="truncate text-zinc-900">
                        {source.originalFileName ?? "Unknown file"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        {formatBytes(source.sizeInBytes)}
                    </p>
                </div>
            </td>

            <td className="py-4 pr-4 text-zinc-900">
                {isLiveSuccess ?(
                    <span className="text-emerald-700 font-medium">
                        Imported ✓
                    </span>
                ):(
                    source.metricCount.toLocaleString()
                )}
            </td>

            <td className="py-4 pr-4">
                {displayJob ? (
                    <div className="min-w-[220px] space-y-2">
                        <JobStatusBadge status={displayJob.status} />

                        <p className="text-xs leading-5 text-zinc-600">
                            {displayJob.message ?? "No message"}
                        </p>

                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                            <div className="h-full rounded-full bg-zinc-950 transition-all duration-500" style={{width: `${displayJob.progress}%`}} />
                        </div>

                        <p className="text-xs text-zinc-500">
                            {displayJob.progress}%
                        </p>
                    </div>
                ):(
                    <span className="text-zinc-500">No jobs yet</span>
                )}
            </td>

            <td className="py-4 text-zinc-600">
                {isLiveSuccess
                    ? formatDateTime(liveJob?.finishedAt)
                    : formatDateTime(source.lastSyncedAt)
                }
            </td>
        </tr>
    );
}