import "server-only";

export type ScheduleFrequency = "WEEKLY" | "MONTHLY";

export function getNextRunAt(args:{from:Date;frequency:ScheduleFrequency}){
    const next = new Date(args.from);

    if (args.frequency === "WEEKLY"){
        next.setDate(next.getDate() + 7);
        return next;
    }

    next.setMonth(next.getMonth() + 1);
    return next;
}

export function getReportWindow(args:{now:Date;frequency:ScheduleFrequency}){
    const to = new Date(args.now);
    const from = new Date(args.now);

    if (args.frequency === "WEEKLY"){
        from.setDate(from.getDate()-6);
    }else{
        from.setDate(from.getDate()-29);
    }

    from.setHours(0,0,0,0);
    to.setHours(23,59,59,999);

    return {from,to};
}