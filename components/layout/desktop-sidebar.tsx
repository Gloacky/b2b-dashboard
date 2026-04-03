import Link from "next/link";
import { BarChart3, Building2, Settings } from "lucide-react";
import { SignOutButton } from "../auth/sign-out-button";

type OrganizationItem={
    slug:string;
    name:string;
    role:string;
};

export function DesktopSidebar({currentOrgSlug,currentOrgName,organizations,user}:{currentOrgSlug:string;currentOrgName:string;organizations:OrganizationItem[];user:{name:string | null; email:string;};}){
    return(
        <aside className="sticky top-0 hidden h-screen border-r border-zinc-200 bg-white lg:flex lg:flex-col">
            <div className="border-b border-zinc-200 px-6 py-5">
                <Link href={`/${currentOrgSlug}/dashboard`} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
                        <BarChart3 className="h- w-5"/>
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-950">
                            Client Reporting
                        </p>
                        <p className="truncate text-xs text-zinc-500">{currentOrgName}</p>
                    </div>
                </Link>
            </div>

            <div className="border-b border-zinc-200 px-6 py-4">
                <p className="truncate text-sm font-medium text-zinc-900">
                    {user.name ?? user.email}
                </p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
            </div>

            <div className="mt-8 space-y-2">
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    <Link

                        href="/account/profile"
                        className="flex items-center gap-3 rounded-xl bg-zinc-950 px-3 py-2.5 text-sm font-medium text-white"
                    >
                        <Settings />
                        Account settings
                    </Link>
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="space-y-2">
                    <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Workspace
                    </p>

                    <Link
                        href={`/${currentOrgSlug}/dashboard`}
                        className="flex items-center gap-3 rounded-xl bg-zinc-950 px-3 py-2.5 text-sm font-medium text-white"
                    >
                        <BarChart3 className="h-4 w-4" />
                        Dashboard
                    </Link>
                </div>

                <div className="mt-8 space-y-2">
                    <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Organizations
                    </p>

                    <nav className="space-y-1">
                        {organizations.map((organization) => {
                            const isActive = organization.slug === currentOrgSlug;

                            return (
                                <Link
                                    key={organization.slug}
                                    href={`/${organization.slug}/dashboard`}
                                    prefetch={false}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive
                                            ? "bg-zinc-100 text-zinc-950"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                                        }`}
                                >
                                    <Building2 className="h-4 w-4 shrink-0" />

                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{organization.name}</p>
                                        <p className="truncate text-xs text-zinc-500">
                                            {organization.role.toLowerCase()}
                                        </p>
                                    </div>
                                </Link>


                            );
                        })}
                    </nav>
                </div>

                <div className="mt-8 space-y-2">
                    <SignOutButton />
                </div>

                
            </div>
        </aside>
    );
}