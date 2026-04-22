"use client";

import { useFormStatus } from "react-dom";

export function InlineSubmitButton({children,variant="default"}:{children:React.ReactNode;variant?:"default" | "danger" | "ghost";}){
    const {pending} = useFormStatus();

    const styles = variant === "danger"
        ? "border-red-200 text-red-700 hover:bg-red-50"
        : variant === "ghost"
            ? "border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            : "border-zinc-900 bg-zinc-950 text-white hover:bg-zinc-800";

    return (
        <button type="submit" disabled={pending} className={`inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${styles}`}>
            {pending ? "Working..." : children}
        </button>
    );
}