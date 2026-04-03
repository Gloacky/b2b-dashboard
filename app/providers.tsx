'use client';

import { NeonAuthUIProvider } from '@neondatabase/auth/react/ui';
import { authClient } from '@/lib/auth/client';



export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NeonAuthUIProvider authClient={authClient} social={{
            providers: ['google', 'github', 'vercel'], // Enable Google, GitHub, and Vercel sign-in
        }}>
            {children}
        </NeonAuthUIProvider>
    );
}