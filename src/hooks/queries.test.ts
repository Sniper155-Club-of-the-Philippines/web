import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultStore } from 'jotai';
import { chapter, event, form, profile, setting, user } from '@/api';
import { loadingAtom } from '@/atoms/misc';
import {
    useChapterQuery,
    useEventQuery,
    useFormQuery,
    useFormResponseQuery,
    useFormResponsesQuery,
    useFormsQuery,
    useProfileQuery,
    useSettingQuery,
    useUserQuery,
} from './queries';

vi.mock('@/api', () => ({
    user: { all: vi.fn() },
    setting: { all: vi.fn() },
    chapter: { all: vi.fn() },
    event: { all: vi.fn() },
    profile: { all: vi.fn() },
    form: {
        all: vi.fn(),
        show: vi.fn(),
        responses: vi.fn(),
        answers: vi.fn(),
    },
}));

function wrapper() {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return function TestQueryProvider({ children }: { children: ReactNode }) {
        return createElement(QueryClientProvider, { client }, children);
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    getDefaultStore().set(loadingAtom, false);
});

describe('collection queries', () => {
    it('useUserQuery fetches users and toggles loading', async () => {
        vi.mocked(user.all).mockResolvedValue([{ id: 'u1' }] as never);
        const { result } = renderHook(() => useUserQuery(), {
            wrapper: wrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([{ id: 'u1' }]);
        expect(user.all).toHaveBeenCalled();
        expect(getDefaultStore().get(loadingAtom)).toBe(false);
    });

    it('useSettingQuery passes the group filter', async () => {
        vi.mocked(setting.all).mockResolvedValue([{ id: 's1' }] as never);
        const { result } = renderHook(
            () => useSettingQuery({ group: 'landing-page' }),
            { wrapper: wrapper() },
        );
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(setting.all).toHaveBeenCalledWith(expect.anything(), {
            group: 'landing-page',
        });
    });

    it('useChapterQuery fetches chapters', async () => {
        vi.mocked(chapter.all).mockResolvedValue([{ id: 'c1' }] as never);
        const { result } = renderHook(() => useChapterQuery(), {
            wrapper: wrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([{ id: 'c1' }]);
    });

    it('useEventQuery fetches events', async () => {
        vi.mocked(event.all).mockResolvedValue([{ id: 'e1' }] as never);
        const { result } = renderHook(() => useEventQuery(), {
            wrapper: wrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([{ id: 'e1' }]);
    });

    it('useProfileQuery fetches profiles', async () => {
        vi.mocked(profile.all).mockResolvedValue([{ id: 'p1' }] as never);
        const { result } = renderHook(() => useProfileQuery(), {
            wrapper: wrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([{ id: 'p1' }]);
    });

    it('useFormsQuery forwards params', async () => {
        vi.mocked(form.all).mockResolvedValue([{ id: 'f1' }] as never);
        const { result } = renderHook(
            () => useFormsQuery({ active: true } as never),
            { wrapper: wrapper() },
        );
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(form.all).toHaveBeenCalledWith(expect.anything(), {
            active: true,
        });
    });
});

describe('single form queries', () => {
    it('useFormQuery fetches one form by id', async () => {
        vi.mocked(form.show).mockResolvedValue({ id: 'f1' } as never);
        const { result } = renderHook(() => useFormQuery('f1'), {
            wrapper: wrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(form.show).toHaveBeenCalledWith(expect.anything(), 'f1');
    });

    it('useFormResponsesQuery returns [] for a missing id without calling the api', async () => {
        const { result } = renderHook(() => useFormResponsesQuery(null), {
            wrapper: wrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([]);
        expect(form.responses).not.toHaveBeenCalled();
    });

    it('useFormResponsesQuery fetches responses for an id', async () => {
        vi.mocked(form.responses).mockResolvedValue([{ id: 'r1' }] as never);
        const { result } = renderHook(() => useFormResponsesQuery('f1'), {
            wrapper: wrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual([{ id: 'r1' }]);
    });

    it('useFormResponseQuery fetches a single response', async () => {
        vi.mocked(form.answers).mockResolvedValue({ id: 'r1' } as never);
        const { result } = renderHook(() => useFormResponseQuery('r1'), {
            wrapper: wrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(form.answers).toHaveBeenCalledWith(expect.anything(), 'r1');
    });

    it('useFormResponsesQuery with loading flag toggles loadingAtom', async () => {
        let resolve!: (v: unknown) => void;
        vi.mocked(form.responses).mockReturnValue(
            new Promise((r) => {
                resolve = r;
            }) as never,
        );
        const { result } = renderHook(() => useFormResponsesQuery('f1', true), {
            wrapper: wrapper(),
        });
        await waitFor(() =>
            expect(getDefaultStore().get(loadingAtom)).toBe(true),
        );
        resolve([{ id: 'r1' }]);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(getDefaultStore().get(loadingAtom)).toBe(false);
    });

    it('useFormResponseQuery with loading flag toggles loadingAtom', async () => {
        let resolve!: (v: unknown) => void;
        vi.mocked(form.answers).mockReturnValue(
            new Promise((r) => {
                resolve = r;
            }) as never,
        );
        const { result } = renderHook(() => useFormResponseQuery('r1', true), {
            wrapper: wrapper(),
        });
        await waitFor(() =>
            expect(getDefaultStore().get(loadingAtom)).toBe(true),
        );
        resolve({ id: 'r1' });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(getDefaultStore().get(loadingAtom)).toBe(false);
    });

    it('useFormQuery with loading flag flips loadingAtom during the fetch', async () => {
        let resolve!: (v: unknown) => void;
        vi.mocked(form.show).mockReturnValue(
            new Promise((r) => {
                resolve = r;
            }) as never,
        );
        const { result } = renderHook(() => useFormQuery('f1', true), {
            wrapper: wrapper(),
        });
        await waitFor(() =>
            expect(getDefaultStore().get(loadingAtom)).toBe(true),
        );
        resolve({ id: 'f1' });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(getDefaultStore().get(loadingAtom)).toBe(false);
    });
});
