import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAtom } from 'jotai';
import { accessAtom, googleAtom, userAtom } from '@/atoms/auth';
import { Access } from '@/types/models/auth';
import { RESET } from 'jotai/utils';
import { useHttp } from '@/hooks/http';
import { googleLogout } from '@react-oauth/google';

type JWTPayload = {
    exp: number;
};

const REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes in ms
const MIN_REFRESH_DELAY = 1000; // 1 second minimum delay

export function useRefreshToken() {
    const http = useHttp();
    const [access, setAccess] = useAtom(accessAtom);
    const [google, setGoogle] = useAtom(googleAtom);
    const [, setUser] = useAtom(userAtom);
    const router = useRouter();
    const refreshInProgress = useRef(false);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    const mounted = useRef(true);

    const clearRefreshTimeout = useCallback(() => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
            timeoutId.current = null;
        }
    }, []);

    const logout = useCallback(() => {
        if (!mounted.current) return;

        if (google) {
            try {
                googleLogout();
            } catch (error) {
                console.error(error);
            }
        }

        setUser(RESET);
        setGoogle(RESET);
        setAccess(RESET);

        router.push('/login');
    }, [setAccess, setUser, router, google, setGoogle]);

    const refreshToken = useCallback(async (): Promise<boolean> => {
        if (refreshInProgress.current || !mounted.current) {
            return false;
        }

        refreshInProgress.current = true;

        try {
            const { data } = await http.get<{ access: Access }>(
                '/v1/auth/refresh'
            );

            if (!mounted.current) return false;

            setAccess(data.access);
            // Don't reset user - let other components handle user data refresh if needed
            return true;
        } catch (error) {
            console.error('Failed to refresh token:', error);

            if (!mounted.current) return false;

            logout();
            return false;
        } finally {
            refreshInProgress.current = false;
        }
    }, [http, setAccess, logout]);

    const scheduleRefresh = useCallback(
        (token: string) => {
            try {
                const decoded = jwtDecode<JWTPayload>(token);
                const exp = decoded.exp * 1000; // Convert to milliseconds
                const now = Date.now();
                const refreshAt = exp - REFRESH_BUFFER;
                const delay = Math.max(refreshAt - now, MIN_REFRESH_DELAY);

                // If token is already expired or expires very soon, refresh immediately
                if (delay <= MIN_REFRESH_DELAY) {
                    console.warn(
                        'Token expires very soon, refreshing immediately'
                    );
                    refreshToken();
                    return;
                }

                clearRefreshTimeout();

                timeoutId.current = setTimeout(() => {
                    refreshToken();
                }, delay);

                console.debug(
                    `Token refresh scheduled in ${Math.round(delay / 1000)}s`
                );
            } catch (error) {
                console.error('Invalid token format:', error);
                logout();
            }
        },
        [refreshToken, clearRefreshTimeout, logout]
    );

    // Handle immediate refresh on page load/refresh
    const handlePageLoad = useCallback(
        async (token: string) => {
            try {
                const decoded = jwtDecode<JWTPayload>(token);
                const exp = decoded.exp * 1000;
                const now = Date.now();

                // If token expires within the buffer time, refresh immediately
                if (exp - now <= REFRESH_BUFFER) {
                    console.info('Token expires soon, refreshing on page load');
                    const success = await refreshToken();

                    // If refresh failed, don't schedule another one
                    if (!success) return;

                    // Schedule next refresh with the new token
                    // Note: This assumes the new token is available in the atom after refresh
                    // You might need to adjust this based on your state management
                    return;
                }

                // Token is still valid, schedule normal refresh
                scheduleRefresh(token);
            } catch (error) {
                console.error('Error handling page load token check:', error);
                logout();
            }
        },
        [refreshToken, scheduleRefresh, logout]
    );

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
            clearRefreshTimeout();
        };
    }, [clearRefreshTimeout]);

    useEffect(() => {
        if (!access?.token || !mounted.current) {
            clearRefreshTimeout();
            return;
        }

        // Handle both initial load and token updates
        handlePageLoad(access.token);

        return clearRefreshTimeout;
    }, [access?.token, handlePageLoad, clearRefreshTimeout]);

    // Expose refresh function for manual use (e.g., on 401 responses)
    return {
        refreshToken,
        isRefreshing: refreshInProgress.current,
    };
}
