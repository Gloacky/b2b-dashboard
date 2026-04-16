import { z } from "zod";

import { LiveSyncJobRow } from "@/components/data-source/live-sync-job-row";
import { CsvUploadForm } from "@/components/data-source/csv-upload-form";
import { requireOrgMembership } from "@/lib/auth/require-org-membership";
import { getDataSourcePageData } from "@/lib/queries/data-source";
import { LiveDataSourceRow } from "@/components/data-source/live-data-source-row";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const StoredCsvCredentialsSchema = z.object({
    type: z.literal("csv-upload"),
    fileKey: z.string(),
    originalFileName: z.string(),
    sizeInBytes: z.number(),
    uploadedAt: z.string(),
    format: z.literal("strict-v1"),
});

function readStoredCsvCredentials(value: unknown) {
    const parsed = StoredCsvCredentialsSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
}

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

export default async function DataSourcesPage({
    params,
    searchParams,
}: {
    params: Promise<{ orgSlug: string }>;
    searchParams: Promise<{ queued?: string }>;
}) {
    const { orgSlug } = await params;
    const { queued } = await searchParams;

    const membership = await requireOrgMembership(orgSlug);
    const { dataSource, recentJobs, hasActiveJobs } =
        await getDataSourcePageData(membership.organizationId);

    const canImport = ["OWNER", "ADMIN", "ANALYST"].includes(membership.role);

    return (
        <div className="space-y-6">
            

            <header className="space-y-2">
                <p className="text-sm font-medium text-zinc-500">Workspace data</p>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                    Data sources
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                    Upload raw CSV exports and normalize them into your reporting warehouse.
                    We’re starting with a strict CSV schema so imports are predictable,
                    fast, and easy to validate.
                </p>
            </header>

            {queued ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    CSV received. Import started in the background.
                </div>
            ) : null}

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_380px]">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-semibold text-zinc-950">Upload CSV</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Each upload creates a real workspace-scoped data source and a sync job.
                    </p>

                    <div className="mt-6">
                        <CsvUploadForm orgSlug={orgSlug} disabled={!canImport} />
                    </div>
                </div>

                <aside className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-semibold text-zinc-950">Accepted format</h2>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Required headers
                        </p>

                        <code className="mt-3 block overflow-x-auto rounded-lg bg-white p-3 text-xs text-zinc-800">
                            date,channel,campaign,sessions,impressions,clicks,conversions,spend,revenue
                        </code>
                    </div>

                    <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-600">
                        <li>• Date must use YYYY-MM-DD</li>
                        <li>• Empty numeric fields default to 0</li>
                        <li>• Channel and campaign may be blank</li>
                        <li>• Spend and revenue accept decimal numbers</li>
                    </ul>
                </aside>
            </section>

            <section className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-zinc-950">Connected sources</h2>
                        <p className="text-sm text-zinc-500">{dataSource.length} total</p>
                    </div>

                    {dataSource.length === 0 ? (
                        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
                            No data sources yet. Upload your first CSV to create one.
                        </div>
                    ) : (
                        <div className="mt-6 overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="text-zinc-500">
                                    <tr className="border-b border-zinc-200">
                                        <th className="pb-3 font-medium">Source</th>
                                        <th className="pb-3 font-medium">File</th>
                                        <th className="pb-3 font-medium">Rows</th>
                                        <th className="pb-3 font-medium">Last job</th>
                                        <th className="pb-3 font-medium">Last synced</th>
                                    </tr>
                                </thead>

                                    <tbody>
                                        {dataSource.map((source) => {
                                            const storedCsv = readStoredCsvCredentials(source.credentials);
                                            const latestJob = source.syncJobs[0];

                                            return (
                                                <LiveDataSourceRow
                                                    key={source.id}
                                                    source={{
                                                        id: source.id,
                                                        name: source.name,
                                                        provider: source.provider,
                                                        status: source.status,
                                                        lastSyncedAt: source.lastSyncedAt?.toISOString() ?? null,
                                                        createdAt: source.createdAt.toISOString(),
                                                        originalFileName: storedCsv?.originalFileName ?? null,
                                                        sizeInBytes: storedCsv?.sizeInBytes ?? null,
                                                        metricCount: source._count.metrics,
                                                        latestJob: latestJob
                                                            ? {
                                                                id: latestJob.id,
                                                                status: latestJob.status,
                                                                progress: latestJob.progress,
                                                                message: latestJob.message ?? null,
                                                                createdAt: latestJob.createdAt.toISOString(),
                                                                finishedAt: latestJob.finishedAt?.toISOString() ?? null,
                                                            }
                                                            : null,
                                                    }}
                                                />
                                            );
                                        })}
                                    </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-zinc-950">Recent sync jobs</h2>
                        {hasActiveJobs ? (
                            <span className="text-xs font-medium text-blue-700">
                                Auto-refreshing
                            </span>
                        ) : null}
                    </div>

                    {recentJobs.length === 0 ? (
                        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
                            No sync jobs yet.
                        </div>
                    ) : (
                        <div className="mt-6 space-y-4">
                                {recentJobs.map((job) => (
                                    <LiveSyncJobRow
                                        key={job.id}
                                        job={{
                                            ...job,
                                            createdAt: job.createdAt.toISOString(),
                                            finishedAt: job.finishedAt?.toISOString() ?? null,
                                        }}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}