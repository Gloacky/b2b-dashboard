import { Suspense } from "react";
import { CampaignsTable } from "@/components/dashboard/campaigns-table";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChannelChart } from "@/components/charts/channel-chart";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { requireOrgMembership } from "@/lib/auth/require-org-membership";
import {getDashboardMetrics, getDashboardOverview, parseDateRangeFormParams, } from "@/lib/queries/dashboard";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
}

function formatPercent(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value);
}

export default async function DashboardPage({ params, searchParams }: { params: Promise<{ orgSlug:string }>; searchParams: Promise<{ from?: string; to?: string }>;}){
    const {orgSlug} = await params;
    const filters = await searchParams;

    const membership = await requireOrgMembership(orgSlug);
    const dateRange=parseDateRangeFormParams(filters);

    const [overview,metrics] = await Promise.all([
        getDashboardOverview(membership.organizationId),
        getDashboardMetrics(membership.organizationId,dateRange)
    ]);

    const fromStr = dateRange.from.toISOString().split("T")[0];
    const toStr = dateRange.to.toISOString().split("T")[0];

    const conversionRate = metrics.totals.spend > 0
        ? metrics.totals.revenue / metrics.totals.spend
        : 0;

    const roas = metrics.totals.spend > 0
        ? metrics.totals.revenue / metrics.totals.spend
        : 0;
    

    return(
        <div className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-500">Workspace overview</p>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                        {membership.organization.name}
                    </h1>
                </div>

                <Suspense fallback={null}>
                    <DateRangeFilter from={fromStr} to={toStr} />
                </Suspense>
            </header>

            {overview.dataSourceCount === 0 ? (
                <div className="rounded-2xl border border-dashded border-zinc-300 bg-zinc-50 p-8 text-center">
                    <p className="text-sm text-zinc-600">
                        No data source connected yet.{" "}
                        <a href={`/${orgSlug}/data-source`} className="font-medium text-zinc-950 underline underline-offset-4">
                            Upload your first CSV
                        </a>{" "}
                        to see real metrics here.
                    </p>
                </div>
            ):null}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Revenue"
                    value={formatCurrency(metrics.totals.revenue)}
                    description="Total revenue in selected period"
                />

                <StatCard
                    title="Ad Spend"
                    value={formatCurrency(metrics.totals.spend)}
                    description="Total advertising spend"
                />

                <StatCard
                    title="ROAS"
                    value={roas > 0 ? `${roas.toFixed(2)}x` : "—"}
                    description="Return on ad spend"
                />

                <StatCard
                    title="Conversions"
                    value={formatNumber(metrics.totals.conversions)}
                    description={`${formatPercent(conversionRate)} conversion rate`}
                />
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Sessions"
                    value={formatNumber(metrics.totals.sessions)}
                />

                <StatCard
                    title="Impressions"
                    value={formatNumber(metrics.totals.impressions)}
                />

                <StatCard
                    title="Clicks"
                    value={formatNumber(metrics.totals.clicks)}
                />

                <StatCard
                    title="Data Sources"
                    value={overview.dataSourceCount.toString()}
                />
            </section>

            <section className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-semibold text-zinc-950">
                        Revenue vs Spend
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">Daily performance trend</p>

                    <div className="mt-6">
                        <RevenueChart data={metrics.byDay} />
                    </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-semibold text-zinc-950">
                        Revenue by channel
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">Channel performance breakdown</p>

                    <div className="mt-6">
                        <ChannelChart data={metrics.byChannel} />
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-semibold text-zinc-950">Top campaigns</h2>
                <p className="mt-1 text-sm text-zinc-500">
                    Best performance by revenue
                </p>

                <div className="mt-6">
                    <CampaignsTable data={metrics.topCampaigns} />
                </div>
            </section>
        </div>
    );
}