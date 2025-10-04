import { chapter, event, form, profile, setting, user } from '@/api';
import { loadingAtom } from '@/atoms/misc';
import { useAtom } from 'jotai';
import { useHttp } from '@/hooks/http';
import { UndefinedInitialDataOptions, useQuery } from '@tanstack/react-query';
import type { GetAllParams as FormGetAllParams } from '@/types/api/form';
import { Form } from '@/types/models/form';

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

export function useFormsQuery(params?: FormGetAllParams) {
    const http = useHttp();

    return useQuery({
        queryKey: ['forms', params],
        queryFn: () => form.all(http, params),
    });
}

export function useFormQuery(
    id: string,
    loading = false,
    options: Omit<
        UndefinedInitialDataOptions<Form, Error, Form, string[]>,
        'queryKey' | 'queryFn'
    > = {}
) {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);

    return useQuery({
        queryKey: ['forms', id],
        queryFn: async () => {
            if (loading) {
                setLoading(true);
            }

            try {
                return await form.show(http, id);
            } finally {
                if (loading) {
                    setLoading(false);
                }
            }
        },
        ...options,
    });
}

export function useFormResponsesQuery(id?: string | null, loading = false) {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);

    return useQuery({
        queryKey: ['form-responses', id],
        queryFn: async () => {
            if (!id) {
                return [];
            }

            if (loading) {
                setLoading(true);
            }

            try {
                return await form.responses(http, id);
            } finally {
                if (loading) {
                    setLoading(false);
                }
            }
        },
    });
}

export function useFormResponseQuery(id: string, loading = false) {
    const http = useHttp();
    const [, setLoading] = useAtom(loadingAtom);

    return useQuery({
        queryKey: ['form-response', id],
        queryFn: async () => {
            if (loading) {
                setLoading(true);
            }

            try {
                return await form.answers(http, id);
            } finally {
                if (loading) {
                    setLoading(false);
                }
            }
        },
    });
}
