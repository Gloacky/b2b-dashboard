'use client';

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    // Force a refresh to clear server-side cache and 
                    // redirect to the sign-in page or home.
                    router.push("/auth/sign-in");
                    router.refresh();
                },
            },
        });
    };

    return (
        <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-red-600 tracking-[0.16em] hover:bg-red-50 rounded-md transition-colors"
        >
            Sign Out
        </button>
    );
}