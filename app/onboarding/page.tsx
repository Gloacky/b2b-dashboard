import {redirect} from "next/navigation";
import { requireAuthenticatedUser } from "@/lib/auth/require-authenticated-user";
import { CreateOrganizationForm } from "@/components/onboarding/create-organization-form";

export default async function OnboardingPage() {
    const user = await requireAuthenticatedUser();

    if(user.memberships.length>0){
        redirect(`/${user.memberships[0].organization.slug}/dashboard`);
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-black p-6 shadow-sm sm:p-8">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Create your first workspace
                    </h1>
                </div>

                <div className="mt-8">
                    <CreateOrganizationForm />
                </div>
            </div>
        </main>
    );
} 