import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { useRefreshToken } from './auth';
import { accessAtom, userAtom } from '@/atoms/auth';
import { loadingAtom } from '@/atoms/misc';

const push = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push }),
}));

const httpGet = vi.fn();
vi.mock('@/hooks/http', () => ({
    useHttp: () => ({ get: httpGet }),
}));

const store = getDefaultStore();

function b64url(obj: unknown) {
    return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

/** Build a decodable (unsigned) JWT whose exp is `secondsFromNow` away. */
function makeToken(secondsFromNow: number) {
    const exp = Math.floor(Date.now() / 1000) + secondsFromNow;
    return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ exp })}.sig`;
}

function setToken(secondsFromNow: number) {
    store.set(accessAtom, {
        type: 'Bearer',
        token: makeToken(secondsFromNow),
    } as never);
}

beforeEach(() => {
    vi.clearAllMocks();
    store.set(accessAtom, null);
    store.set(userAtom, null);
    store.set(loadingAtom, false);
});

afterEach(() => {
    vi.useRealTimers();
});

describe('useRefreshToken — derived state', () => {
    it('reports an unauthenticated, non-expired baseline with no token', () => {
        const { result } = renderHook(() =>
            useRefreshToken({ requireAuth: false }),
        );
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isAccessExpired).toBe(false);
        expect(result.current.needsRefresh).toBe(false);
        expect(result.current.timeUntilExpiry).toBe(0);
    });

    it('reports authenticated and healthy for a far-future token', () => {
        setToken(3600);
        const { result } = renderHook(() =>
            useRefreshToken({ requireAuth: false }),
        );
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isAccessExpired).toBe(false);
        expect(result.current.needsRefresh).toBe(false);
        expect(result.current.timeUntilExpiry).toBeGreaterThan(0);
    });

    it('flags an expired token as needing refresh', () => {
        httpGet.mockRejectedValue(new Error('offline'));
        setToken(-10);
        const { result } = renderHook(() =>
            useRefreshToken({ requireAuth: false }),
        );
        expect(result.current.isAccessExpired).toBe(true);
        expect(result.current.needsRefresh).toBe(true);
    });
});

describe('useRefreshToken — redirects', () => {
    it('redirects to /login after the initial check when no token is present', async () => {
        vi.useFakeTimers();
        renderHook(() => useRefreshToken({ initialCheckDelay: 50 }));
        await act(async () => {
            vi.advanceTimersByTime(100);
        });
        expect(push).toHaveBeenCalledWith('/login');
    });

    it('redirects with a return param when redirectTo is set', async () => {
        vi.useFakeTimers();
        renderHook(() =>
            useRefreshToken({
                initialCheckDelay: 50,
                redirectTo: '/dashboard',
            }),
        );
        await act(async () => {
            vi.advanceTimersByTime(100);
        });
        expect(push).toHaveBeenCalledWith('/login?return=%2Fdashboard');
    });

    it('redirects when the session is cleared after the initial check', async () => {
        vi.useFakeTimers();
        setToken(3600);
        renderHook(() =>
            useRefreshToken({ requireAuth: true, initialCheckDelay: 10 }),
        );
        await act(async () => {
            await vi.advanceTimersByTimeAsync(20);
        });
        expect(push).not.toHaveBeenCalled();
        await act(async () => {
            store.set(accessAtom, null);
        });
        expect(push).toHaveBeenCalledWith('/login');
    });

    it('manual refresh without a token redirects immediately when auth is required', async () => {
        const { result } = renderHook(() =>
            useRefreshToken({ requireAuth: true, initialCheckDelay: 100000 }),
        );
        await act(async () => {
            await result.current.refreshToken();
        });
        expect(push).toHaveBeenCalledWith('/login');
    });
});

describe('useRefreshToken — refresh flow', () => {
    it('manual refresh stores the new session on success', async () => {
        setToken(3600);
        httpGet.mockResolvedValue({
            data: {
                access: { type: 'Bearer', token: makeToken(7200) },
                user: { id: 'u2' },
            },
        });
        const { result } = renderHook(() =>
            useRefreshToken({ requireAuth: false }),
        );
        await act(async () => {
            await result.current.refreshToken(false);
        });
        expect(httpGet).toHaveBeenCalledWith('/v1/auth/refresh');
        expect((store.get(userAtom) as { id: string }).id).toBe('u2');
    });

    it('logs out and redirects when the refresh returns 401', async () => {
        setToken(3600);
        httpGet.mockRejectedValue({
            isAxiosError: true,
            response: { status: 401 },
        });
        const { result } = renderHook(() =>
            useRefreshToken({ requireAuth: false }),
        );
        await act(async () => {
            await result.current.refreshToken(false);
        });
        expect(push).toHaveBeenCalledWith('/login');
        expect(store.get(accessAtom)).toBeNull();
    });

    it('logs out when the refresh response is missing a token and retries are exhausted', async () => {
        setToken(3600);
        httpGet.mockResolvedValue({ data: { access: {}, user: {} } });
        const { result } = renderHook(() =>
            useRefreshToken({ requireAuth: false, maxRetries: 1 }),
        );
        await act(async () => {
            await result.current.refreshToken(false);
        });
        expect(push).toHaveBeenCalledWith('/login');
    });

    it('toggles the loading overlay around a manual refresh', async () => {
        setToken(3600);
        let resolve!: (v: unknown) => void;
        httpGet.mockReturnValue(
            new Promise((r) => {
                resolve = r;
            }),
        );
        const { result } = renderHook(() =>
            useRefreshToken({ requireAuth: false }),
        );
        let pending!: Promise<boolean>;
        act(() => {
            pending = result.current.refreshToken(true);
        });
        expect(store.get(loadingAtom)).toBe(true);
        await act(async () => {
            resolve({
                data: {
                    access: { type: 'Bearer', token: makeToken(7200) },
                    user: { id: 'u3' },
                },
            });
            await pending;
        });
        expect(store.get(loadingAtom)).toBe(false);
    });
});

describe('useRefreshToken — scheduling', () => {
    it('fires a proactive background refresh when the scheduled delay elapses', async () => {
        vi.useFakeTimers();
        httpGet.mockResolvedValue({
            data: {
                access: { type: 'Bearer', token: makeToken(7200) },
                user: { id: 'u4' },
            },
        });
        setToken(5);
        renderHook(() =>
            useRefreshToken({ requireAuth: false, refreshBuffer: 1000 }),
        );
        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000);
        });
        expect(httpGet).toHaveBeenCalledWith('/v1/auth/refresh');
    });

    it('retries after a transient failure then succeeds', async () => {
        vi.useFakeTimers();
        setToken(3600);
        httpGet
            .mockRejectedValueOnce(new Error('network'))
            .mockResolvedValueOnce({
                data: {
                    access: { type: 'Bearer', token: makeToken(7200) },
                    user: { id: 'u5' },
                },
            });
        const { result } = renderHook(() =>
            useRefreshToken({ requireAuth: false, retryDelay: 10 }),
        );
        await act(async () => {
            await result.current.refreshToken(false);
        });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(20);
        });
        expect(httpGet).toHaveBeenCalledTimes(2);
        expect(push).not.toHaveBeenCalled();
    });

    it('rate-limits a second non-forced refresh fired too soon', async () => {
        // Token already inside the refresh buffer -> proactive refresh on mount.
        // The refreshed token is *also* soon-expiring, so the resulting
        // reschedule attempts a second non-forced refresh immediately, which
        // the rate limiter must drop.
        setToken(1);
        httpGet.mockResolvedValue({
            data: {
                access: { type: 'Bearer', token: makeToken(2) },
                user: {},
            },
        });
        await act(async () => {
            renderHook(() => useRefreshToken({ requireAuth: false }));
        });
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(httpGet).toHaveBeenCalledTimes(1);
    });

    it('refreshes immediately when the stored token cannot be decoded', async () => {
        httpGet.mockResolvedValue({
            data: {
                access: { type: 'Bearer', token: makeToken(7200) },
                user: { id: 'u6' },
            },
        });
        store.set(accessAtom, { type: 'Bearer', token: 'not-a-jwt' } as never);
        await act(async () => {
            renderHook(() => useRefreshToken({ requireAuth: false }));
        });
        expect(httpGet).toHaveBeenCalledWith('/v1/auth/refresh');
    });
});
