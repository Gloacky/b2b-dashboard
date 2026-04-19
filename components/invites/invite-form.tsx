"use client";

import { useActionState } from "react";
import { createInviteAction } from "@/actions/invites";
import { SubmitButton } from "../ui/submit-button";

export function InviteForm({orgSlug}:{orgSlug:string}){
    const [state,formAction] = useActionState(createInviteAction,{error:null});

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Email</label>
                <input
                    name="email"
                    type="email"
                    required
                    className="h-11 w-full rounded-lg text-zinc-900 border border-zinc-300 px-4 text-sm outline-none focus:border-zinc-900"
                    placeholder="teammate@company.com"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900">Role</label>
                <select
                    name="role"
                    className="h-11 w-full rounded-lg text-zinc-900 border border-zinc-300 px-4 text-sm outline-none focus:border-zinc-900"
                    defaultValue="ANALYST"
                >
                    <option value="ADMIN">Admin</option>
                    <option value="ANALYST">Analyst</option>
                    <option value="CLIENT">Client</option>
                </select>
            </div>

            {state.error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {state.error}
                </p>
            )}

            {state.success && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {state.success}
                </p>
            )}

            <SubmitButton>Send invite</SubmitButton>
        </form>
    );
}