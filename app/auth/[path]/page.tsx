import { AuthView } from '@neondatabase/auth/react/ui';
import { authViewPaths } from '@neondatabase/auth/react/ui/server';
import { getCurrentAppUser } from "@/lib/auth/get-current-app-user";
import {redirect} from "next/navigation";

export function generateStaticParams() {
    return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
    const { path } = await params;

    const user = await getCurrentAppUser();
    
      if (user) {
        redirect("/onboarding");
      }

    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <AuthView pathname={path} />
        </main>
    );
}