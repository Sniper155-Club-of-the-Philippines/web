import type { LucideIcon } from 'lucide-react';

export interface RouteItem {
    title: string;
    url: string;
}

export interface Route {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: RouteItem[];
}

export interface RouteSection {
    title: string;
    routes: Route[];
}

export interface BreadcrumbData {
    route: Route;
    routeItem: RouteItem | null;
}

export interface Breadcrumb {
    title: string;
    url: string;
}
