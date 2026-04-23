"use client";

import Link from "next/link";
import {useState} from "react";
import { BarChart3, Building2, Menu, X, Database, FileText, Settings, UserPlus} from "lucide-react";
import { SignOutButton } from "../auth/sign-out-button";


type OrganizationItem = {
    slug: string;
    name: string;
    role:string;
}

export function MobileSidebar({currentOrgSlug,currentOrgName,organizations,user}:{currentOrgSlug:string;currentOrgName:string;organizations:OrganizationItem[];user:{name:string | null; email:string;};}){
    const [open,setOpen] = useState(false);

    return(
        <>
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-whire/95 px-4 py-3 backdrop-blur lg:hidden">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tacking-[0.16em] text-zinc-500">
                        Workspace
                    </p>
                    <p className="truncate text-sm font-semibold text-zinc-950">
                        {currentOrgName}
                    </p>
                </div>

                <button type="button" onClick={()=>setOpen(true)} aria-label="Open navigation" aria-expanded={open} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-950">
                    <Menu className="h-5 w-5"/>
                </button>
            </header>
            <div className={`fixed inset-0 z-40 lg:hidden ${
                open ? "" : "pointer-events-none"
            }`}>
                <button type="button" aria-label="Close navigation overlay" onClick={()=>setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${
                    open ? "opacity-100" : "opacity-0"
                }`}/>

                <aside className={`absolute left-0 top-0 h-full w-[86vw] max-w-sm transform border-r border-zinc-200 bg-white transition-transform ${
                    open ? "translate-x-0": "-translate-x-full"
                }`}
                >
                    <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                <BarChart3 className="h-5 w-5"/>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-zinc-950">
                                    Client Reporting
                                </p>
                                <p className="truncate text-xs text-zinc-500">{currentOrgName}</p>
                            </div>
                        </div>
                        <button type="button" onClick={()=>setOpen(false)} aria-label="Close navigation" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-whire">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="border-b border-zinc-200 px-2 py-4">
                        <p className="truncate text-sm font-medium text-zinc-900">
                            {user.name ?? user.email}
                        </p>
                        <p className="truncate text-xs text-zinc-500">{user.email}</p>
                    </div>

                    <div className="overflow-y-auto px-4 py-6">
                        <div className="space-y-2">
                            <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                Workspace
                            </p>

                            <Link href={`/${currentOrgSlug}/dashboard`} onClick={() =>setOpen(false)} className="flex items-center gap-3 rounded-xl bg-zinc-950 px-3 py-2.5 text-sm font-medium text-white">
                                <BarChart3 className="h-4 w-4"/>
                                    Dashboard  
                            </Link>

                            <Link
                                href={`/${currentOrgSlug}/data-source`}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                            >
                                <Database className="h-4 w-4" />
                                Data sources
                            </Link>

                            <Link
                                href={`/${currentOrgSlug}/reports`}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                            >
                                <FileText className="h-4 w-4" />
                                Reports
                            </Link>

                            <Link
                                href={`/${currentOrgSlug}/settings`}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                            >
                                <UserPlus className="h-4 w-4" />
                                Invite Members
                            </Link>
                        </div>

                        <div className="mt-8 space-y-2">
                            <p className="px-2 text-xs font-semibold uppercase tracking-[0,16em] text-zinc-500">
                                Organization
                            </p>

                            <nav className="space-y-1">
                                {organizations.map((organization) =>{
                                    const isActive = organization.slug === currentOrgSlug;

                                    return(
                                        <Link 
                                            key={organization.slug}
                                            href={`/${organization.slug}/dashboard`}
                                            onClick={()=>setOpen(false)}
                                            prefetch={false}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                                                isActive
                                                    ? "bg-zinc-100 text-zinc-950"
                                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                                            }`}>
                                                <Building2 className="h-4 w-4 shrink-0" />
                                                <div className="min-w-0">
                                                   <p className="truncate font-medium">{organization.name}</p>
                                                   <p className="truncate text-xs text-zinc-500">{organization.role.toLocaleLowerCase()}</p> 
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
            </div>
        </>
    );
}