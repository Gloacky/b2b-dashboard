import {cache} from "react";
import {notFound} from "next/navigation";
import { requireAuthenticatedUser } from "./require-authenticated-user";

export const requireOrgMembership = cache(async (orgSlug: string)=>{
    const user = await requireAuthenticatedUser();

    const membership = user.memberships.find(
        (item) => item.organization.slug === orgSlug
    );

    if(!membership){
        notFound();
    }
    return membership;
});