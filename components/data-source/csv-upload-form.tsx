"use client";

import { useActionState } from "react";

import { uploadCsvDataSourceAction } from "@/actions/data-source";
import { initialUploadCsvState } from "@/lib/forms/upload-csv-state";
import { SubmitButton } from "../ui/submit-button";

export function CsvUploadForm({orgSlug,disabled}:{orgSlug:string;disabled:boolean;}){
    const [state,formAction] = useActionState(uploadCsvDataSourceAction,initialUploadCsvState);

    return (
        <form action={formAction} className="space-y-5">
            <input type="hidden" name="orgSlug" value={orgSlug}/>

            <div className="space-y-2">
                <label htmlFor="source-name" className="text-sm font-medium text-zinc-900">
                    Data source name
                </label>
                <input 
                    id="source-name"
                    name="sourceName"
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    disabled={disabled}
                    className="block h-11 w-full text-black rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100"
                    placeholder="March performance import" 
                />  
            </div>

            <div className="space-y-2">
                <label htmlFor="csv-file" className="text-sm font-medium text-zinc-900">
                    CSV file
                </label>

                <input
                    id="csv-file"
                    name="file"
                    type="file"
                    required
                    accept=".csv,text/csv"
                    disabled={disabled}
                    className="block w-full text-black rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
                <p className="text-xs leading-5 text-zinc-500">
                    Files must be 10MB or smaller
                </p>
            </div>

            {disabled ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Your role does not allow imports in this workspace
                </p>
            ):null}

            {state.error ?(
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {state.error}
                </p>
            ):null}

            <SubmitButton>Upload CSV</SubmitButton>
        </form>
    );
}