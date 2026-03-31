export function formatDate(value:Date | null | undefined){
    if (!value) return "No data";

    return new Intl.DateTimeFormat("en-US",{dateStyle:"medium",}).format(value);
}

export function formatDateTime(value: Date | null | undefined){
    if(!value) return "Never";

    return new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short"}).format(value);
}