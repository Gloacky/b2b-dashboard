"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({children}:{children: React.ReactNode}){
    const {pending} = useFormStatus();

    return (
        <button type="submit" disabled={pending} className="inline-flex h-11 w-full items-center justify-center rounded-xl  px-4 text-sm font-medium text-black transition hover:bg-zinc-800 hover:text-white disabled:curson-not-allowed disabled:opacity-60">
            {pending ? "Creating workspace...":children}
        </button>
    );
}