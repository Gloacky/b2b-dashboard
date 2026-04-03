import { StatCard } from "@/components/dashboard/stat-card";
import { requireOrgMembership } from "@/lib/auth/require-org-membership";
import { getDashboardOverview } from "@/lib/queries/dashboard";
import { formatDate,formatDateTime } from "@/lib/utils/date";

function formatRole(role: string){
    return role.charAt(0)+role.slice(1).toLowerCase();
}

export default async function DashboardPage({params}:{params:Promise<{orgSlug:string}>;}){
    const {orgSlug} = await params;

    const membership = await requireOrgMembership(orgSlug);
    const overview = await getDashboardOverview(membership.organizationId);

    return(
        <div className="space-y-6">
            <header className="space-y-2">
                <p className="text-sm font-medium text-zinc-700">Workspace overview</p>

                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                    {membership.organization.name}
                </h1>

                <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                    This dashboard shell is already using real organization-scoped data.
                    As we add ingestion next, your metrics, sync jobs, and reports will plug
                    directly into the same workspace.
                </p>
            </header>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard 
                    title="Member" 
                    value={overview.memberCount.toLocaleString()} 
                    description="Users who currently have access to this workspace"
                />
                <StatCard
                    title="Data sources"
                    value={overview.dataSourceCount.toLocaleString()}
                    description="Connected integrations and file imports in this organization."
                />

                <StatCard
                    title="Reports"
                    value={overview.reportCount.toLocaleString()}
                    description="Generated, queued, or draft reports tied to this workspace."
                />

                <StatCard
                    title="Latest data date"
                    value={formatDate(overview.latestMetricDate)}
                    description="Most recent normalized metric available in the reporting warehouse."
                />
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-zinc-950">Current status</h2>

                    <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-zinc-500">Your role</dt>
                            <dd className="mt-1 text-sm text-zinc-950">
                                {formatRole(membership.role)}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-zinc-500">Workspace slug</dt>
                            <dd className="mt-1 break-all text-sm text-zinc-950">
                                {membership.organization.slug}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-zinc-500">Workspace created</dt>
                            <dd className="mt-1 text-sm text-zinc-950">
                                {formatDateTime(membership.organization.createdAt)}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-zinc-500">Last sync job</dt>
                            <dd className="mt-1 text-sm text-zinc-950">
                                {overview.latestSyncJob
                                    ? `${overview.latestSyncJob.status} • ${formatDateTime(overview.latestSyncJob.createdAt)}`
                                    : "No sync jobs yet"
                                }
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-zinc-950">Next build target</h2>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                        <p className="text-sm leading-6 text-zinc-700">
                            Right now this is a real, empty-state workspace. The next phase is
                            CSV ingestion so this page starts filling with actual metrics instead
                            of zeros.
                        </p>
                    </div>

                    <ul className="mt-4 space-y-3 text-sm text-zinc-600">
                        <li>• Upload CSV files to a workspace-scoped data source</li>
                        <li>• Normalize rows into <code>MetricDaily</code></li>
                        <li>• Track sync jobs from the database</li>
                        <li>• Replace empty states with real KPI cards and charts</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}