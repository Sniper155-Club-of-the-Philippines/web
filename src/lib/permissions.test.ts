import { describe, expect, it } from 'vitest';
import { filterRoutes, hasPermission } from '@/lib/permissions';
import type { User } from '@/types/models/user';
import type { RouteSection } from '@/types/routes';

const user = (roles: string[], permissions: string[]) =>
    ({ roles, permissions }) as User;

describe('permission-aware navigation', () => {
    it('grants admins the UI bypass', () => {
        expect(hasPermission(user(['admin'], []), 'roles.delete')).toBe(true);
    });

    it('removes unauthorized routes and empty sections', () => {
        const sections: RouteSection[] = [
            {
                title: 'Store',
                routes: [
                    {
                        title: 'Configuration',
                        url: '/store',
                        items: [
                            {
                                title: 'Products',
                                url: '/products',
                                permission: 'products.viewAny',
                            },
                            {
                                title: 'Roles',
                                url: '/roles',
                                permission: 'roles.viewAny',
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Access',
                routes: [
                    {
                        title: 'Roles',
                        url: '/roles',
                        permission: 'roles.viewAny',
                    },
                ],
            },
        ];

        const visible = filterRoutes(
            sections,
            user(['store-manager'], ['products.viewAny']),
        );

        expect(visible).toHaveLength(1);
        expect(visible[0].routes[0].items?.map((item) => item.title)).toEqual([
            'Products',
        ]);
    });
});
