import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAtom } from 'jotai';
import { accessAtom, userAtom } from '@/atoms/auth';
import { Access } from '@/types/models/auth';
import { RESET } from 'jotai/utils';
import { useHttp } from '@/hooks/http';
import { User } from '@/types/models/user';
import { loadingAtom } from '@/atoms/misc';

type JWTPayload = {
    exp: number;
    iat?: number;
};

type RefreshConfig = {
    refreshBuffer?: number; // Time before expiry to refresh (ms)
    minRefreshDelay?: number; // Minimum delay between refresh attempts (ms)
    maxRetries?: number; // Maximum retry attempts on failure
    retryDelay?: number; // Delay between retry attempts (ms)
};

const DEFAULT_CONFIG: Required<RefreshConfig> = {
    refreshBuffer: 5 * 60 * 1000, // 5 minutes
    minRefreshDelay: 1000, // 1 second
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
};

export function useRefreshToken(config: RefreshConfig = {}) {
    const finalConfig = useMemo(
        () => ({ ...DEFAULT_CONFIG, ...config }),
        [config]
    );
    const http = useHttp();
    const [access, setAccess] = useAtom(accessAtom);
    const [, setUser] = useAtom(userAtom);
    const [, setLoading] = useAtom(loadingAtom);
    const router = useRouter();

    const refreshState = useRef({
        inProgress: false,
        timeoutId: null as NodeJS.Timeout | null,
        retryCount: 0,
        lastRefreshAttempt: 0,
    });

    const mounted = useRef(true);

    const clearRefreshTimeout = useCallback(() => {
        if (refreshState.current.timeoutId) {
            clearTimeout(refreshState.current.timeoutId);
            refreshState.current.timeoutId = null;
        }
    }, []);

    const logout = useCallback(() => {
        if (!mounted.current) return;

        clearRefreshTimeout();
        refreshState.current = {
            inProgress: false,
            timeoutId: null,
            retryCount: 0,
            lastRefreshAttempt: 0,
        };

        // Hide loading overlay on logout
        setLoading(false);
        setUser(RESET);
        setAccess(RESET);
        router.push('/login');
    }, [setAccess, setUser, router, clearRefreshTimeout, setLoading]);

    const isTokenExpired = useCallback((token: string): boolean => {
        try {
            const decoded = jwtDecode<JWTPayload>(token);
            const exp = decoded.exp * 1000;
            return Date.now() >= exp;
        } catch {
            return true;
        }
    }, []);

    const getTokenExpiryTime = useCallback((token: string): number | null => {
        try {
            const decoded = jwtDecode<JWTPayload>(token);
            return decoded.exp * 1000;
        } catch {
            return null;
        }
    }, []);

    const shouldRefreshToken = useCallback(
        (token: string): boolean => {
            const expiryTime = getTokenExpiryTime(token);
            if (!expiryTime) return false;

            const now = Date.now();
            const timeUntilExpiry = expiryTime - now;

            return timeUntilExpiry <= finalConfig.refreshBuffer;
        },
        [getTokenExpiryTime, finalConfig.refreshBuffer]
    );

    const refreshToken = useCallback(
        async (forceRefresh = false, showLoading = false): Promise<boolean> => {
            const now = Date.now();

            // Prevent multiple concurrent refresh attempts
            if (refreshState.current.inProgress && !forceRefresh) {
                console.debug('Refresh already in progress, skipping');
                return false;
            }

            // Rate limiting: prevent too frequent refresh attempts
            const timeSinceLastAttempt =
                now - refreshState.current.lastRefreshAttempt;
            if (
                timeSinceLastAttempt < finalConfig.minRefreshDelay &&
                !forceRefresh
            ) {
                console.debug(
                    'Rate limiting: too soon since last refresh attempt'
                );
                return false;
            }

            if (!mounted.current) return false;

            refreshState.current.inProgress = true;
            refreshState.current.lastRefreshAttempt = now;

            // Show loading overlay for user-initiated refreshes or when token is expired
            if (
                showLoading ||
                (access?.token && isTokenExpired(access.token))
            ) {
                setLoading(true);
            }

            try {
                console.debug('Attempting to refresh token...');

                const { data } = await http.get<{ access: Access; user: User }>(
                    '/v1/auth/refresh'
                );

                if (!mounted.current) return false;

                // Validate the new token
                if (!data.access?.token || isTokenExpired(data.access.token)) {
                    throw new Error(
                        'Received invalid or expired token from refresh endpoint'
                    );
                }

                setAccess(data.access);
                setUser(data.user);

                // Reset retry count on success
                refreshState.current.retryCount = 0;

                console.debug('Token refreshed successfully');
                return true;
            } catch (error) {
                console.warn('Failed to refresh token:', error);

                if (!mounted.current) return false;

                refreshState.current.retryCount++;

                // If we've exhausted retries or got a 401/403, logout
                if (
                    refreshState.current.retryCount >= finalConfig.maxRetries ||
                    (error as any)?.response?.status === 401 ||
                    (error as any)?.response?.status === 403
                ) {
                    console.error(
                        'Token refresh failed permanently, logging out'
                    );
                    logout();
                    return false;
                }

                // Schedule retry - don't show loading for automatic retries
                console.debug(
                    `Scheduling refresh retry ${refreshState.current.retryCount}/${finalConfig.maxRetries} in ${finalConfig.retryDelay}ms`
                );

                refreshState.current.timeoutId = setTimeout(() => {
                    refreshToken(true, false);
                }, finalConfig.retryDelay);

                return false;
            } finally {
                refreshState.current.inProgress = false;
                // Always hide loading when done (only if we showed it)
                if (
                    showLoading ||
                    (access?.token && isTokenExpired(access.token))
                ) {
                    setLoading(false);
                }
            }
        },
        [
            http,
            setAccess,
            setUser,
            logout,
            isTokenExpired,
            finalConfig,
            mounted,
            setLoading,
            access?.token,
        ]
    );

    const scheduleRefresh = useCallback(
        (token: string) => {
            const expiryTime = getTokenExpiryTime(token);
            if (!expiryTime) {
                console.warn('Cannot schedule refresh: invalid token');
                logout();
                return;
            }

            const now = Date.now();
            const refreshAt = expiryTime - finalConfig.refreshBuffer;
            const delay = Math.max(
                refreshAt - now,
                finalConfig.minRefreshDelay
            );

            // Clear any existing timeout
            clearRefreshTimeout();

            // If token should be refreshed immediately
            if (shouldRefreshToken(token)) {
                console.info('Token expires soon, refreshing immediately');
                refreshToken(false, false); // Background refresh, no loading
                return;
            }

            // Schedule future refresh
            refreshState.current.timeoutId = setTimeout(() => {
                if (mounted.current && access?.token) {
                    refreshToken(false, false); // Background refresh, no loading
                }
            }, delay);

            console.debug(
                `Token refresh scheduled in ${Math.round(delay / 1000)}s`
            );
        },
        [
            getTokenExpiryTime,
            shouldRefreshToken,
            refreshToken,
            clearRefreshTimeout,
            logout,
            finalConfig,
            access?.token,
        ]
    );

    // Handle page load and token changes
    useEffect(() => {
        if (!access?.token || !mounted.current) {
            clearRefreshTimeout();
            return;
        }

        // Check if token is already expired
        if (isTokenExpired(access.token)) {
            console.warn('Current token is expired, logging out');
            logout();
            return;
        }

        // Schedule refresh based on token expiry
        scheduleRefresh(access.token);

        return clearRefreshTimeout;
    }, [
        access?.token,
        scheduleRefresh,
        clearRefreshTimeout,
        isTokenExpired,
        logout,
    ]);

    // Cleanup on unmount
    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
            clearRefreshTimeout();
        };
    }, [clearRefreshTimeout]);

    // Manual refresh function (useful for handling 401 responses)
    const manualRefresh = useCallback(
        async (showLoading = true): Promise<boolean> => {
            if (!access?.token) {
                console.warn('No token available for manual refresh');
                return false;
            }

            return refreshToken(true, showLoading);
        },
        [refreshToken, access?.token]
    );

    // Check if token needs refresh soon
    const needsRefresh = useMemo(() => {
        if (!access?.token) return false;
        return shouldRefreshToken(access.token);
    }, [access?.token, shouldRefreshToken]);

    return {
        refreshToken: manualRefresh,
        isRefreshing: refreshState.current.inProgress,
        needsRefresh,
        retryCount: refreshState.current.retryCount,
        timeUntilExpiry: access?.token
            ? Math.max(0, (getTokenExpiryTime(access.token) ?? 0) - Date.now())
            : 0,
    };
}
