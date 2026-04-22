import { deleteReportScheduleAction, runReportScheduleNowAction,toggleReportScheduleAction } from "@/actions/report-schedule";
import { InlineSubmitButton } from "@/components/ui/inline-submit-button";
import { formatDateTime } from "../../lib/utils/date";

type ReportScheduleItem = {
    id:string;
    name:string;
    recipientEmail:string;
    frequency: "WEEKLY" | "MONTHLY";
    active: boolean;
    lastRunAt: Date | null;
    nextRunAt: Date | null;
    createdAt: Date | null;
};

function FrequencyBadge({frequency}:{frequency:"WEEKLY" | "MONTHLY"}){
    return (
        <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700">
            {frequency}
        </span>
    );
}

function ActiveBadge({active}:{active:boolean}){
    return active ? (
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-neutral-700">
            Active
        </span>
    ):(
        <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-600">
            Paused
        </span>
    )
}

export function ReportScheduleList({orgSlug,schedules}:{orgSlug:string;schedules:ReportScheduleItem[]}){
    if (schedules.length===0){
        return(
            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
                No scheduled reports yet.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {schedules.map((schedule)=>(
                <article key={schedule.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-zinc-950">{schedule.name}</p>
                                <FrequencyBadge frequency={schedule.frequency} />
                                <ActiveBadge active={schedule.active} />
                            </div>

                            <p className="text-sm text-zinc-600">{schedule.recipientEmail}</p>

                            <p className="text-xs text-zinc-500">
                                Next run: {formatDateTime(schedule.nextRunAt)}
                            </p>

                            <p className="text-xs text-zinc-400">
                                Last run: {formatDateTime(schedule.lastRunAt)}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <form action={runReportScheduleNowAction}>
                                <input type="hidden" name="orgSlug" value={orgSlug} />
                                <input type="hidden" name="scheduleId" value={schedule.id} />
                                <InlineSubmitButton>Run now</InlineSubmitButton>
                            </form>

                            <form action={toggleReportScheduleAction}>
                                <input type="hidden" name="orgSlug" value={orgSlug} />
                                <input type="hidden" name="scheduleId" value={schedule.id} />
                                <InlineSubmitButton variant="ghost">{schedule.active ? "Pause" : "Resume"}</InlineSubmitButton>
                            </form>

                            <form action={runReportScheduleNowAction}>
                                <input type="hidden" name="orgSlug" value={orgSlug} />
                                <input type="hidden" name="scheduleId" value={schedule.id} />
                                <InlineSubmitButton variant="danger">Delete</InlineSubmitButton>
                            </form>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}