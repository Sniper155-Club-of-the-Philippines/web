import { searchArray } from '@/lib/utils';
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
