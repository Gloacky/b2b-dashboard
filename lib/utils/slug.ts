export function slugifyOrganizationName(value:string){
    const slug = value
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
    return slug || "organization";
}