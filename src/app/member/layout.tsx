'use client';

import PortalGuard from '@/components/auth/PortalGuard';
import MemberHeader from '@/components/member/MemberHeader';
import MemberNavigation from '@/components/member/MemberNavigation';

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PortalGuard portal='member'>
            <div className='bg-muted/30 min-h-svh'>
                <MemberHeader />
                <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 pb-24 sm:px-6 md:pb-8'>
                    {children}
                </main>
                <div className='bg-background fixed inset-x-0 bottom-0 z-40 border-t px-1 pb-[env(safe-area-inset-bottom)] md:hidden'>
                    <MemberNavigation mobile />
                </div>
            </div>
        </PortalGuard>
    );
}
