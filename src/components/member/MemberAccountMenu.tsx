'use client';

import { auth } from '@/api';
import { accessAtom, userAtom } from '@/atoms/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useHttp } from '@/hooks/http';
import { hasAdminSideRole } from '@/lib/auth';
import { useAtom } from 'jotai';
import { RESET } from 'jotai/utils';
import { LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MemberAccountMenu() {
    const [user, setUser] = useAtom(userAtom);
    const [, setAccess] = useAtom(accessAtom);
    const http = useHttp();
    const router = useRouter();
    const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
    const initials = [user?.first_name, user?.last_name]
        .filter(Boolean)
        .map((part) => part?.charAt(0))
        .join('')
        .toUpperCase();

    const logout = async () => {
        try {
            await auth.logout(http);
        } catch (error) {
            console.error(error);
        } finally {
            setUser(RESET);
            setAccess(RESET);
            router.push('/login');
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    size='icon'
                    aria-label='Open account menu'
                >
                    <Avatar className='size-8'>
                        {user?.photo_url && (
                            <AvatarImage src={user.photo_url} alt={name} />
                        )}
                        <AvatarFallback>{initials || 'SC'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64'>
                <DropdownMenuLabel>
                    <span className='block truncate'>{name}</span>
                    <span className='text-muted-foreground block truncate text-xs font-normal'>
                        {user?.email}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href='/member/profile'>
                            <UserRound />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    {hasAdminSideRole(user) && (
                        <DropdownMenuItem asChild>
                            <Link href='/dashboard'>
                                <LayoutDashboard />
                                Admin dashboard
                            </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
