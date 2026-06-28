import { RouteSection } from '@/types/routes';
import {
    BadgeCheck,
    IdCard,
    LayoutDashboard,
    ShoppingBag,
    SquareRadical,
    UsersRound,
} from 'lucide-react';

export const main: RouteSection = {
    title: 'Administration',
    routes: [
        {
            title: 'Club',
            url: '/dashboard/club',
            icon: UsersRound,
            items: [
                {
                    title: 'Members',
                    url: '/dashboard/club/members',
                    permission: 'users.viewAny',
                },
                {
                    title: 'Chapters',
                    url: '/dashboard/club/chapters',
                    permission: 'chapters.viewAny',
                },
            ],
        },
    ],
};

export const management: RouteSection = {
    title: 'Management',
    routes: [
        {
            title: 'Site Content',
            url: '/dashboard/management',
            icon: LayoutDashboard,
            items: [
                {
                    title: 'Landing Page',
                    url: '/dashboard/management/landing-page',
                    permission: 'site-content.view',
                },
                {
                    title: 'Contact Info',
                    url: '/dashboard/management/contact-info',
                    permission: 'site-content.view',
                },
                {
                    title: 'Events',
                    url: '/dashboard/management/events',
                    permission: 'events.viewAny',
                },
            ],
        },
        {
            title: 'Forms',
            url: '/dashboard/forms',
            icon: SquareRadical,
            items: [
                {
                    title: 'Manage',
                    url: '/dashboard/forms/manage',
                    permission: 'forms.viewAny',
                    items: [
                        {
                            title: 'Create',
                            url: '/dashboard/forms/manage/create',
                            hidden: true,
                        },
                        {
                            title: '[id]',
                            url: '/dashboard/forms/manage/[id]',
                            hidden: true,
                            items: [
                                {
                                    title: 'Edit',
                                    url: '/dashboard/forms/manage/[id]/edit',
                                    hidden: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    title: 'Responses',
                    url: '/dashboard/forms/responses',
                    permission: 'forms.viewAny',
                },
            ],
        },
    ],
};

export const identification: RouteSection = {
    title: 'Identification',
    routes: [
        {
            title: 'Generation',
            url: '/dashboard/generation',
            icon: IdCard,
            items: [
                {
                    title: 'Member Profile',
                    url: '/dashboard/generation/member-profile',
                    permission: 'users.viewAny',
                },
                {
                    title: 'NFC ID',
                    url: '/dashboard/generation/nfc-id',
                    permission: 'users.viewAny',
                },
            ],
        },
    ],
};

export const store: RouteSection = {
    title: 'Merchandise',
    routes: [
        {
            title: 'Configuration',
            url: '/dashboard/store',
            icon: ShoppingBag,
            items: [
                {
                    title: 'Orders',
                    url: '/dashboard/store/orders',
                    permission: 'orders.viewAny',
                },
                {
                    title: 'Settings',
                    url: '/dashboard/store/settings',
                    permission: 'store-settings.view',
                },
                {
                    title: 'Batches',
                    url: '/dashboard/store/batches',
                    permission: 'batches.viewAny',
                },
                {
                    title: 'Products',
                    url: '/dashboard/store/products',
                    permission: 'products.viewAny',
                },
                {
                    title: 'Payment Methods',
                    url: '/dashboard/store/payment-methods',
                    permission: 'payment-methods.viewAny',
                },
            ],
        },
    ],
};

export const access: RouteSection = {
    title: 'Access',
    routes: [
        {
            title: 'Authorization',
            url: '/dashboard/access',
            icon: BadgeCheck,
            items: [
                {
                    title: 'Roles',
                    url: '/dashboard/access/roles',
                    permission: 'roles.viewAny',
                },
            ],
        },
    ],
};

export const routes: RouteSection[] = [
    main,
    management,
    store,
    access,
    identification,
];
