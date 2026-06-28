'use client';

import NavbarHistory from '@/components/dashboard/NavbarHistory';
import Sidebar from '@/components/dashboard/Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import PortalGuard from '@/components/auth/PortalGuard';
import React from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PortalGuard portal='dashboard'>
            <SidebarProvider>
                <Sidebar />
                <SidebarInset className='h-screen min-w-0 flex-col'>
                    <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
                        <SidebarTrigger className='-ml-1 block md:hidden' />
                        <Separator
                            orientation='vertical'
                            className='mr-2 data-[orientation=vertical]:h-4 block md:hidden'
                        />
                        <NavbarHistory />
                    </header>

                    <ScrollArea
                        className='min-h-0 w-full flex-1'
                        viewportClassName='[&>div]:!block [&>div]:!min-w-0 [&>div]:!w-full'
                    >
                        <div className='min-w-0 w-full p-4 sm:p-6'>
                            {children}
                        </div>
                    </ScrollArea>
                </SidebarInset>
            </SidebarProvider>
        </PortalGuard>
    );
}
