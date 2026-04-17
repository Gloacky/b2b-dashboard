import { notFound } from "next/navigation";
import {prisma} from "@/lib/db/prisma";
import { getDashboardMetrics } from "@/lib/queries/dashboard";
import { formatDateTime } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value:number){
    return new Intl.NumberFormat("en-US").format(value);
}

function calculateROAS(revenue: number, spend: number) {
    if (spend === 0) return "∞";
    return `${(revenue / spend).toFixed(2)}x`;
}

export default async function ReportPrintPage({params,searchParams,}:{params:Promise<{orgSlug:string;reportId:string}>;searchParams:Promise<{token?:string}>;}){
    const {orgSlug,reportId} = await params;
    const {token} = await searchParams;

    const expectedToken = process.env.REPORT_PRINT_TOKEN;

    if(!expectedToken || token !== expectedToken){
        notFound();
    }

    const report = await prisma.report.findFirst({
        where:{
            id:reportId,
            organization:{slug:orgSlug},
        },
        select:{
            id:true,
            name:true,
            dateFrom:true,
            dateTo:true,
            createdAt:true,
            organization:{
                select:{
                    name:true,
                    id:true,
                },
            },
        },
    });

    if(!report || !report.dateFrom || !report.dateTo){
        notFound();
    }

    const metrics = await getDashboardMetrics(report.organization.id,{from:report.dateFrom,to:report.dateTo,});

    const conversionRate = metrics.totals.clicks > 0 ? (metrics.totals.conversions / metrics.totals.clicks) * 100 : 0;

    const roas = metrics.totals.spend > 0 ? metrics.totals.revenue / metrics.totals.spend : 0;

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{report.name}</title>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 14px;
                color: #09090b;
                background: #fff;
                padding: 40px;
                line-height: 1.5;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding-bottom: 24px;
                border-bottom: 2px solid #09090b;
                margin-bottom: 32px;
              }
              .org-name {
                font-size: 22px;
                font-weight: 700;
                color: #09090b;
              }
              .report-name {
                font-size: 14px;
                color: #71717a;
                margin-top: 4px;
              }
              .date-range {
                font-size: 13px;
                color: #71717a;
                text-align: right;
              }
              .section-title {
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: #71717a;
                margin-bottom: 16px;
              }
              .kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 32px;
              }
              .kpi-card {
                border: 1px solid #e4e4e7;
                border-radius: 12px;
                padding: 16px;
              }
              .kpi-label {
                font-size: 12px;
                color: #71717a;
                font-weight: 500;
              }
              .kpi-value {
                font-size: 22px;
                font-weight: 700;
                margin-top: 8px;
                color: #09090b;
              }
              .kpi-sub {
                font-size: 12px;
                color: #a1a1aa;
                margin-top: 4px;
              }
              .section {
                margin-bottom: 32px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
              }
              th {
                text-align: left;
                padding: 10px 12px;
                border-bottom: 2px solid #e4e4e7;
                font-weight: 600;
                color: #71717a;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.04em;
              }
              td {
                padding: 12px;
                border-bottom: 1px solid #f4f4f5;
                vertical-align: top;
              }
              tr:last-child td {
                border-bottom: none;
              }
              .text-right { text-align: right; }
              .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 600;
              }
              .badge-green { background: #f0fdf4; color: #15803d; }
              .badge-amber { background: #fffbeb; color: #b45309; }
              .badge-red { background: #fef2f2; color: #b91c1c; }
              .channel-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #f4f4f5;
              }
              .channel-bar-wrap {
                width: 180px;
                height: 6px;
                background: #f4f4f5;
                border-radius: 999px;
                overflow: hidden;
              }
              .channel-bar {
                height: 100%;
                background: #09090b;
                border-radius: 999px;
              }
              .footer {
                margin-top: 40px;
                padding-top: 16px;
                border-top: 1px solid #e4e4e7;
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #a1a1aa;
              }
            `,
                    }}
                />
            </head>
            <body>
                {/* Header */}
                <div className="header">
                    <div>
                        <div className="org-name">{report.organization.name}</div>
                        <div className="report-name">{report.name}</div>
                    </div>
                    <div className="date-range">
                        <div>
                            {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                report.dateFrom
                            )}{" "}
                            —{" "}
                            {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                                report.dateTo
                            )}
                        </div>
                        <div style={{ marginTop: "4px" }}>
                            Generated {formatDateTime(report.createdAt)}
                        </div>
                    </div>
                </div>

                {/* KPI summary */}
                <div className="section">
                    <div className="section-title">Performance summary</div>

                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-label">Revenue</div>
                            <div className="kpi-value">
                                {formatCurrency(metrics.totals.revenue)}
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-label">Ad Spend</div>
                            <div className="kpi-value">
                                {formatCurrency(metrics.totals.spend)}
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-label">ROAS</div>
                            <div className="kpi-value">
                                {roas > 0 ? `${roas.toFixed(2)}x` : "—"}
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-label">Conversions</div>
                            <div className="kpi-value">
                                {formatNumber(metrics.totals.conversions)}
                            </div>
                            <div className="kpi-sub">
                                {conversionRate.toFixed(1)}% conv. rate
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-label">Sessions</div>
                            <div className="kpi-value">
                                {formatNumber(metrics.totals.sessions)}
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-label">Impressions</div>
                            <div className="kpi-value">
                                {formatNumber(metrics.totals.impressions)}
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-label">Clicks</div>
                            <div className="kpi-value">
                                {formatNumber(metrics.totals.clicks)}
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-label">Avg. CPC</div>
                            <div className="kpi-value">
                                {metrics.totals.clicks > 0
                                    ? formatCurrency(
                                        metrics.totals.spend / metrics.totals.clicks
                                    )
                                    : "—"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Channel breakdown */}
                <div className="section">
                    <div className="section-title">Revenue by channel</div>

                    {metrics.byChannel.map((channel) => {
                        const maxRevenue = Math.max(
                            ...metrics.byChannel.map((c) => c.revenue)
                        );
                        const pct =
                            maxRevenue > 0
                                ? Math.round((channel.revenue / maxRevenue) * 100)
                                : 0;

                        return (
                            <div key={channel.channel} className="channel-row">
                                <div style={{ minWidth: "120px", fontWeight: 500 }}>
                                    {channel.channel}
                                </div>

                                <div className="channel-bar-wrap">
                                    <div
                                        className="channel-bar"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>

                                <div style={{ minWidth: "100px", textAlign: "right" }}>
                                    {formatCurrency(channel.revenue)}
                                </div>

                                <div
                                    style={{
                                        minWidth: "80px",
                                        textAlign: "right",
                                        color: "#71717a",
                                        fontSize: "12px",
                                    }}
                                >
                                    {formatNumber(channel.sessions)} sessions
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Top campaigns */}
                <div className="section">
                    <div className="section-title">Top campaigns</div>

                    <table>
                        <thead>
                            <tr>
                                <th>Campaign</th>
                                <th>Channel</th>
                                <th className="text-right">Revenue</th>
                                <th className="text-right">Spend</th>
                                <th className="text-right">ROAS</th>
                                <th className="text-right">Conv.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.topCampaigns.map((row, index) => {
                                const rowRoas =
                                    row.spend > 0 ? row.revenue / row.spend : null;

                                const badgeClass =
                                    rowRoas === null
                                        ? "badge-green"
                                        : rowRoas >= 3
                                            ? "badge-green"
                                            : rowRoas >= 1
                                                ? "badge-amber"
                                                : "badge-red";

                                return (
                                    <tr key={`${row.campaign}-${index}`}>
                                        <td style={{ fontWeight: 500 }}>{row.campaign}</td>
                                        <td style={{ color: "#71717a" }}>{row.channel}</td>
                                        <td className="text-right">
                                            {formatCurrency(row.revenue)}
                                        </td>
                                        <td className="text-right" style={{ color: "#71717a" }}>
                                            {formatCurrency(row.spend)}
                                        </td>
                                        <td className="text-right">
                                            <span className={`badge ${badgeClass}`}>
                                                {calculateROAS(row.revenue, row.spend)}
                                            </span>
                                        </td>
                                        <td className="text-right" style={{ color: "#71717a" }}>
                                            {formatNumber(row.conversions)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="footer">
                    <div>
                        {report.organization.name} • Confidential
                    </div>
                    <div>
                        Generated by Client Reporting Dashboard
                    </div>
                </div>
            </body>
        </html>
    );
}