import type { User } from '@/types/models/user';
import type { Route, RouteItem, RouteSection } from '@/types/routes';

export function hasPermission(user: User | null, permission?: string): boolean {
    if (!permission) return true;
    if (!user) return false;
    if (user.roles?.includes('admin')) return true;

    return user.permissions?.includes(permission) ?? false;
}

function filterItems(items: RouteItem[], user: User | null): RouteItem[] {
    return items
        .filter((item) => hasPermission(user, item.permission))
        .map((item) => ({
            ...item,
            items: item.items ? filterItems(item.items, user) : undefined,
        }));
}

export function filterRoutes(
    sections: RouteSection[],
    user: User | null,
): RouteSection[] {
    return sections
        .map((section) => ({
            ...section,
            routes: section.routes
                .filter((route) => hasPermission(user, route.permission))
                .map((route): Route => ({
                    ...route,
                    items: route.items
                        ? filterItems(route.items, user)
                        : undefined,
                }))
                .filter((route) => !route.items || route.items.length > 0),
        }))
        .filter((section) => section.routes.length > 0);
}
