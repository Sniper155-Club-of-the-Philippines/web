import { routes } from '@/lib/routes';
import type { RouteSection, BreadcrumbData, Breadcrumb } from '@/types/routes';
import { usePathname } from 'next/navigation';

export function useParseBreadcrumbsFromUrl(
    routes: RouteSection[]
): BreadcrumbData | null {
    // For App Router
    const currentPath = usePathname();

    // Remove /dashboard prefix and clean the path
    const cleanPath = currentPath.replace('/dashboard', '').split('?')[0];

    // If we're at the dashboard root, return null
    if (!cleanPath || cleanPath === '/') {
        return null;
    }

    // Find matching route and item
    for (const section of routes) {
        for (const route of section.routes) {
            const routeCleanPath = route.url.replace('/dashboard', '');

            if (cleanPath === routeCleanPath) {
                return {
                    route,
                    routeItem: null,
                };
            }

            if (route.items) {
                for (const item of route.items) {
                    const itemCleanPath = item.url.replace('/dashboard', '');
                    if (cleanPath === itemCleanPath) {
                        return {
                            route,
                            routeItem: item,
                        };
                    }
                }
            }
        }
    }

    return {
        route: {
            title: cleanPath
                .split('/')
                .filter(Boolean)
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(' / '), // crude title generation
            url: currentPath,
        },
        routeItem: null,
    };
}

export function useRouteBreadcrumbs(): Breadcrumb[] {
    const breadcrumbData = useParseBreadcrumbsFromUrl(routes);

    if (!breadcrumbData) {
        return [];
    }

    const breadcrumbs: Breadcrumb[] = [
        {
            title: breadcrumbData.route.title,
            url: breadcrumbData.route.url,
        },
    ];

    if (breadcrumbData.routeItem) {
        breadcrumbs.push({
            title: breadcrumbData.routeItem.title,
            url: breadcrumbData.routeItem.url,
        });
    }

    return breadcrumbs;
}
