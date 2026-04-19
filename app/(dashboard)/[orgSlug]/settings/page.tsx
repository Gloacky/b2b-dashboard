import { requireOrgMembership } from "@/lib/auth/require-org-membership";
import {prisma} from "@/lib/db/prisma";
import { InviteForm } from "@/components/invites/invite-form";
import { formatDateTime } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function SettingsPage({params}:{params:Promise<{orgSlug:string}>}) {
    const {orgSlug} = await params;
    const membership = await requireOrgMembership(orgSlug);

    const canManageMembers = ["OWNER","ADMIN"].includes(membership.role);

    const members=await prisma.membership.findMany({
        where:{organizationId:membership.organizationId},
        include: {
            user:{
                select:{
                    id:true,
                    email:true,
                    name:true,
                },
            },
        },
        orderBy:{createdAt:"asc"},
    });

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <p className="text-sm font-semibold text-zinc-500">Workspace settings</p>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                    {membership.organization.name}
                </h1>
            </header>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
                {canManageMembers && (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="text-lg font-semibold text-zinc-950">Invite team</h2>
                        <p className="mt-2 text-sm text-zinc-600">
                            Invite teammates or clients to this workspace.
                        </p>

                        <div className="mt-6">
                            <InviteForm orgSlug={orgSlug} />
                        </div>
                    </div>
                )}

                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-lg font-semibold text-zinc-950">Members</h2>

                    <div className="mt-6 space-y-3">
                        {members.map((m)=>(
                            <div key={m.id} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                <div>
                                    <p className="font-medium text-zinc-950">
                                        {m.user.name ?? m.user.email}
                                    </p>
                                    <p className="text-xs text-zinc-500">{m.user.email}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                                        {m.role}
                                    </span>
                                    <p className="text-xs text-zinc-400">
                                        {formatDateTime(m.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}