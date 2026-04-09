"use client";

import { useRouter,useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function DateRangeFilter({ from, to,}:{from:string;to:string}){
    const router = useRouter();
    const searchParams=useSearchParams();

    const updateDateRange = useCallback(
        (newFrom:string,newTo:string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("from",newFrom);
            params.set("to",newTo);
            router.push(`?${params.toString()}`);
        },
        [router,searchParams]
    );

    const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateDateRange(e.target.value,to);
    };

    const handleToChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        updateDateRange(from,e.target.value);
    };

    const setPreset = (days:number) => {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        updateDateRange(
            fromDate.toISOString().split("T")[0],
            toDate.toISOString().split("T")[0],
        );
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
                <label htmlFor="from-date" className="text-sm text-zinc-600">
                    From
                </label>
                <input id="from-date" type="date" value={from} onChange={handleFromChange} className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-900" />
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor="to-date" className="text-sm text-zinc-600">
                    To
                </label>
                <input id="to-date" type="date" value={to} onChange={handleToChange} className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-900" />
            </div>

            <div className="flex gap-1">
                <button type="button" onClick={()=> setPreset(7)} className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 transition hover:bg-zinc-100">
                    7d
                </button>
                
                <button type="button" onClick={() => setPreset(30)} className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 transition hover:bg-zinc-100">
                    30d
                </button>

                <button type="button" onClick={() => setPreset(90)} className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 transition hover:bg-zinc-100">
                    90d
                </button>
            </div>
        </div>
    );
}