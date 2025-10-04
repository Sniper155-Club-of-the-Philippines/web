'use client';

import { usePathname, useParams } from 'next/navigation';

interface Breadcrumb {
    title: string;
    url: string;
}

export function useRouteBreadcrumbs(): Breadcrumb[] {
    const pathname = usePathname();
    const params = useParams();

    if (!pathname) return [];

    // Split path into segments
    let segments = pathname.split('/').filter(Boolean);

    // Remove leading "dashboard" from breadcrumb labels
    const hasDashboard = segments[0] === 'dashboard';
    if (hasDashboard) {
        segments = segments.slice(1);
    }

    // Build breadcrumbs
    const breadcrumbs: Breadcrumb[] = segments.map((segment, index) => {
        // Replace dynamic segment ([id], [slug], etc.) with actual param value
        let title = segment;
        if (title.startsWith('[') && title.endsWith(']')) {
            const paramKey = title.slice(1, -1);
            const paramValue = params?.[paramKey];
            title = paramValue ? String(paramValue) : paramKey;
        }

        // Build URL up to this segment
        const url =
            (hasDashboard ? '/dashboard/' : '/') +
            segments
                .slice(0, index + 1)
                .map((s) => {
                    if (s.startsWith('[') && s.endsWith(']')) {
                        const paramKey = s.slice(1, -1);
                        return params?.[paramKey]
                            ? String(params[paramKey])
                            : paramKey;
                    }
                    return s;
                })
                .join('/');

        return {
            title: formatTitle(title),
            url,
        };
    });

    return breadcrumbs;
}

// Format segment titles into something more readable
function formatTitle(segment: string): string {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
}
