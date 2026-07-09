import { render, renderHook, screen } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { afterEach, describe, expect, it } from 'vitest';
import { loadingAtom } from '@/atoms/misc';
import BaseSpinner from '@/components/root/Spinner';
import { useLoadingEffect } from './loading';

const store = getDefaultStore();

afterEach(() => {
    store.set(loadingAtom, false);
});

describe('useLoadingEffect', () => {
    it('mirrors the active flag into the loading atom', () => {
        const { rerender } = renderHook(
            ({ active }: { active: boolean }) => useLoadingEffect(active),
            { initialProps: { active: true } },
        );
        expect(store.get(loadingAtom)).toBe(true);

        rerender({ active: false });
        expect(store.get(loadingAtom)).toBe(false);
    });

    it('clears the overlay on unmount while still active', () => {
        const { unmount } = renderHook(() => useLoadingEffect(true));
        expect(store.get(loadingAtom)).toBe(true);

        unmount();
        expect(store.get(loadingAtom)).toBe(false);
    });

    it('drives the atom false on mount and leaves it false on unmount when inactive', () => {
        store.set(loadingAtom, true);
        const { unmount } = renderHook(() => useLoadingEffect(false));

        // Mount always writes the flag, so an inactive hook clears the overlay.
        expect(store.get(loadingAtom)).toBe(false);

        // Cleanup is a no-op when inactive, so it stays cleared.
        unmount();
        expect(store.get(loadingAtom)).toBe(false);
    });
});

describe('BaseSpinner', () => {
    it('renders the overlay only while the loading atom is set', () => {
        store.set(loadingAtom, false);
        const { rerender } = render(<BaseSpinner />);
        expect(screen.queryByTitle('Loading...')).not.toBeInTheDocument();

        store.set(loadingAtom, true);
        rerender(<BaseSpinner />);
        expect(screen.getByTitle('Loading...')).toBeInTheDocument();
    });
});
