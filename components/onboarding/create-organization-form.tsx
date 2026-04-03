"use client";

import { useActionState } from "react";

import { createOrganizationAction } from "@/actions/organizations";
import {initialCreateOrganizationState} from "@/lib/forms/create-organization-state";
import { SubmitButton } from "@/components/ui/submit-button";

export function CreateOrganizationForm() {
    const [state, formAction] = useActionState(
        createOrganizationAction,
        initialCreateOrganizationState
    );

    return (
        <form action={formAction} className="space-y-5">
            <div className="space-y-2">
                <label
                    htmlFor="organization-name"
                    className="text-sm font-medium text-zinc-500"
                >
                    Organization name
                </label>

                <input
                    id="organization-name"
                    name="name"
                    type="text"
                    autoComplete="organization"
                    required
                    minLength={2}
                    maxLength={80}
                    className="block h-11 w-full rounded-xl border border-zinc-300 bg-black px-4 text-sm outline-none transition focus:border-zinc-900"
                    placeholder="Acme Growth Studio"
                />

                <p className="text-xs leading-5 text-zinc-500">
                    We’ll create the workspace URL automatically from this name.
                </p>
            </div>

            {state.error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {state.error}
                </p>
            ) : null}

            <SubmitButton>Create workspace</SubmitButton>
        </form>
    );
}