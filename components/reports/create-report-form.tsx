"use client";

import { useActionState } from "react";

import { createReportAction } from "@/actions/reports";
import { initialCreateReportState } from "@/lib/forms/create-report-state";
import { SubmitButton } from "../ui/submit-button";

export function CreateReportForm({orgSlug,defaultFrom,defaultTo,disabled}:{orgSlug:string;defaultFrom:string;defaultTo:string;disabled:boolean;}){
    const [state,formAction] = useActionState(createReportAction,initialCreateReportState);

    return (
        <form action={formAction} className="space-y-5">
            <input type="hidden" name="orgSlug" value={orgSlug} />

            <div className="space-y-2">
                <label htmlFor="report-name" className="text-sm font-medium text-zinc-900">Report name</label>

                <input 
                    id="report-name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    disabled={disabled}
                    className="block h-11 w-full rounded-xl border border-zinc-300 bg-white text-zinc-600 px-4 text-sm outline-none transition focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100"
                    placeholder="January Performance Report"    
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="date-from" className="text-sm font-semibold text-zinc-900">
                        From
                    </label>

                    <input
                        id="date-from"
                        name="dateFrom"
                        type="date"
                        required
                        defaultValue={defaultFrom}
                        disabled={disabled}
                        className="block h-11 w-full rounded-xl border border-zinc-300 text-zinc-600 bg-white px-4 text-sm outline-none transition focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="date-to"
                        className="text-sm font-medium text-zinc-900"
                    >
                        To
                    </label>

                    <input
                        id="date-to"
                        name="dateTo"
                        type="date"
                        required
                        defaultValue={defaultTo}
                        disabled={disabled}
                        className="block h-11 w-full rounded-xl border border-zinc-300 text-zinc-600 bg-white px-4 text-sm outline-none transition focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100"
                    />
                </div>
            </div>

            {disabled ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    You do not have permission to generate reports in this workspace.
                </p>
            ):null}

            {state.error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {state.error}
                </p>
            ):null}

            <SubmitButton>Generate PDF report</SubmitButton>
            
        </form>
    );
}