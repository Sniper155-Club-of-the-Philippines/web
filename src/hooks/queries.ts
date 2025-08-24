import { chapter, event, profile, setting, user } from '@/api';
import { loadingAtom } from '@/atoms/misc';
import { useAtom } from 'jotai';
import { useHttp } from '@/hooks/http';
import { useQuery } from '@tanstack/react-query';

export function useUserQuery() {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);

    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            setLoading(true);
            try {
                return await user.all(http);
            } finally {
                setLoading(false);
            }
        },
    });
}

export function useSettingQuery({ group }: { group?: string }) {
    const http = useHttp();

    return useQuery({
        queryKey: ['settings', group],
        queryFn: () =>
            setting.all(http, {
                group,
            }),
    });
}

export function useChapterQuery(loading = true) {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);

    return useQuery({
        queryKey: ['chapters'],
        queryFn: async () => {
            if (loading) {
                setLoading(true);
            }

            try {
                return await chapter.all(http);
            } finally {
                if (loading) {
                    setLoading(false);
                }
            }
        },
    });
}

export function useEventQuery() {
    const http = useHttp();

    return useQuery({
        queryKey: ['events'],
        queryFn: () => event.all(http),
    });
}

export function useProfileQuery() {
    const http = useHttp();

    return useQuery({
        queryKey: ['profiles'],
        queryFn: () => profile.all(http),
    });
}
