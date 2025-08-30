import { createVcard, searchArray } from '@/lib/utils';
import { Profile } from '@/types/models/profile';
import { KeyOf } from '@/types/object';
import { useMemo } from 'react';

export function useSearchFilter<T>(
    items: T[] | undefined,
    search: string,
    keys: KeyOf<T>[]
) {
    return useMemo(() => {
        return searchArray(items, search, keys);
    }, [items, search, keys]);
}

export function useVCard(profile?: Profile | null) {
    return useMemo(() => createVcard(profile), [profile]);
}
