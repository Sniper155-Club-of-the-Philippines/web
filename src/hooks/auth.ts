import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAtom } from 'jotai';
import { accessAtom, tokenInterceptorAtom, userAtom } from '@/atoms/auth';
import { http } from '@/lib/http';
import { Access } from '@/types/auth';
import { RESET } from 'jotai/utils';

type JWTPayload = {
    exp: number;
};

export function useRefreshToken() {
    const [access, setAccess] = useAtom(accessAtom);
    const [, setUser] = useAtom(userAtom);
    const router = useRouter();
    const refreshInProgress = useRef(false);
    const [interceptor, setInterceptor] = useAtom(tokenInterceptorAtom);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!access?.token) return;

        const decoded = jwtDecode<JWTPayload>(access.token);
        const exp = decoded.exp * 1000; // seconds → ms
        const now = Date.now();
        const refreshAt = exp - 5 * 60 * 1000; // 5 min before expiry
        const delay = Math.max(refreshAt - now, 0);

        // schedule refresh once at the right time
        timeoutId.current = setTimeout(async () => {
            if (refreshInProgress.current) return;
            refreshInProgress.current = true;

            try {
                const { data } = await http.get<{ access: Access }>(
                    '/v1/auth/refresh'
                );
                setAccess(data.access);
                setUser(null);

                // remove old interceptor if it exists
                if (interceptor) {
                    interceptor();
                }

                // add new interceptor with latest token
                const removeInterceptor = http.addRequestInterceptor(
                    (request) => {
                        request.headers = {
                            ...(request.headers || {}),
                            Authorization: `${data.access.type} ${data.access.token}`,
                        };
                        return request;
                    }
                );

                setInterceptor(removeInterceptor);
            } catch (e) {
                console.error('Failed to refresh token', e);
                setAccess(RESET);
                setUser(RESET);
                router.push('/login');
            } finally {
                refreshInProgress.current = false;
            }
        }, delay);

        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
                timeoutId.current = null;
            }
        };
    }, [router, access, setAccess, setUser, interceptor, setInterceptor]);
}
