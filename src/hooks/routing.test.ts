import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRouteBreadcrumbs } from './routing';

const nav = vi.hoisted(() => ({
    pathname: '/dashboard',
    params: {} as Record<string, string>,
}));

vi.mock('next/navigation', () => ({
    usePathname: () => nav.pathname,
    useParams: () => nav.params,
}));

afterEach(() => {
    nav.pathname = '/dashboard';
    nav.params = {};
});

describe('useRouteBreadcrumbs', () => {
    it('returns [] when pathname is empty', () => {
        nav.pathname = '';
        const { result } = renderHook(() => useRouteBreadcrumbs());
        expect(result.current).toEqual([]);
    });

    it('drops the leading dashboard segment from labels but keeps it in urls', () => {
        nav.pathname = '/dashboard/users';
        const { result } = renderHook(() => useRouteBreadcrumbs());
        expect(result.current).toEqual([
            { title: 'Users', url: '/dashboard/users' },
        ]);
    });

    it('builds nested breadcrumbs with capitalized titles', () => {
        nav.pathname = '/dashboard/forms/responses';
        const { result } = renderHook(() => useRouteBreadcrumbs());
        expect(result.current).toEqual([
            { title: 'Forms', url: '/dashboard/forms' },
            { title: 'Responses', url: '/dashboard/forms/responses' },
        ]);
    });

    it('resolves dynamic [param] segments via useParams', () => {
        nav.pathname = '/dashboard/forms/[id]';
        nav.params = { id: 'abc123' };
        const { result } = renderHook(() => useRouteBreadcrumbs());
        expect(result.current).toEqual([
            { title: 'Forms', url: '/dashboard/forms' },
            { title: 'Abc123', url: '/dashboard/forms/abc123' },
        ]);
    });

    it('falls back to the param key when no value is present', () => {
        nav.pathname = '/forms/[id]';
        nav.params = {};
        const { result } = renderHook(() => useRouteBreadcrumbs());
        expect(result.current).toEqual([
            { title: 'Forms', url: '/forms' },
            { title: 'Id', url: '/forms/id' },
        ]);
    });
});
