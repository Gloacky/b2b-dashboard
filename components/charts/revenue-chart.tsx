"use client";

import {ResponsiveContainer,LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,Legend} from "recharts";

type DailyData = {
    date:string;
    revenue:number;
    spend:number;
};

function formatCurrency(value:number){
    return new Intl.NumberFormat("en-us",{
        style:"currency",
        currency:"USD",
        minimumFractionDigits:0,
        maximumFractionDigits:0,
    }).format(value);
}

function formatDateLabel(dateStr:string){
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-us",{
        month:"short",
        day:"numeric",
    });
}

export function RevenueChart({data}:{data:DailyData[]}){
    if (data.length===0){
        return(
            <div className="flex h-80 items-center justify-between rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500">
                No data for selected date range
            </div>
        );
    }

    return(
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{top:10,right:10,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />

                    <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 12, fill: "#71717a" }} tickLine={false} axisLine={{ stroke:"#e4e4e7"}} />
                    <YAxis
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 12, fill: "#71717a" }}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                    />

                    <Tooltip
                        formatter={(value: any, name: any) => [
                            formatCurrency(Number(value)),
                            String(name).charAt(0).toUpperCase() + String(name).slice(1),
                        ]}
                        labelFormatter={(label: any) => formatDateLabel(label as string)}
                        contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e4e4e7",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                    />
                    
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                    />

                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#18181b"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="spend"
                        stroke="#a1a1aa"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}