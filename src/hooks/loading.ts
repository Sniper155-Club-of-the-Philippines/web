'use client';

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { loadingAtom } from '@/atoms/misc';

/**
 * Drive the global loading overlay from a boolean, e.g. a react-query
 * `isLoading`/`isPending` flag while a form or its data is loading:
 *
 *     const { data, isLoading } = useQuery(...);
 *     useLoadingEffect(isLoading);
 *
 * The overlay is cleared when `active` turns false or the component unmounts.
 */
export function useLoadingEffect(active: boolean) {
    const setLoading = useSetAtom(loadingAtom);

    useEffect(() => {
        setLoading(active);

        return () => {
            if (active) {
                setLoading(false);
            }
        };
    }, [active, setLoading]);
}
