import { requireOrgMembership } from "@/lib/auth/require-org-membership";
import { getReportsPageData } from "@/lib/queries/reports";
import { CreateReportForm } from "@/components/reports/create-report-form";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { formatDateTime } from "@/lib/utils/date";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getDefaultDates(){
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);

    return {
        defaultFrom: from.toISOString().split("T")[0],
        defaultTo: to.toISOString().split("T")[0],
    };
}

export default async function ReportPage({params,searchParams}:{params:Promise<{orgSlug:string}>;searchParams:Promise<{generated?:string}>}){
    const {orgSlug} = await params;
    const {generated} = await searchParams;

    const membership = await requireOrgMembership(orgSlug);
    const {reports} = await getReportsPageData(membership.organizationId);

    const canGenerate = ["OWNER","ADMIN","ANALYST"].includes(membership.role);
    const {defaultFrom,defaultTo} = getDefaultDates();

    return(
        <div className="space-y-6">
            <header className="space-y-2">
                <p className="text-sm font-medium text-zinc-500">Reporting</p>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                    Reports
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                    Generate PDF reports from your imported data. Each report captures
                    a date range of metrics and can be downloaded and shared with clients.
                </p>
            </header>

            {generated ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Report queued. PDF generation started in the background.
                </div>
            ):null}

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-semibold text-zinc-950">
                        Generate report
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Choose a date range and name your report. The PDF will be generated
                        from your imported data and available to download when ready.
                    </p>

                    <div className="mt-6">
                        <CreateReportForm
                            orgSlug={orgSlug}
                            defaultFrom={defaultFrom}
                            defaultTo={defaultTo}
                            disabled={!canGenerate}
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold text-zinc-950">
                            Generated reports
                        </h2>
                        <p className="text-sm text-zinc-500">{reports.length} total</p>
                    </div>

                    {reports.length === 0 ?(
                        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
                            No reports yet. Generate your first report using the form.
                        </div>
                    ):(
                        <div className="mt-6 space-y-3">
                            {reports.map((report)=>(
                                <article key={report.id} className="flex flex-wrap items-start justify-between gap-4 rounded border-zinc-200 bg-zinc-50 p-4">
                                    <div className="min-w-0 space-y-1">
                                        <p className="truncate font-medium text-zinc-950">
                                            {report.name}
                                        </p>

                                        <p className="text-xs text-zinc-500">
                                            {report.dateFrom && report.dateTo
                                                ? `${new Intl.DateTimeFormat("en-US", {
                                                    dateStyle: "medium",
                                                }).format(report.dateFrom)} — ${new Intl.DateTimeFormat(
                                                    "en-US",
                                                    { dateStyle: "medium" }
                                                ).format(report.dateTo)}`
                                                : "No date range"}
                                        </p>

                                        <p className="text-xs text-zinc-400">
                                            Created {formatDateTime(report.createdAt)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <ReportStatusBadge status={report.status} />


                                        {report.status === "READY" && report.fileUrl ? (
                                            <a href={`/api/reports/${report.id}/download`} className="inline-flex h-8 items-center rounded-lg bg-zinc-950 px-3 text-xs font-medium text-white transition hover:bg-zinc-800">
                                                Download PDF
                                            </a>
                                        ): null}

                                        {report.status === "QUEUED" ? (
                                            <span className="text-xs text-zinc-500">
                                                Generating...
                                            </span>
                                        ):null}

                                        {report.status === "FAILED" ? (
                                            <span className="text-xs text-red-600">
                                                Generation failed
                                            </span>
                                        ):null}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}