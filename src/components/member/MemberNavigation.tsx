'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    House,
    ReceiptText,
    Settings,
    ShoppingBag,
    Store,
    UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const memberRoutes = [
    { label: 'Home', href: '/member', icon: House, exact: true },
    { label: 'Merchandise', href: '/member/merchandise', icon: Store },
    { label: 'Cart', href: '/member/cart', icon: ShoppingBag },
    { label: 'Orders', href: '/member/orders', icon: ReceiptText },
    { label: 'Profile', href: '/member/profile', icon: UserRound },
    { label: 'Settings', href: '/member/settings', icon: Settings },
] as const;

export default function MemberNavigation({
    mobile = false,
}: {
    mobile?: boolean;
}) {
    const pathname = usePathname();

    return (
        <nav
            aria-label='Member portal'
            className={cn(
                'flex items-center gap-1',
                mobile && 'w-full justify-around',
            )}
        >
            {memberRoutes.map((route) => {
                const active =
                    'exact' in route && route.exact
                        ? pathname === route.href
                        : pathname.startsWith(route.href);
                const Icon = route.icon;

                return (
                    <Button
                        key={route.href}
                        asChild
                        variant={active ? 'secondary' : 'ghost'}
                        size='sm'
                        className={cn(
                            mobile &&
                                'h-auto min-w-0 flex-1 flex-col gap-0.5 px-0.5 py-2',
                        )}
                    >
                        <Link
                            href={route.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(mobile && 'min-w-0')}
                        >
                            <Icon className={cn(mobile && 'size-4 shrink-0')} />
                            <span
                                className={cn(
                                    mobile &&
                                        'max-w-full truncate text-[10px] leading-tight',
                                )}
                            >
                                {route.label}
                            </span>
                        </Link>
                    </Button>
                );
            })}
        </nav>
    );
}
