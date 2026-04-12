type CampaignData={
    campaign: string;
    channel: string;
    revenue: number;
    spend: number;
    clicks:number;
    conversions: number;
};

function formatCurrency(value: number){
    return Intl.NumberFormat("en-US",{
        style:"currency",
        currency:"USD",
        minimumFractionDigits:0,
        maximumFractionDigits:0,
    }).format(value);
}

function formatNumber(value:number){
    return new Intl.NumberFormat("en-US").format(value);
}

function calculateROAS(revenue:number,spend:number){
    if (spend === 0) return "∞";
    return (revenue / spend).toFixed(2) + "x";
}

export function CampaignsTable({data}:{data:CampaignData[]}){
    if (data.length===0){
        return(
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
                No campaign data for selected date range
            </div>
        );
    }

    return (
        <div className="overeflow-x-auto">
            <table className="min-w-full text-left text-sm">
                <thead className="text-zinc-500">
                    <tr className="border-b border-zinc-200">
                        <th className="pb-3 pr-4 font-medium">Campaign</th>
                        <th className="pb-3 pr-4 font-medium">Channel</th>
                        <th className="pb-3 pr-4 font-medium text-right">Revenue</th>
                        <th className="pb-3 pr-4 font-medium text-right">Spend</th>
                        <th className="pb-3 pr-4 font-medium text-right">ROAS</th>
                        <th className="pb-3 pr-4 font-medium text-right">Clicks</th>
                        <th className="pb-3 font-medium text-right">Conv.</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((row,index)=>(
                        <tr key={`${row.campaign}-${row.channel}-${index}`} className="border-b border-zinc-100 last:border-b-0">
                            <td className="py-4 pr-4">
                                <p className="font-medium text-zinc-950">{row.campaign}</p>
                            </td>

                            <td className="py-4 pr-4 text-zinc-600">
                                {formatCurrency(row.revenue)}
                            </td>

                            <td className="py-4 pr-4 text-right text-zinc-600">
                                {formatCurrency(row.spend)}
                            </td>

                            <td className="py-4 pr-4 text-right">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    row.revenue / (row.spend || 1) >=3
                                        ? "bg-emerald-50 text-emerald-700"
                                        : row.revenue / (row.spend || 1) >= 1
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-red-50 text-red-700"
                                }`}
                                >
                                    {calculateROAS(row.revenue,row.spend)}
                                </span>
                            </td>

                            <td className="py-4 text-right text-zinc-600">
                                {formatNumber(row.clicks)}
                            </td>

                            <td className="py-4 text-right text-zinc-600">
                                {formatNumber(row.conversions)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}