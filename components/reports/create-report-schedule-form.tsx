"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createReportScheduleAction } from "@/actions/report-schedule";
import {
    initialCreateReportScheduleState,
} from "@/lib/forms/create-report-schedule-state";
import { SubmitButton } from "@/components/ui/submit-button";

export function CreateReportScheduleForm({
    orgSlug,
    disabled,
}: {
    orgSlug: string;
    disabled: boolean;
}) {
    const router = useRouter();
    const [state, formAction] = useActionState(
        createReportScheduleAction,
        initialCreateReportScheduleState
    );

    useEffect(()=>{
        if (state.success){
            router.refresh();
        }
    },[state.success,router]);

    return (
        <form action={formAction} className="space-y-5">
            <input type="hidden" name="orgSlug" value={orgSlug} />

            <div className="space-y-2">
                <label
                    htmlFor="schedule-name"
                    className="text-sm font-medium text-zinc-900"
                >
                    Schedule name
                </label>

                <input
                    id="schedule-name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    disabled={disabled}
                    className="block h-11 w-full text-zinc-900 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100"
                    placeholder="Weekly client summary"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="recipient-email"
                    className="text-sm font-medium text-zinc-900"
                >
                    Recipient email
                </label>

                <input
                    id="recipient-email"
                    name="recipientEmail"
                    type="email"
                    required
                    disabled={disabled}
                    className="block h-11 w-full text-zinc-900 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100"
                    placeholder="client@company.com"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="frequency"
                    className="text-sm font-medium text-zinc-900"
                >
                    Frequency
                </label>

                <select
                    id="frequency"
                    name="frequency"
                    defaultValue="WEEKLY"
                    disabled={disabled}
                    className="block h-11 w-full text-zinc-900 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100"
                >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                </select>
            </div>

            {state.error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {state.error}
                </p>
            ) : null}

            {state.success ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {state.success}
                </p>
            ) : null}

            <SubmitButton>Create schedule</SubmitButton>
        </form>
    );
}