'use client';

import MemberPageHeader from '@/components/member/MemberPageHeader';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ReceiptText,
    Settings,
    Store,
    UserRound,
    type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

type PortalFeature = {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
};

// The member portal hub. Merchandise is the first feature to ship here; future
// features (e.g. events, payments) drop in beside it as additional entries.
const features: PortalFeature[] = [
    {
        title: 'Merchandise',
        description: 'Browse and order official S155CP merchandise.',
        href: '/member/merchandise',
        icon: Store,
    },
    {
        title: 'My Orders',
        description: 'Track payments and the status of your orders.',
        href: '/member/orders',
        icon: ReceiptText,
    },
    {
        title: 'Profile',
        description: 'View your membership details and nicknames.',
        href: '/member/profile',
        icon: UserRound,
    },
    {
        title: 'Settings',
        description: 'Manage your account and password.',
        href: '/member/settings',
        icon: Settings,
    },
];

export default function MemberPortalPage() {
    return (
        <>
            <MemberPageHeader
                title='Member Portal'
                description='Your home for everything S155CP membership.'
            />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {features.map((feature) => {
                    const Icon = feature.icon;

                    return (
                        <Link key={feature.href} href={feature.href}>
                            <Card className='h-full transition-colors hover:border-primary'>
                                <CardHeader>
                                    <Icon className='mb-2 size-6 text-primary' />
                                    <CardTitle>{feature.title}</CardTitle>
                                    <CardDescription>
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
