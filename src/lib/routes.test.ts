import { describe, expect, it } from 'vitest';
import { identification, main, management, routes } from './routes';

describe('route sections', () => {
    it('exposes the three sections in order', () => {
        expect(routes).toEqual([main, management, identification]);
        expect(routes.map((s) => s.title)).toEqual([
            'Administration',
            'Management',
            'Identification',
        ]);
    });

    it('lists the club sub-routes', () => {
        const club = main.routes[0];
        expect(club.url).toBe('/dashboard/club');
        expect(club.items?.map((i) => i.url)).toEqual([
            '/dashboard/club/members',
            '/dashboard/club/chapters',
        ]);
    });

    it('marks the nested form create/edit routes as hidden', () => {
        const forms = management.routes.find((r) => r.title === 'Forms');
        const manage = forms?.items?.find((i) => i.title === 'Manage');
        const create = manage?.items?.find((i) => i.title === 'Create');
        const edit = manage?.items
            ?.find((i) => i.title === '[id]')
            ?.items?.find((i) => i.title === 'Edit');

        expect(create?.hidden).toBe(true);
        expect(edit?.hidden).toBe(true);
        expect(edit?.url).toBe('/dashboard/forms/manage/[id]/edit');
    });

    it('attaches an icon to every top-level route', () => {
        for (const section of routes) {
            for (const route of section.routes) {
                expect(route.icon).toBeTruthy();
            }
        }
    });
});
