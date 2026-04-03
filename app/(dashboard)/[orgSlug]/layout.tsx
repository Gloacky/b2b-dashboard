import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { requireAuthenticatedUser } from "@/lib/auth/require-authenticated-user";

export default async function OrganizationLayout({children,params,}:{children:ReactNode;params:Promise<{orgSlug:string}>;}){
    const {orgSlug} = await params;
    const user = await requireAuthenticatedUser();

    const currentMembership = user.memberships.find(
        (membership) => membership.organization.slug === orgSlug
    );

    if(!currentMembership){
        notFound();
    }

    const organizations = user.memberships.map((membership)=>({
        slug: membership.organization.slug,
        name: membership.organization.name,
        role: membership.role,
    }));

    return(
        <div className="min-h-screen bg-zinc-50">
            <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
                <DesktopSidebar currentOrgSlug={orgSlug} currentOrgName={currentMembership.organization.name} organizations={organizations} user={{name:user.name,email:user.email}}/>

                <div className="min-w-0">
                    <MobileSidebar currentOrgSlug={orgSlug}
                    currentOrgName={currentMembership.organization.name}
                    organizations={organizations}
                    user={{
                        name: user.name,
                        email: user.email,
                    }}/>

                    <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
                </div>
            </div>
        </div>
    );
}