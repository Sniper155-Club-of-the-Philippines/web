'use client';

import * as React from 'react';

import {
    Sidebar as BaseSidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import Navbar from '@/components/dashboard/Navbar';
import Logo from '@/components/root/Logo';
import SidebarUser from '@/components/dashboard/SidebarUser';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import { userAtom } from '@/atoms/auth';
import { filterRoutes } from '@/lib/permissions';
import { useAtomValue } from 'jotai';

export default function Sidebar({
    ...props
}: React.ComponentProps<typeof BaseSidebar>) {
    const user = useAtomValue(userAtom);
    const visibleRoutes = filterRoutes(routes, user);

    return (
        <BaseSidebar collapsible='icon' {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size='lg' asChild>
                            <Link href='/dashboard'>
                                <div className='text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                                    <Logo />
                                </div>
                                <div className='grid flex-1 text-left text-sm leading-tight'>
                                    <span className='truncate font-medium'>
                                        S155CP Inc
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {visibleRoutes.map((route) => (
                    <Navbar
                        key={route.title}
                        title={route.title}
                        items={route.routes}
                    />
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarUser />
            </SidebarFooter>
            <SidebarRail />
        </BaseSidebar>
    );
}
