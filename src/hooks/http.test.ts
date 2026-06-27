import { describe, expect, it } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { useHttp } from './http';
import { accessAtom } from '@/atoms/auth';

function wrapper(store: ReturnType<typeof createStore>) {
    return ({ children }: { children: ReactNode }) =>
        createElement(Provider, { store }, children);
}

describe('useHttp', () => {
    it('returns a stable axios instance configured from the env base url', () => {
        const store = createStore();
        const { result, rerender } = renderHook(() => useHttp(), {
            wrapper: wrapper(store),
        });
        const http = result.current;
        expect(http.defaults.baseURL).toBe(process.env.NEXT_PUBLIC_API_URL);
        rerender();
        expect(result.current).toBe(http);
    });

    it('sets the Authorization header when an access token is present', () => {
        const store = createStore();
        store.set(accessAtom, { type: 'Bearer', token: 'abc' } as never);
        const { result } = renderHook(() => useHttp(), {
            wrapper: wrapper(store),
        });
        expect(result.current.defaults.headers.Authorization).toBe(
            'Bearer abc',
        );
    });

    it('removes the Authorization header when access is cleared', () => {
        const store = createStore();
        store.set(accessAtom, { type: 'Bearer', token: 'abc' } as never);
        const { result, rerender } = renderHook(() => useHttp(), {
            wrapper: wrapper(store),
        });
        expect(result.current.defaults.headers.Authorization).toBe(
            'Bearer abc',
        );

        store.set(accessAtom, null);
        rerender();
        expect(result.current.defaults.headers.Authorization).toBeUndefined();
    });
});
