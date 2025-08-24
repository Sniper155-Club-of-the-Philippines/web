'use client';

import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useAtom } from 'jotai';
import { accessAtom, userAtom } from '@/atoms/auth';
import { auth } from '@/api';
import { useHttp } from '@/hooks/http';
import { RESET } from 'jotai/utils';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function SidebarUser() {
    const { isMobile } = useSidebar();
    const [user, setUser] = useAtom(userAtom);
    const [, setAccess] = useAtom(accessAtom);
    const router = useRouter();

    const http = useHttp();

    const name = `${user?.last_name}, ${user?.first_name}`;
    const email = `${user?.email}`;
    const picture = useMemo(() => {
        if (user) {
            return (
                user?.photo_url ??
                `https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}%20${user?.last_name}`
            );
        }

        return null;
    }, [user]);

    const logout = async () => {
        try {
            await auth.logout(http);
        } catch (error) {
            console.error(error);
        }

        setUser(RESET);
        setAccess(RESET);

        router.push('/login');
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size='lg'
                            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                        >
                            <Avatar className='h-8 w-8 rounded-lg'>
                                {picture && (
                                    <AvatarImage src={picture} alt={name} />
                                )}
                                <AvatarFallback className='rounded-lg'>
                                    CN
                                </AvatarFallback>
                            </Avatar>
                            <div className='grid flex-1 text-left text-sm leading-tight'>
                                <span className='truncate font-medium'>
                                    {name}
                                </span>
                                <span className='truncate text-xs'>
                                    {email}
                                </span>
                            </div>
                            <ChevronsUpDown className='ml-auto size-4' />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                        side={isMobile ? 'bottom' : 'right'}
                        align='end'
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className='p-0 font-normal'>
                            <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                                <Avatar className='h-8 w-8 rounded-lg'>
                                    {picture && (
                                        <AvatarImage src={picture} alt={name} />
                                    )}
                                    <AvatarFallback className='rounded-lg'>
                                        CN
                                    </AvatarFallback>
                                </Avatar>
                                <div className='grid flex-1 text-left text-sm leading-tight'>
                                    <span className='truncate font-medium'>
                                        {name}
                                    </span>
                                    <span className='truncate text-xs'>
                                        {email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Settings />
                                Settings
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
