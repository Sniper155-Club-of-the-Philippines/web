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
    redirectTo?: string | null;
    requireAuth?: boolean; // Whether to redirect when no token is present
    initialCheckDelay?: number; // Delay before initial auth check (ms)
};

const DEFAULT_CONFIG: Required<RefreshConfig> = {
    refreshBuffer: 5 * 60 * 1000, // 5 minutes
    minRefreshDelay: 1000, // 1 second
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
    redirectTo: null,
    requireAuth: true, // Default to requiring authentication
    initialCheckDelay: 100, // Small delay to allow atoms to initialize
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
        initialCheckDone: false, // Track if initial auth check is complete
        hasRedirected: false, // Track if we've already redirected to prevent loops
    });

    const mounted = useRef(true);

    const clearRefreshTimeout = useCallback(() => {
        if (refreshState.current.timeoutId) {
            clearTimeout(refreshState.current.timeoutId);
            refreshState.current.timeoutId = null;
        }
    }, []);

    const logout = useCallback(() => {
        if (!mounted.current || refreshState.current.hasRedirected) return;

        console.debug('Logging out and redirecting to login');
        refreshState.current.hasRedirected = true; // Prevent multiple redirects

        clearRefreshTimeout();
        refreshState.current = {
            inProgress: false,
            timeoutId: null,
            retryCount: 0,
            lastRefreshAttempt: 0,
            initialCheckDone: true, // Mark as done to prevent loops
            hasRedirected: true, // Keep the redirect flag
        };

        // Hide loading overlay on logout
        setLoading(false);
        setUser(RESET);
        setAccess(RESET);

        if (finalConfig.redirectTo) {
            const params = new URLSearchParams();
            params.set('return', finalConfig.redirectTo);
            router.push(`/login?${params.toString()}`);
        } else {
            router.push('/login');
        }
    }, [
        setAccess,
        setUser,
        router,
        clearRefreshTimeout,
        setLoading,
        finalConfig,
    ]);

    // Handle no token scenario
    const handleNoToken = useCallback(() => {
        if (!finalConfig.requireAuth || !mounted.current) return;

        console.debug(
            'No token found and auth is required, redirecting to login'
        );
        logout();
    }, [finalConfig.requireAuth, logout]);

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

            // Show loading overlay when requested
            if (showLoading) {
                setLoading(true);
            }

            try {
                console.debug('Attempting to refresh token...');

                const { data } = await http.get<{ access: Access; user: User }>(
                    '/v1/auth/refresh'
                );

                if (!mounted.current) return false;

                // Validate the new token exists (don't check expiry since it's fresh)
                if (!data.access?.token) {
                    throw new Error('No token received from refresh endpoint');
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

                // If we've exhausted retries or got a 401/403 (refresh TTL expired), logout
                if (
                    refreshState.current.retryCount >= finalConfig.maxRetries ||
                    (error as any)?.response?.status === 401 ||
                    (error as any)?.response?.status === 403
                ) {
                    console.debug(
                        'Token refresh failed permanently (refresh TTL likely expired), logging out'
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
                // Hide loading when requested
                if (showLoading) {
                    setLoading(false);
                }
            }
        },
        [http, setAccess, setUser, logout, finalConfig, mounted, setLoading]
    );

    const scheduleRefresh = useCallback(
        (token: string) => {
            const expiryTime = getTokenExpiryTime(token);
            if (!expiryTime) {
                console.warn(
                    'Cannot schedule refresh: invalid token, attempting refresh anyway'
                );
                // Still try to refresh - the token might be valid for refresh even if we can't decode it
                refreshToken(false, false);
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

            // If token should be refreshed immediately (proactive refresh)
            if (shouldRefreshToken(token)) {
                console.info(
                    'Token expires soon, refreshing immediately (proactive)'
                );
                refreshToken(false, false); // Background refresh, no loading
                return;
            }

            // Schedule future refresh (proactive)
            refreshState.current.timeoutId = setTimeout(() => {
                if (mounted.current && access?.token) {
                    console.info(
                        'Scheduled token refresh triggered (proactive)'
                    );
                    refreshToken(false, false); // Background refresh, no loading
                }
            }, delay);

            console.debug(
                `Token refresh scheduled in ${Math.round(
                    delay / 1000
                )}s (proactive)`
            );
        },
        [
            getTokenExpiryTime,
            shouldRefreshToken,
            refreshToken,
            clearRefreshTimeout,
            finalConfig,
            access?.token,
        ]
    );

    // Initial authentication check with delay
    useEffect(() => {
        if (!finalConfig.requireAuth || refreshState.current.initialCheckDone) {
            return;
        }

        const timeoutId = setTimeout(() => {
            if (!mounted.current) return;

            refreshState.current.initialCheckDone = true;

            if (!access?.token) {
                console.debug('Initial auth check: no token found');
                handleNoToken();
            }
        }, finalConfig.initialCheckDelay);

        return () => clearTimeout(timeoutId);
    }, [
        access?.token,
        finalConfig.requireAuth,
        finalConfig.initialCheckDelay,
        handleNoToken,
    ]);

    // Handle page load and token changes
    useEffect(() => {
        if (!mounted.current) {
            clearRefreshTimeout();
            return;
        }

        // If no token and auth is required, handle it
        if (!access?.token) {
            clearRefreshTimeout();
            // Only handle no token if initial check is done to avoid race conditions
            if (
                refreshState.current.initialCheckDone &&
                finalConfig.requireAuth
            ) {
                handleNoToken();
            }
            return;
        }

        // Always schedule refresh rather than logout immediately
        // Even if token appears expired (access TTL), it might still be valid for refresh (refresh TTL)
        scheduleRefresh(access.token);

        return clearRefreshTimeout;
    }, [
        access?.token,
        scheduleRefresh,
        clearRefreshTimeout,
        handleNoToken,
        finalConfig.requireAuth,
    ]);

    // Cleanup on unmount
    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
            clearRefreshTimeout();
        };
    }, [clearRefreshTimeout]);

    // Manual refresh function (useful for handling 401 responses reactively)
    const manualRefresh = useCallback(
        async (showLoading = true): Promise<boolean> => {
            if (!access?.token) {
                console.warn('No token available for manual refresh');
                if (finalConfig.requireAuth) {
                    handleNoToken();
                }
                return false;
            }

            console.info('Manual token refresh triggered (reactive)');
            return refreshToken(true, showLoading);
        },
        [refreshToken, access?.token, finalConfig.requireAuth, handleNoToken]
    );

    // Check if token needs refresh soon (based on access TTL)
    const needsRefresh = useMemo(() => {
        if (!access?.token) return false;
        return shouldRefreshToken(access.token);
    }, [access?.token, shouldRefreshToken]);

    // Check if token is past its access TTL (but might still be valid for refresh)
    const isAccessExpired = useMemo(() => {
        if (!access?.token) return false;
        return isTokenExpired(access.token);
    }, [access?.token, isTokenExpired]);

    // Check if user is authenticated (has a valid token)
    const isAuthenticated = useMemo(() => {
        return !!access?.token;
    }, [access?.token]);

    return {
        refreshToken: manualRefresh,
        isRefreshing: refreshState.current.inProgress,
        needsRefresh,
        isAccessExpired, // Indicates token is past access TTL but might still be refreshable
        isAuthenticated, // Indicates if user has a token
        retryCount: refreshState.current.retryCount,
        timeUntilExpiry: access?.token
            ? Math.max(0, (getTokenExpiryTime(access.token) ?? 0) - Date.now())
            : 0,
    };
}
