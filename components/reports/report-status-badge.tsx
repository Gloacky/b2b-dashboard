export function ReportStatusBadge({
    status,
}: {
    status: "DRAFT" | "QUEUED" | "READY" | "FAILED";
}) {
    const styles =
        status === "READY"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : status === "FAILED"
                ? "border-red-200 bg-red-50 text-red-700"
                : status === "QUEUED"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600";

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles}`}
        >
            {status}
        </span>
    );
}