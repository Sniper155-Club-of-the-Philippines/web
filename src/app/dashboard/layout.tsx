'use client';

import NavbarHistory from '@/components/dashboard/NavbarHistory';
import Sidebar from '@/components/dashboard/Sidebar';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { useRefreshToken } from '@/hooks/auth';
import React from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useRefreshToken();

    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset className='flex flex-col h-screen'>
                <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
                    <SidebarTrigger className='-ml-1 block md:hidden' />
                    <Separator
                        orientation='vertical'
                        className='mr-2 data-[orientation=vertical]:h-4 block md:hidden'
                    />
                    <NavbarHistory />
                </header>

                <div className='flex-1 p-6 md:max-w-[calc(100vw-255px)]'>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
