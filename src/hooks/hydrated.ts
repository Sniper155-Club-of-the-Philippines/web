import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False during the server render and the hydration render, true afterwards.
 * Gate client-only state (e.g. auth read from localStorage) behind it so the
 * first client render matches the server HTML, even inside a Suspense
 * boundary that hydrates after that state has already loaded.
 */
export function useHydrated(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
}
