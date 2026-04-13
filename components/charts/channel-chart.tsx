"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Rectangle
} from "recharts";

type ChannelData={
    channel: string;
    revenue: number;
    spend: number;
};

const COLORS = [
    "#18181b",
    "#3f3f46",
    "#52525b",
    "#71717a",
    "#a1a1aa",
    "#d4d4d8",
];

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function ChannelChart({ data }: { data: ChannelData[] }) {
    if (data.length === 0) {
        return (
            <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500">
                No channel data available
            </div>
        );
    }

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <XAxis
                        type="number"
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 12, fill: "#71717a" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e4e4e7" }}
                    />

                    <YAxis
                        type="category"
                        dataKey="channel"
                        tick={{ fontSize: 12, fill: "#71717a" }}
                        tickLine={false}
                        axisLine={false}
                        width={90}
                    />

                    <Tooltip
                        formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
                        contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e4e4e7",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                    />

                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                        {data.map((_, index) => (
                            <Rectangle
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}