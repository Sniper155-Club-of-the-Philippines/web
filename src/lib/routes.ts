import { RouteSection } from '@/types/routes';
import {
    IdCard,
    LayoutDashboard,
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
                },
                {
                    title: 'Chapters',
                    url: '/dashboard/club/chapters',
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
                },
                {
                    title: 'Contact Info',
                    url: '/dashboard/management/contact-info',
                },
                {
                    title: 'Events',
                    url: '/dashboard/management/events',
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
                },
                {
                    title: 'Responses',
                    url: '/dashboard/forms/responses',
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
                },
                {
                    title: 'NFC ID',
                    url: '/dashboard/generation/nfc-id',
                },
            ],
        },
    ],
};

export const routes: RouteSection[] = [main, management, identification];
