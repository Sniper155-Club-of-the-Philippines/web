import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSearchFilter, useVCard } from './data';
import type { Profile } from '@/types/models/profile';

describe('useSearchFilter', () => {
    const items = [
        { name: 'Alice', city: 'Manila' },
        { name: 'Bob', city: 'Cebu' },
    ];

    it('filters items by the search term across keys', () => {
        const { result } = renderHook(() =>
            useSearchFilter(items, 'man', ['city']),
        );
        expect(result.current).toEqual([items[0]]);
    });

    it('returns all items for an empty search', () => {
        const { result } = renderHook(() =>
            useSearchFilter(items, '', ['name']),
        );
        expect(result.current).toBe(items);
    });

    it('memoizes the result for stable inputs', () => {
        const keys: ('name' | 'city')[] = ['name'];
        const { result, rerender } = renderHook(
            ({ s }) => useSearchFilter(items, s, keys),
            { initialProps: { s: 'bob' } },
        );
        const first = result.current;
        rerender({ s: 'bob' });
        expect(result.current).toBe(first);
    });
});

describe('useVCard', () => {
    it('returns null without a profile user', () => {
        const { result } = renderHook(() => useVCard(null));
        expect(result.current).toBeNull();
    });

    it('builds a vcard from the profile', () => {
        const profile = {
            url: 'https://example.com/p/1',
            user: {
                first_name: 'Juan',
                last_name: 'Cruz',
                email: 'juan@example.com',
            },
        } as unknown as Profile;
        const { result } = renderHook(() => useVCard(profile));
        expect(result.current).not.toBeNull();
        expect(result.current!.toString()).toContain('Juan');
    });
});
